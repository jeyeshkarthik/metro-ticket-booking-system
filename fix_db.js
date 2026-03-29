const oracledb = require('oracledb');

async function fixDB() {
    let conn;
    try {
        conn = await oracledb.getConnection({
            user: 'system',
            password: 'root',
            connectString: 'localhost:1521/xe'
        });

        console.log("Connected to DB, running updates...");

        const queries = [
            `UPDATE TRAIN SET train_number = 'Blue 1' WHERE train_number = 'BLUE-01'`,
            `UPDATE TRAIN SET train_number = 'Blue 2' WHERE train_number = 'BLUE-02'`,
            `UPDATE TRAIN SET train_number = 'Blue 3' WHERE train_number = 'BLUE-03'`,
            `UPDATE TRAIN SET train_number = 'Green 1' WHERE train_number = 'GREEN-01'`,
            `UPDATE TRAIN SET train_number = 'Green 2' WHERE train_number = 'GREEN-02'`,
            `UPDATE TRAIN SET train_number = 'Green 3' WHERE train_number = 'GREEN-03'`,
            `UPDATE TRAIN SET train_number = 'Red 1' WHERE train_number = 'RED-01'`,
            `UPDATE TRAIN SET train_number = 'Red 2' WHERE train_number = 'RED-02'`,
            `UPDATE TRAIN SET train_number = 'Red 3' WHERE train_number = 'RED-03'`,
            `UPDATE SCHEDULE SET frequency = 15`,
            `UPDATE SCHEDULE SET start_time = TIMESTAMP '2026-03-23 05:00:00' WHERE train_id IN (1, 4, 7)`,
            `UPDATE SCHEDULE SET start_time = TIMESTAMP '2026-03-23 05:05:00' WHERE train_id IN (2, 5, 8)`,
            `UPDATE SCHEDULE SET start_time = TIMESTAMP '2026-03-23 05:10:00' WHERE train_id IN (3, 6, 9)`,
            `COMMIT`
        ];

        for (const sql of queries) {
            await conn.execute(sql);
        }

        console.log("DB updates completed successfully!");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) {
            await conn.close();
        }
    }
}

fixDB();
