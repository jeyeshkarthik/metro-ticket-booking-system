const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3005;

// ── PostgreSQL DB config ──────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // When deploying to Render, you typically need to allow unauthorized SSL
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(bodyParser.json());
// Serve static frontend files
app.use(express.static(__dirname));

// ── DB connection test route ──────────────────────────────────
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 AS num');
        res.json({ status: 'PostgreSQL DB connected', result: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /stations ─────────────────────────────────────────────
app.get('/stations', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT station_id AS "STATION_ID", station_name AS "STATION_NAME", location AS "LOCATION" FROM STATION ORDER BY station_id'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /login ───────────────────────────────────────────────
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const query = `
            SELECT passenger_id, username, name, email, phone 
            FROM PASSENGER 
            WHERE username = $1 AND password = $2
        `;
        
        const result = await pool.query(query, [username, password]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid User ID or Password' });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            user: {
                passenger_id: user.passenger_id,
                username: user.username,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// ── POST /route ───────────────────────────────────────────────
app.post('/route', async (req, res) => {
    const { source_station_id, destination_station_id } = req.body;

    if (!source_station_id || !destination_station_id) {
        return res.status(400).json({ error: 'source_station_id and destination_station_id are required' });
    }

    if (source_station_id === destination_station_id) {
        return res.status(400).json({ error: 'Source and destination cannot be the same' });
    }

    try {
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
            WHERE r.source_station_id = $1 
              AND r.destination_station_id = $2
        `;

        const result = await pool.query(query, [source_station_id, destination_station_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No route found for the given stations' });
        }

        const dbRow = result.rows[0];
        const stationsCount = dbRow.num_stations != null ? parseInt(dbRow.num_stations, 10) : 6;
        const fare = stationsCount === 0 ? 5 : stationsCount * 5;

        // return UPPERCASE to match script.js expectation where possible, or just the whole row plus keys
        const routeData = {
            ...dbRow,
            ROUTE_ID: dbRow.route_id,
            NUM_STATIONS: stationsCount,
            FARE: fare
        };

        res.json([routeData]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /next-trains ──────────────────────────────────────────
app.get('/next-trains', async (req, res) => {
    try {
        // Rewrite of the Oracle schedule query to PostgreSQL
        // We find the next 4 departure times per train from SCHEDULE considering frequency.
        const query = `
            SELECT 
                split_part(t.train_number, ' ', 1) || ' ' || 
                (FLOOR(EXTRACT(EPOCH FROM (next_departure::time)) / 300) + 1) AS train_number,
                s.frequency AS frequency_mins, 
                next_departure 
            FROM (
                SELECT
                    t.train_number,
                    s.frequency,
                    CURRENT_DATE + s.start_time::time + 
                    (CEIL(GREATEST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - (CURRENT_DATE + s.start_time::time))) / 60, 0) / s.frequency) * s.frequency + (iter.n * s.frequency)) * interval '1 minute' AS next_departure
                FROM SCHEDULE s
                JOIN TRAIN t ON t.train_id = s.train_id
                CROSS JOIN (
                    SELECT generate_series(0, 3) AS n
                ) iter
                WHERE CURRENT_TIMESTAMP <= (CURRENT_DATE + interval '23 hours')
            ) calc
            WHERE calc.next_departure <= GREATEST(CURRENT_TIMESTAMP, CURRENT_DATE + interval '5 hours') + interval '30 minutes'
              AND calc.next_departure <= CURRENT_DATE + interval '23 hours'
            ORDER BY calc.next_departure
        `;

        const result = await pool.query(query);

        // Keep returned properties matching the frontend expect
        const trains = result.rows.map(row => ({
            train_number: row.train_number,
            frequency_mins: row.frequency_mins,
            next_departure: row.next_departure
        }));

        res.json(trains);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── GET /tickets ──────────────────────────────────────────────
app.get('/tickets', async (req, res) => {
    try {
        const p_id = req.query.passenger_id;
        if (!p_id) return res.status(400).json({ error: 'passenger_id is required' });

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
            WHERE t.passenger_id = COALESCE((SELECT passenger_id FROM PASSENGER WHERE username = $1 OR passenger_id::text = $1 LIMIT 1), -1)
            ORDER BY t.booking_time DESC
        `;

        const result = await pool.query(query, [String(p_id)]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── POST /book-ticket ─────────────────────────────────────────
app.post('/book-ticket', async (req, res) => {
    console.log("=== INCOMING BOOKING ===");
    console.log(req.body);

    const { passenger_id, route_id, payment_method } = req.body;
    const r_id = Number(route_id);

    if (!passenger_id || !r_id || isNaN(r_id)) {
        return res.status(400).json({ error: 'passenger_id and valid numeric route_id are required' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert into TICKET and GET ID
        const ticketSql = `
            INSERT INTO TICKET (passenger_id, route_id, booking_time) 
            VALUES (
                COALESCE((SELECT passenger_id FROM PASSENGER WHERE username = $1 OR passenger_id::text = $1 LIMIT 1), 1), 
                $2, 
                CURRENT_TIMESTAMP
            )
            RETURNING ticket_id
        `;

        const ticketResult = await client.query(ticketSql, [String(passenger_id), r_id]);
        const newTicketId = ticketResult.rows[0].ticket_id;

        // Insert into PAYMENT 
        const paymentSql = `
            INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time)
            VALUES ($1, $2, 'SUCCESS', CURRENT_TIMESTAMP)
        `;

        await client.query(paymentSql, [newTicketId, payment_method || 'UPI']);

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'Ticket successfully booked!',
            ticket_id: newTicketId
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("=== DB ERROR ===");
        console.error(err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    } finally {
        client.release();
    }
});

// ── Start server ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
