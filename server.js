const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const app = express();
const PORT = 3005;

// ── Oracle DB config ──────────────────────────────────────────────────────
const DB_CONFIG = {
    user: 'system',       // replace with your Oracle username if different
    password: 'root',     // replace with your Oracle password if different
    connectString: 'localhost:1521/xe',  // replace if your SID/service name differs
};

// ── Reusable connection function ──────────────────────────────────────────
async function getConnection() {
    return await oracledb.getConnection(DB_CONFIG);
}

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ── Test route ────────────────────────────────────────────────────────────
app.get('/test-db', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute('SELECT 1 FROM DUAL');
        res.json({ status: 'Oracle DB connected', result: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── GET /stations ─────────────────────────────────────────────────────────
app.get('/stations', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.execute(
            'SELECT station_id, station_name, location FROM STATION ORDER BY station_id',
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── POST /login ───────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    let conn;
    try {
        conn = await getConnection();
        
        const query = `
            SELECT passenger_id, username, name, email, phone 
            FROM PASSENGER 
            WHERE username = :u AND password = :p
        `;
        
        const result = await conn.execute(
            query,
            { u: username, p: password },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid User ID or Password' });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                passenger_id: user.PASSENGER_ID,
                username: user.USERNAME,
                name: user.NAME,
                email: user.EMAIL,
                phone: user.PHONE
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── POST /route ───────────────────────────────────────────────────────────
app.post('/route', async (req, res) => {
    const { source_station_id, destination_station_id } = req.body;

    if (!source_station_id || !destination_station_id) {
        return res.status(400).json({ error: 'source_station_id and destination_station_id are required' });
    }

    if (source_station_id === destination_station_id) {
        return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    let conn;
    try {
        conn = await getConnection();

        const query = `
            SELECT 
                r.route_id, 
                r.source_station_id, 
                s1.station_name AS source_station_name, 
                r.destination_station_id, 
                s2.station_name AS destination_station_name,
                (
                    SELECT MIN(ABS(ls1.station_order - ls2.station_order))
                    FROM LINE_STATION ls1
                    JOIN LINE_STATION ls2 ON ls1.line_id = ls2.line_id
                    WHERE ls1.station_id = r.source_station_id
                      AND ls2.station_id = r.destination_station_id
                ) AS num_stations
            FROM ROUTE r
            JOIN STATION s1 ON s1.station_id = r.source_station_id
            JOIN STATION s2 ON s2.station_id = r.destination_station_id
            WHERE r.source_station_id = :src 
              AND r.destination_station_id = :dest
        `;

        const result = await conn.execute(
            query,
            { src: source_station_id, dest: destination_station_id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No route found for the given stations' });
        }

        const dbRow = result.rows[0];
        const stationsCount = dbRow.NUM_STATIONS != null ? dbRow.NUM_STATIONS : 6;
        const fare = stationsCount === 0 ? 5 : stationsCount * 5;

        const routeData = {
            ...dbRow,
            NUM_STATIONS: stationsCount,
            FARE: fare
        };

        res.json([routeData]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── GET /next-trains ──────────────────────────────────────────────────────
app.get('/next-trains', async (req, res) => {
    let conn;
    try {
        conn = await getConnection();

        const query = `
            SELECT 
                SUBSTR(train_number, 1, INSTR(train_number, ' ') - 1) || ' ' || 
                (FLOOR(((CAST(next_departure AS DATE) - TRUNC(CAST(next_departure AS DATE))) * 24 * 60) / 5) + 1) AS train_number,
                frequency_mins, 
                next_departure 
            FROM (
                SELECT
                    t.train_number,
                    s.frequency AS frequency_mins,
                    today_start + NUMTODSINTERVAL(
                        CEIL(
                            GREATEST((SYSDATE - today_start) * 24 * 60, 0) / s.frequency
                        ) * s.frequency + (iter.n * s.frequency),
                        'MINUTE'
                    ) AS next_departure
                FROM SCHEDULE s
                JOIN TRAIN t ON t.train_id = s.train_id
                JOIN (
                    SELECT 
                        schedule_id,
                        TRUNC(SYSDATE) + (CAST(start_time AS DATE) - TRUNC(CAST(start_time AS DATE))) AS today_start
                    FROM SCHEDULE
                ) rebased ON rebased.schedule_id = s.schedule_id
                CROSS JOIN (
                    SELECT LEVEL - 1 AS n FROM DUAL CONNECT BY LEVEL <= 4
                ) iter
                WHERE 
                    SYSDATE <= TRUNC(SYSDATE) + 23/24
            )
            WHERE next_departure <= GREATEST(SYSDATE, TRUNC(SYSDATE) + 5/24) + NUMTODSINTERVAL(30, 'MINUTE')
              AND next_departure <= TRUNC(SYSDATE) + 23/24
            ORDER BY next_departure
        `;

        const result = await conn.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });

        const trains = result.rows.map(row => ({
            train_number: row.TRAIN_NUMBER,
            frequency_mins: row.FREQUENCY_MINS,
            next_departure: row.NEXT_DEPARTURE
        }));

        res.json(trains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── GET /tickets ──────────────────────────────────────────────────────────
app.get('/tickets', async (req, res) => {
    let conn;
    try {
        const p_id = req.query.passenger_id;
        if (!p_id) return res.status(400).json({ error: 'passenger_id is required' });

        conn = await getConnection();

        const query = `
            SELECT 
                t.ticket_id,
                t.booking_time,
                s1.station_name AS source_station_name,
                s2.station_name AS destination_station_name,
                p.payment_method,
                p.payment_status,
                p.transaction_time
            FROM TICKET t
            JOIN ROUTE r ON t.route_id = r.route_id
            JOIN STATION s1 ON r.source_station_id = s1.station_id
            JOIN STATION s2 ON r.destination_station_id = s2.station_id
            LEFT JOIN PAYMENT p ON t.ticket_id = p.ticket_id
            WHERE t.passenger_id = COALESCE((SELECT passenger_id FROM PASSENGER WHERE username = :p_val OR TO_CHAR(passenger_id) = :p_val), -1)
            ORDER BY t.booking_time DESC
        `;

        const result = await conn.execute(query, { p_val: String(p_id) }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── POST /book-ticket ─────────────────────────────────────────────────────
app.post('/book-ticket', async (req, res) => {
    console.log("=== INCOMING BOOKING ===");
    console.log(req.body);

    const { passenger_id, route_id, payment_method } = req.body;
    const r_id = Number(route_id);

    if (!passenger_id || !r_id || isNaN(r_id)) {
        return res.status(400).json({ error: 'passenger_id and valid numeric route_id are required' });
    }

    let conn;
    try {
        conn = await getConnection();

        const ticketSql = `
            INSERT INTO TICKET (passenger_id, route_id, booking_time) 
            VALUES (
                COALESCE((SELECT passenger_id FROM PASSENGER WHERE username = :p_val OR TO_CHAR(passenger_id) = :p_val), 1), 
                :route_id, 
                SYSTIMESTAMP
            )
            RETURNING ticket_id INTO :ticket_id
        `;

        const ticketResult = await conn.execute(
            ticketSql,
            {
                p_val: String(passenger_id),
                route_id: r_id,
                ticket_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            },
            { autoCommit: false }
        );

        const newTicketId = ticketResult.outBinds.ticket_id[0];

        const paymentSql = `
            INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time)
            VALUES (:ticket_id, :method, 'SUCCESS', SYSTIMESTAMP)
        `;

        await conn.execute(
            paymentSql,
            {
                ticket_id: newTicketId,
                method: payment_method || 'UPI'
            },
            { autoCommit: true }
        );

        res.json({
            success: true,
            message: 'Ticket successfully booked!',
            ticket_id: newTicketId
        });

    } catch (err) {
        console.error("=== DB ERROR ===");
        console.error(err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    } finally {
        if (conn) await conn.close();
    }
});

// ── Start server ──────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
