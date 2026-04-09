# Metro Ticket Booking System

A full-stack metro ticket booking application built with a static frontend and an Express backend connected to an Oracle database.

## Project Overview

This project simulates a metro ticketing system for the Chennai Metro network. It includes:

- user login and authentication against an Oracle database
- station lookup and route planning
- fare calculation based on route distance
- live next-train schedule retrieval
- ticket booking with payment recording
- ticket history and booking details

## Architecture

- Frontend: `index.html`, `styles.css`, `script.js`
- Backend: `server.js`
- Database seed scripts: `insert_data.sql`, `all_routes.sql`
- Database fix helper: `fix_db.js`
- Database tables created: `PASSENGER`, `LINE`, `STATION`, `LINE_STATION`, `TRAIN`, `SCHEDULE`, `ROUTE`, `TICKET`, `PAYMENT`

## Features

- login with demo users stored in the `PASSENGER` table
- retrieve station list from the Oracle DB
- calculate routes and fare using station IDs
- display upcoming train departures from schedule data
- book tickets and save payment records
- fetch ticket history for a passenger

## Prerequisites

- Node.js installed
- Oracle Database installed and running (Oracle XE or compatible instance)
- Oracle Instant Client installed if required by `oracledb`

## Setup

1. Install project dependencies:

```bash
npm install
```

2. Configure Oracle database credentials in `server.js`:

```js
const DB_CONFIG = {
    user: 'system',
    password: 'root',
    connectString: 'localhost:1521/xe',
};
```

Update these values to match your Oracle environment.

3. Create the database schema and tables in Oracle.

4. Load initial data:

- `insert_data.sql` inserts sample passengers, lines, stations, line-station mappings, trains, schedules, routes, tickets, and payments.
- `all_routes.sql` populates the `ROUTE` table with all possible source-destination combinations.

5. Optionally run `fix_db.js` to normalize train names and schedule frequencies if needed.

## Running the Backend

Start the Express server:

```bash
node server.js
```

The backend listens on `http://localhost:3005`.

## Running the Frontend

Open `index.html` from a local HTTP server. Fetch requests require an HTTP origin, so do not load the file directly from the `file://` protocol.

Recommended options:

- use the VS Code Live Server extension
- or run a simple static server such as:

```bash
npx serve .
```

Then open the served page in your browser.

## API Reference

### `GET /`

Returns a simple health status.

### `GET /test-db`

Verifies Oracle database connectivity.

### `GET /stations`

Returns station records from the `STATION` table.

### `POST /login`

Request body:

```json
{
  "username": "user1",
  "password": "pass1"
}
```

### `POST /route`

Request body:

```json
{
  "source_station_id": 1,
  "destination_station_id": 15
}
```

Returns route data and fare.

### `GET /next-trains`

Returns upcoming trains based on schedule data.

### `GET /tickets?passenger_id=<id|username>`

Retrieves tickets and payment information for a given passenger.

### `POST /book-ticket`

Request body:

```json
{
  "passenger_id": 1,
  "route_id": 1,
  "payment_method": "UPI"
}
```

Creates a ticket and payment record.

## Demo Accounts

The sample database includes these demo users:

- `user1` / `pass1`
- `user2` / `pass2`
- `user3` / `pass3`
- `user4` / `pass4`
- `user5` / `pass5`

## File Summary

- `index.html` — frontend interface
- `styles.css` — frontend styling
- `script.js` — frontend behavior and UI logic
- `server.js` — Express backend implementation
- `package.json` — Node dependencies
- `insert_data.sql` — initial database seed data
- `all_routes.sql` — route generation script
- `fix_db.js` — optional Oracle DB update helper

## Notes

- The backend uses `oracledb`, which typically requires Oracle client libraries.
- If you encounter `oracledb` installation issues, install Oracle Instant Client and configure the runtime environment.
- Replace the hard-coded Oracle credentials in `server.js` before deployment.
