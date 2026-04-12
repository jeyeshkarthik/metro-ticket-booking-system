# Metro Ticket Booking System

A full-stack metro ticket booking application built with a static frontend and an Express backend connected to an Oracle database.

## Project Overview

This project simulates a metro ticketing system for the Chennai Metro network. It includes:

- user registration (signup) and login against an Oracle database
- station lookup and route planning
- fare calculation based on route distance
- live next-train schedule retrieval
- ticket booking with payment recording
- ticket history and booking details
- interactive metro map with interchange markers

## Architecture

- Frontend: `index.html`, `styles.css`, `script.js`
- Backend: `server.js` (Express, serves frontend as static files)
- Database: Oracle XE (`localhost:1521/xe`)
- Database seed scripts: `insert_data.sql`, `all_routes.sql`
- Database schema: `init.sql`
- Database fix helper: `fix_db.js`
- Database tables: `PASSENGER`, `LINE`, `STATION`, `LINE_STATION`, `TRAIN`, `SCHEDULE`, `ROUTE`, `TICKET`, `PAYMENT`

## Features

- account registration — new users can sign up and are stored in the `PASSENGER` table
- login with credentials validated against the Oracle DB
- retrieve station list from the Oracle DB
- calculate routes and fare using station IDs
- display upcoming train departures from schedule data
- book tickets and save payment records
- fetch ticket history for a passenger
- metro map view with colour-coded lines and interchange stations

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

3. Create the database schema and tables in Oracle using `init.sql`.

4. Load initial data:

- `insert_data.sql` inserts sample passengers, lines, stations, line-station mappings, trains, schedules, routes, tickets, and payments.
- `all_routes.sql` populates the `ROUTE` table with all possible source-destination combinations.

5. Optionally run `fix_db.js` to normalize train names and schedule frequencies if needed.

## Running the App

Start the Express server:

```bash
node server.js
```

Then open your browser and go to:

```
http://localhost:3005
```

The server serves the frontend (`index.html`) directly — no separate static server needed.

## API Reference

### `GET /test-db`

Verifies Oracle database connectivity.

### `GET /stations`

Returns all station records from the `STATION` table.

### `POST /register`

Creates a new passenger account.

Request body:

```json
{
  "username": "newuser",
  "password": "mypassword",
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "9876543210"
}
```

Returns `{ success: true }` on success. Returns `409` if the username is already taken.

### `POST /login`

Request body:

```json
{
  "username": "user1",
  "password": "pass1"
}
```

Returns user details on success. Returns `401` for invalid credentials.

### `POST /route`

Request body:

```json
{
  "source_station_id": 1,
  "destination_station_id": 15
}
```

Returns route data including `ROUTE_ID`, `NUM_STATIONS`, and calculated `FARE`.

### `GET /next-trains`

Returns upcoming trains based on schedule data for the next 30 minutes.

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

Creates a ticket and payment record in a single transaction. Returns the generated `ticket_id`.

## Demo Accounts

The sample database includes these demo users:

| Username | Password |
|---|---|
| user1 | pass1 |
| user2 | pass2 |
| user3 | pass3 |
| user4 | pass4 |
| user5 | pass5 |

## File Summary

| File | Purpose |
|---|---|
| `index.html` | Frontend interface (login, signup, booking, history, map) |
| `styles.css` | Frontend styling and dark mode |
| `script.js` | Frontend logic, Dijkstra route algorithm, API calls |
| `server.js` | Express backend, Oracle API routes |
| `package.json` | Node.js dependencies |
| `init.sql` | Database schema creation script |
| `insert_data.sql` | Initial database seed data |
| `all_routes.sql` | Route generation script for all station pairs |
| `fix_db.js` | Optional Oracle DB normalisation helper |

## Notes

- The backend uses `oracledb`, which requires Oracle client libraries to be installed.
- If you encounter `oracledb` installation issues, install Oracle Instant Client and configure the runtime environment.
- Passwords are stored as plain text in this project for simplicity.
