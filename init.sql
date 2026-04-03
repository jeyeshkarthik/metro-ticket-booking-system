-- Create tables with SERIAL for auto-increment

CREATE TABLE PASSENGER (
    passenger_id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20)
);

CREATE TABLE LINE (
    line_id SERIAL PRIMARY KEY,
    line_name VARCHAR(100),
    line_color VARCHAR(20),
    active_status CHAR(1)
);

CREATE TABLE STATION (
    station_id SERIAL PRIMARY KEY,
    station_name VARCHAR(100),
    location VARCHAR(200)
);

CREATE TABLE LINE_STATION (
    line_id INT REFERENCES LINE(line_id),
    station_id INT REFERENCES STATION(station_id),
    station_order INT,
    PRIMARY KEY (line_id, station_id)
);

CREATE TABLE TRAIN (
    train_id SERIAL PRIMARY KEY,
    train_number VARCHAR(50),
    capacity INT
);

CREATE TABLE SCHEDULE (
    schedule_id SERIAL PRIMARY KEY,
    train_id INT REFERENCES TRAIN(train_id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    frequency INT
);

CREATE TABLE ROUTE (
    route_id SERIAL PRIMARY KEY,
    source_station_id INT REFERENCES STATION(station_id),
    destination_station_id INT REFERENCES STATION(station_id),
    UNIQUE (source_station_id, destination_station_id)
);

CREATE TABLE TICKET (
    ticket_id SERIAL PRIMARY KEY,
    passenger_id INT REFERENCES PASSENGER(passenger_id),
    route_id INT REFERENCES ROUTE(route_id),
    booking_time TIMESTAMP
);

CREATE TABLE PAYMENT (
    payment_id SERIAL PRIMARY KEY,
    ticket_id INT REFERENCES TICKET(ticket_id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20),
    transaction_time TIMESTAMP
);

-- Insert initial data
INSERT INTO PASSENGER (username, password, name, email, phone) VALUES ('user1', 'pass1', 'Arun Kumar',   'arun@example.com',   '9876543210');
INSERT INTO PASSENGER (username, password, name, email, phone) VALUES ('user2', 'pass2', 'Priya Rajan',  'priya@example.com',  '9123456789');
INSERT INTO PASSENGER (username, password, name, email, phone) VALUES ('user3', 'pass3', 'Karthik S',    'karthik@example.com','9988776655');
INSERT INTO PASSENGER (username, password, name, email, phone) VALUES ('user4', 'pass4', 'Divya Menon',  'divya@example.com',  '9876012345');
INSERT INTO PASSENGER (username, password, name, email, phone) VALUES ('user5', 'pass5', 'Rahul Sharma', 'rahul@example.com',  '9012345678');

INSERT INTO LINE (line_name, line_color, active_status) VALUES ('Blue Line',  '#2563eb', 'Y');
INSERT INTO LINE (line_name, line_color, active_status) VALUES ('Green Line', '#16a34a', 'Y');
INSERT INTO LINE (line_name, line_color, active_status) VALUES ('Red Line',   '#dc2626', 'Y');

INSERT INTO STATION (station_name, location) VALUES ('Chennai Airport',   'Tirusulam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Meenambakkam',      'Meenambakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('St. Thomas Mount',  'St. Thomas Mount, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Alandur',           'Alandur, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Ekkattuthangal',    'Ekkattuthangal, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Guindy',            'Guindy, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Little Mount',      'Little Mount, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Saidapet',          'Saidapet, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('AG-DMS',            'Anna Arundel, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Teynampet',         'Teynampet, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Thousand Lights',   'Thousand Lights, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Anna Salai',        'Anna Salai, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Central',           'Park Town, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Government Estate', 'Fort St. George, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('High Court',        'High Court, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Wimco Nagar',       'Wimco Nagar, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Thiruvotriyur',     'Thiruvotriyur, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Kolathur',          'Kolathur, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Villivakkam',       'Villivakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Arumbakkam',        'Arumbakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Koyambedu',         'Koyambedu, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('CMBT',              'Koyambedu, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Vadapalani',        'Vadapalani, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Ashok Nagar',       'Ashok Nagar, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Kodambakkam',       'Kodambakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Nanganallur Road',  'Nanganallur, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Pallavaram',        'Pallavaram, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Chromepet',         'Chromepet, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Moovarasampet',     'Moovarasampet, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Virugambakkam',     'Virugambakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Nesapakkam',        'Nesapakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Valasaravakkam',    'Valasaravakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Mugalivakkam',      'Mugalivakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Aminjikarai',       'Aminjikarai, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Chetpet',           'Chetpet, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Nungambakkam',      'Nungambakkam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Anna Nagar East',   'Anna Nagar, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Anna Nagar West',   'Anna Nagar, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Thirumangalam',     'Thirumangalam, Chennai');
INSERT INTO STATION (station_name, location) VALUES ('Tirumullaivayil',   'Tirumullaivayil, Chennai');

INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  1,  1);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  2,  2);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  3,  3);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  4,  4);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  5,  5);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  6,  6);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  7,  7);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  8,  8);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1,  9,  9);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 10, 10);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 11, 11);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 12, 12);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 13, 13);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 14, 14);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (1, 15, 15);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 16,  1);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 17,  2);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 18,  3);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 19,  4);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 20,  5);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 21,  6);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 22,  7);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 23,  8);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 24,  9);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 25, 10);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2,  4, 11);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 26, 12);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 27, 13);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (2, 28, 14);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3,  3,  1);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 29,  2);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 30,  3);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 31,  4);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 32,  5);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 33,  6);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 21,  7);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 34,  8);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 35,  9);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 36, 10);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 37, 11);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 38, 12);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 39, 13);
INSERT INTO LINE_STATION (line_id, station_id, station_order) VALUES (3, 40, 14);

INSERT INTO TRAIN (train_number, capacity) VALUES ('Blue 1',  300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Blue 2',  300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Blue 3',  300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Green 1', 300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Green 2', 300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Green 3', 300);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Red 1',   280);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Red 2',   280);
INSERT INTO TRAIN (train_number, capacity) VALUES ('Red 3',   280);

INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (1, TIMESTAMP '2026-03-23 05:00:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (2, TIMESTAMP '2026-03-23 05:05:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (3, TIMESTAMP '2026-03-23 05:10:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (4, TIMESTAMP '2026-03-23 05:00:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (5, TIMESTAMP '2026-03-23 05:05:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (6, TIMESTAMP '2026-03-23 05:10:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (7, TIMESTAMP '2026-03-23 05:00:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (8, TIMESTAMP '2026-03-23 05:05:00', TIMESTAMP '2026-03-23 23:00:00', 15);
INSERT INTO SCHEDULE (train_id, start_time, end_time, frequency) VALUES (9, TIMESTAMP '2026-03-23 05:10:00', TIMESTAMP '2026-03-23 23:00:00', 15);

-- Specific routes needed for the initial tickets below
INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (1,  15);
INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (16, 28);
INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (3,  40);
INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (1,  28);
INSERT INTO ROUTE (source_station_id, destination_station_id) VALUES (15, 40);

-- Insert tickets
INSERT INTO TICKET (passenger_id, route_id, booking_time) VALUES (1, 1, TIMESTAMP '2026-03-23 08:15:00');
INSERT INTO TICKET (passenger_id, route_id, booking_time) VALUES (2, 4, TIMESTAMP '2026-03-23 09:30:00');
INSERT INTO TICKET (passenger_id, route_id, booking_time) VALUES (3, 2, TIMESTAMP '2026-03-23 10:00:00');
INSERT INTO TICKET (passenger_id, route_id, booking_time) VALUES (4, 3, TIMESTAMP '2026-03-23 11:45:00');
INSERT INTO TICKET (passenger_id, route_id, booking_time) VALUES (5, 5, TIMESTAMP '2026-03-23 13:20:00');

-- Insert payments
INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time) VALUES (1, 'UPI',  'SUCCESS', TIMESTAMP '2026-03-23 08:15:30');
INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time) VALUES (2, 'UPI',  'SUCCESS', TIMESTAMP '2026-03-23 09:30:45');
INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time) VALUES (3, 'CARD', 'SUCCESS', TIMESTAMP '2026-03-23 10:01:10');
INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time) VALUES (4, 'UPI',  'SUCCESS', TIMESTAMP '2026-03-23 11:45:22');
INSERT INTO PAYMENT (ticket_id, payment_method, payment_status, transaction_time) VALUES (5, 'CARD', 'SUCCESS', TIMESTAMP '2026-03-23 13:20:55');

-- Add all possible routes missing
INSERT INTO ROUTE (source_station_id, destination_station_id)
SELECT s1.station_id, s2.station_id
FROM STATION s1
CROSS JOIN STATION s2
WHERE s1.station_id != s2.station_id
ON CONFLICT (source_station_id, destination_station_id) DO NOTHING;
