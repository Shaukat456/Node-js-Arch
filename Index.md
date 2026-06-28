# 🗄️ MySQL: Beginner to Intermediate — A Complete Guide

### With DBMS Concepts, Real-World Scenarios & Visual Table Diagrams

---

> **How to read this guide:** Every concept is taught with a real-world analogy first, then the SQL, then a visual table diagram showing you exactly what the data looks like. You'll learn DBMS theory exactly when it becomes _relevant_ — not in a vacuum.

---

## 📚 Table of Contents

1. [What is a Database? (DBMS Concepts)](#1-what-is-a-database)
2. [Installing MySQL & First Steps](#2-installing-mysql--first-steps)
3. [Creating Your First Database & Tables](#3-creating-your-first-database--tables)
4. [Data Types](#4-data-types)
5. [CRUD Operations](#5-crud-operations)
6. [Filtering with WHERE](#6-filtering-with-where)
7. [Sorting & Limiting Results](#7-sorting--limiting-results)
8. [Aggregate Functions & GROUP BY](#8-aggregate-functions--group-by)
9. [Relationships & Foreign Keys](#9-relationships--foreign-keys)
10. [JOINs — Combining Tables](#10-joins--combining-tables)
11. [Normalization (1NF → 3NF)](#11-normalization-1nf--3nf)
12. [Indexes — Making Queries Fast](#12-indexes--making-queries-fast)
13. [Transactions & ACID Properties](#13-transactions--acid-properties)
14. [Subqueries & Views](#14-subqueries--views)
15. [Stored Procedures & Functions](#15-stored-procedures--functions)
16. [CAP Theorem](#16-cap-theorem)
17. [Real-World Project: E-Commerce Schema](#17-real-world-project-e-commerce-schema)

---

## 1. What is a Database?

### 🏪 Analogy: The Supermarket

Imagine a **supermarket**:

- The **store itself** = the Database Management System (DBMS)
- Each **aisle** = a Database (e.g., "Electronics", "Groceries")
- Each **shelf** = a Table
- Each **product slot** = a Row (record)
- The **label info** (name, price, weight) = Columns (fields)

Without a system, products would be scattered everywhere. A DBMS gives everything structure, a location, and rules.

### 🔑 Key DBMS Concepts

| Term           | Real-World Equivalent             | Database Meaning                                 |
| -------------- | --------------------------------- | ------------------------------------------------ |
| DBMS           | The supermarket system            | Software managing databases (MySQL, PostgreSQL)  |
| Database       | One store branch                  | A named collection of related tables             |
| Table          | A shelf                           | A structured grid of rows and columns            |
| Row / Record   | One product                       | A single entry of data                           |
| Column / Field | Product attribute (name, price)   | A category of data                               |
| Primary Key    | Barcode (unique per product)      | Unique identifier for each row                   |
| Foreign Key    | Shelf ID linking product to aisle | A reference to another table's primary key       |
| Schema         | Store layout blueprint            | Structure definition of tables and relationships |
| Query          | Asking "where is sugar?"          | A command to retrieve or manipulate data         |

### 🧠 Types of Databases

```
DBMS Types:
├── Relational (SQL)       → MySQL, PostgreSQL, Oracle, SQL Server
│   └── Data in tables with relationships
├── Document (NoSQL)       → MongoDB, CouchDB
│   └── Data in JSON-like documents
├── Key-Value (NoSQL)      → Redis, DynamoDB
│   └── Simple key → value pairs
├── Graph                  → Neo4j
│   └── Nodes and edges (social networks)
└── Time-Series            → InfluxDB
    └── Time-stamped data (IoT, metrics)
```

> **Why MySQL?** MySQL is the world's most popular open-source relational database. It powers Facebook, Twitter, YouTube, WordPress, and millions of apps. It's the best starting point for learning SQL.

---

## 2. Installing MySQL & First Steps

### Installation (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install mysql-server

# Start the service
sudo systemctl start mysql

# Secure the installation
sudo mysql_secure_installation

# Log in
mysql -u root -p
```

### Installation (macOS with Homebrew)

```bash
brew install mysql
brew services start mysql
mysql -u root
```

### Installation (Windows)

Download MySQL Installer from [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/) and follow the wizard.

### Your First MySQL Session

```sql
-- Show all databases
SHOW DATABASES;

-- Create a new database
CREATE DATABASE shop;

-- Switch to it
USE shop;

-- Show current database
SELECT DATABASE();

-- Show all tables in current database
SHOW TABLES;
```

### Output of `SHOW DATABASES`:

```
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| shop               |
| sys                |
+--------------------+
```

> **Note:** `information_schema`, `mysql`, `performance_schema`, and `sys` are MySQL's internal system databases. Never modify them unless you know what you're doing.

---

## 3. Creating Your First Database & Tables

### 🏨 Real-World Scenario: Hotel Management System

Let's build a small **Hotel Management System**. A hotel has guests, rooms, and bookings. This is a perfect beginner scenario.

```sql
-- Create and switch to database
CREATE DATABASE hotel_db;
USE hotel_db;
```

### Creating a Table

```sql
CREATE TABLE guests (
    guest_id    INT           NOT NULL AUTO_INCREMENT,
    full_name   VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  UNIQUE NOT NULL,
    phone       VARCHAR(20),
    country     VARCHAR(60)   DEFAULT 'Unknown',
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guest_id)
);
```

### Breaking Down the CREATE TABLE Syntax

```
CREATE TABLE table_name (
    column_name   DATA_TYPE   [CONSTRAINTS],
    ...
    PRIMARY KEY (column_name)
);

Constraints:
├── NOT NULL         → column must always have a value
├── UNIQUE           → no two rows can have the same value
├── DEFAULT 'value'  → used if no value is provided
├── AUTO_INCREMENT   → MySQL auto-assigns the next integer (1, 2, 3...)
└── PRIMARY KEY      → uniquely identifies each row (implies NOT NULL + UNIQUE)
```

### 🔑 DBMS Concept: Primary Key

A **Primary Key** is like a **passport number** — every person has exactly one, it never changes, and it uniquely identifies them anywhere in the world. In a table, no two rows can share a primary key.

```sql
CREATE TABLE rooms (
    room_id     INT           NOT NULL AUTO_INCREMENT,
    room_number VARCHAR(10)   NOT NULL UNIQUE,
    room_type   ENUM('Single','Double','Suite') NOT NULL,
    price_per_night DECIMAL(8,2) NOT NULL,
    is_available TINYINT(1)   DEFAULT 1,
    PRIMARY KEY (room_id)
);
```

### Viewing Table Structure

```sql
DESCRIBE guests;
-- or
DESC rooms;
```

#### Output of `DESC guests`:

```
+------------+--------------+------+-----+-------------------+----------------+
| Field      | Type         | Null | Key | Default           | Extra          |
+------------+--------------+------+-----+-------------------+----------------+
| guest_id   | int          | NO   | PRI | NULL              | auto_increment |
| full_name  | varchar(100) | NO   |     | NULL              |                |
| email      | varchar(150) | NO   | UNI | NULL              |                |
| phone      | varchar(20)  | YES  |     | NULL              |                |
| country    | varchar(60)  | YES  |     | Unknown           |                |
| created_at | datetime     | YES  |     | CURRENT_TIMESTAMP |                |
+------------+--------------+------+-----+-------------------+----------------+
```

### Modifying a Table with ALTER TABLE

```sql
-- Add a column
ALTER TABLE guests ADD COLUMN loyalty_points INT DEFAULT 0;

-- Rename a column
ALTER TABLE guests RENAME COLUMN phone TO phone_number;

-- Change a column's data type
ALTER TABLE rooms MODIFY price_per_night DECIMAL(10,2);

-- Drop a column
ALTER TABLE guests DROP COLUMN loyalty_points;

-- Add a constraint after creation
ALTER TABLE rooms ADD CONSTRAINT chk_price CHECK (price_per_night > 0);
```

---

## 4. Data Types

### 🧠 Choosing the Right Data Type

Choosing the wrong data type is like storing a book in an envelope — it might work, but it wastes space and causes problems.

### Numeric Types

| Type               | Storage   | Range             | Use Case                                       |
| ------------------ | --------- | ----------------- | ---------------------------------------------- |
| `TINYINT`          | 1 byte    | -128 to 127       | Boolean flags (0/1), age, rating               |
| `SMALLINT`         | 2 bytes   | -32,768 to 32,767 | Year, small counts                             |
| `INT`              | 4 bytes   | -2.1B to 2.1B     | IDs, quantities                                |
| `BIGINT`           | 8 bytes   | Very large        | User IDs at scale (Twitter uses this)          |
| `DECIMAL(p,s)`     | Variable  | Exact decimal     | Money, prices — **always use for currency**    |
| `FLOAT` / `DOUBLE` | 4/8 bytes | Approximate       | Scientific data (NOT money — rounding errors!) |

> ⚠️ **Never use FLOAT for money!** `FLOAT(10.99) + FLOAT(0.01)` can give `11.000000001` due to floating-point arithmetic. Always use `DECIMAL`.

### String Types

| Type                | Max Size     | Use Case                                               |
| ------------------- | ------------ | ------------------------------------------------------ |
| `CHAR(n)`           | 255 chars    | Fixed-length: country codes ('US', 'PK'), status flags |
| `VARCHAR(n)`        | 65,535 bytes | Variable-length: names, emails, addresses              |
| `TEXT`              | 65,535 bytes | Long content: blog posts, descriptions                 |
| `MEDIUMTEXT`        | 16MB         | Large documents                                        |
| `LONGTEXT`          | 4GB          | Very large content                                     |
| `ENUM('a','b','c')` | —            | One value from a set: gender, status, type             |

> **CHAR vs VARCHAR Analogy:** `CHAR(10)` is like a parking space always reserved for exactly 10 characters (pads with spaces). `VARCHAR(10)` is flexible parking — it only uses the space the car actually needs.

### Date & Time Types

| Type        | Format              | Example                     |
| ----------- | ------------------- | --------------------------- |
| `DATE`      | YYYY-MM-DD          | '2024-03-15'                |
| `TIME`      | HH:MM:SS            | '14:30:00'                  |
| `DATETIME`  | YYYY-MM-DD HH:MM:SS | '2024-03-15 14:30:00'       |
| `TIMESTAMP` | YYYY-MM-DD HH:MM:SS | Auto-updates, stores in UTC |
| `YEAR`      | YYYY                | '2024'                      |

> **DATETIME vs TIMESTAMP:** `TIMESTAMP` is stored as UTC and converted to the server's timezone on retrieval — great for global apps. `DATETIME` stores exactly what you put in, no conversion.

---

## 5. CRUD Operations

### 🏨 Back to the Hotel — CRUD = Create, Read, Update, Delete

CRUD is the foundation of every application. Every app you've ever used (Instagram, Gmail, Netflix) is fundamentally doing CRUD on a database.

### CREATE — INSERT INTO

```sql
-- Insert one guest
INSERT INTO guests (full_name, email, phone, country)
VALUES ('Ahmed Khan', 'ahmed@email.com', '+92-300-1234567', 'Pakistan');

-- Insert multiple guests at once
INSERT INTO guests (full_name, email, phone, country) VALUES
('Sarah Connor',  'sarah@email.com',  '+1-555-0100', 'USA'),
('Maria Lopez',   'maria@email.com',  '+34-600-111222', 'Spain'),
('James Wright',  'james@email.com',  '+44-7700-900123', 'UK'),
('Yuki Tanaka',   'yuki@email.com',   '+81-90-1234-5678', 'Japan'),
('Fatima Al-Said','fatima@email.com', '+971-50-123-4567', 'UAE');

-- Insert rooms
INSERT INTO rooms (room_number, room_type, price_per_night) VALUES
('101', 'Single', 80.00),
('102', 'Single', 80.00),
('201', 'Double', 150.00),
('202', 'Double', 150.00),
('301', 'Suite',  400.00);
```

#### 📊 guests table (after INSERT):

```
+----------+---------------+------------------+---------------------+---------+---------------------+
| guest_id | full_name     | email            | phone               | country | created_at          |
+----------+---------------+------------------+---------------------+---------+---------------------+
|        1 | Ahmed Khan    | ahmed@email.com  | +92-300-1234567     | Pakistan| 2024-03-15 09:00:00 |
|        2 | Sarah Connor  | sarah@email.com  | +1-555-0100         | USA     | 2024-03-15 09:01:00 |
|        3 | Maria Lopez   | maria@email.com  | +34-600-111222      | Spain   | 2024-03-15 09:02:00 |
|        4 | James Wright  | james@email.com  | +44-7700-900123     | UK      | 2024-03-15 09:03:00 |
|        5 | Yuki Tanaka   | yuki@email.com   | +81-90-1234-5678    | Japan   | 2024-03-15 09:04:00 |
|        6 | Fatima Al-Said| fatima@email.com | +971-50-123-4567    | UAE     | 2024-03-15 09:05:00 |
+----------+---------------+------------------+---------------------+---------+---------------------+
```

#### 📊 rooms table (after INSERT):

```
+---------+-------------+-----------+-----------------+--------------+
| room_id | room_number | room_type | price_per_night | is_available |
+---------+-------------+-----------+-----------------+--------------+
|       1 | 101         | Single    |           80.00 |            1 |
|       2 | 102         | Single    |           80.00 |            1 |
|       3 | 201         | Double    |          150.00 |            1 |
|       4 | 202         | Double    |          150.00 |            1 |
|       5 | 301         | Suite     |          400.00 |            1 |
+---------+-------------+-----------+-----------------+--------------+
```

### READ — SELECT

```sql
-- Get all guests
SELECT * FROM guests;

-- Get specific columns
SELECT full_name, email, country FROM guests;

-- Count all rows
SELECT COUNT(*) AS total_guests FROM guests;

-- Get unique countries
SELECT DISTINCT country FROM guests;
```

#### Output of `SELECT full_name, email, country FROM guests`:

```
+----------------+------------------+---------+
| full_name      | email            | country |
+----------------+------------------+---------+
| Ahmed Khan     | ahmed@email.com  | Pakistan|
| Sarah Connor   | sarah@email.com  | USA     |
| Maria Lopez    | maria@email.com  | Spain   |
| James Wright   | james@email.com  | UK      |
| Yuki Tanaka    | yuki@email.com   | Japan   |
| Fatima Al-Said | fatima@email.com | UAE     |
+----------------+------------------+---------+
```

### UPDATE

```sql
-- Update one guest's phone
UPDATE guests
SET phone = '+92-321-9999999'
WHERE guest_id = 1;

-- Update multiple columns
UPDATE rooms
SET price_per_night = 90.00, is_available = 0
WHERE room_number = '101';

-- ⚠️ DANGER: UPDATE without WHERE updates ALL rows!
-- UPDATE guests SET country = 'Unknown';  -- DON'T DO THIS (updates everyone!)
```

> 🚨 **Golden Rule:** Always include a `WHERE` clause in `UPDATE` and `DELETE`. Run your `WHERE` clause as a `SELECT` first to verify which rows you'll affect, then switch to `UPDATE`/`DELETE`.

### DELETE

```sql
-- Delete one guest
DELETE FROM guests WHERE guest_id = 6;

-- Delete all guests from a country
DELETE FROM guests WHERE country = 'UAE';

-- Delete all rows (keeps table structure)
-- DELETE FROM guests;  -- ⚠️ Deletes everything!

-- TRUNCATE is faster but can't be rolled back
-- TRUNCATE TABLE guests;  -- ⚠️ Irreversible!
```

### DROP vs TRUNCATE vs DELETE

```
DELETE   → Removes specific rows. Can be rolled back. Slow on large tables.
TRUNCATE → Removes ALL rows. Cannot be rolled back. Resets AUTO_INCREMENT. Fast.
DROP     → Removes the entire table (structure + data). Cannot be undone.

Analogy:
DELETE   → Remove specific books from a shelf
TRUNCATE → Empty the entire shelf (shelf stays)
DROP     → Remove the entire shelf and books
```

---

## 6. Filtering with WHERE

### 🏨 Hotel Scenario: Finding Available Rooms

The `WHERE` clause is like a filter on your coffee machine — water (all data) passes through, but only what meets the conditions comes out.

```sql
-- Basic comparison
SELECT * FROM rooms WHERE room_type = 'Suite';

-- Greater than
SELECT * FROM rooms WHERE price_per_night > 100;

-- Range with BETWEEN
SELECT * FROM rooms WHERE price_per_night BETWEEN 80 AND 160;

-- Multiple conditions with AND / OR
SELECT * FROM rooms
WHERE room_type = 'Double' AND is_available = 1;

SELECT * FROM rooms
WHERE room_type = 'Suite' OR price_per_night < 90;

-- NOT
SELECT * FROM rooms WHERE NOT room_type = 'Single';
-- Same as:
SELECT * FROM rooms WHERE room_type != 'Single';
```

#### Output of `SELECT * FROM rooms WHERE price_per_night BETWEEN 80 AND 160`:

```
+---------+-------------+-----------+-----------------+--------------+
| room_id | room_number | room_type | price_per_night | is_available |
+---------+-------------+-----------+-----------------+--------------+
|       1 | 101         | Single    |           80.00 |            0 |  ← updated earlier
|       2 | 102         | Single    |           80.00 |            1 |
|       3 | 201         | Double    |          150.00 |            1 |
|       4 | 202         | Double    |          150.00 |            1 |
+---------+-------------+-----------+-----------------+--------------+
```

### IN and NOT IN

```sql
-- IN: match any of these values
SELECT * FROM guests WHERE country IN ('USA', 'UK', 'Spain');

-- NOT IN: exclude these values
SELECT * FROM guests WHERE country NOT IN ('Unknown');
```

#### Output of `SELECT full_name, country FROM guests WHERE country IN ('USA', 'UK', 'Spain')`:

```
+--------------+---------+
| full_name    | country |
+--------------+---------+
| Sarah Connor | USA     |
| Maria Lopez  | Spain   |
| James Wright | UK      |
+--------------+---------+
```

### LIKE — Pattern Matching

```sql
-- Names starting with 'A'
SELECT * FROM guests WHERE full_name LIKE 'A%';

-- Names ending with 'n'
SELECT * FROM guests WHERE full_name LIKE '%n';

-- Names containing 'ar'
SELECT * FROM guests WHERE full_name LIKE '%ar%';

-- Exactly 5 characters
SELECT * FROM guests WHERE country LIKE '_____';

-- Email from gmail
SELECT * FROM guests WHERE email LIKE '%@gmail.com';
```

```
LIKE Wildcards:
%  → any number of characters (including zero)
_  → exactly one character

Examples:
'A%'     → Ahmed, Alice, Amazon
'%son'   → Johnson, Wilson, Mason
'%@%.com' → any valid-looking email
'J__n'   → John, Jean (J + 2 chars + n)
```

### IS NULL / IS NOT NULL

```sql
-- Find guests without a phone number
SELECT full_name, email FROM guests WHERE phone IS NULL;

-- Find guests who DO have a phone
SELECT full_name, phone FROM guests WHERE phone IS NOT NULL;
```

---

## 7. Sorting & Limiting Results

### ORDER BY

```sql
-- Ascending (default, cheapest first)
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night ASC;

-- Descending (most expensive first)
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night DESC;

-- Sort by multiple columns
SELECT * FROM guests
ORDER BY country ASC, full_name ASC;
```

#### Output of `SELECT room_number, room_type, price_per_night FROM rooms ORDER BY price_per_night ASC`:

```
+-------------+-----------+-----------------+
| room_number | room_type | price_per_night |
+-------------+-----------+-----------------+
| 101         | Single    |           80.00 |
| 102         | Single    |           80.00 |
| 201         | Double    |          150.00 |
| 202         | Double    |          150.00 |
| 301         | Suite     |          400.00 |
+-------------+-----------+-----------------+
```

### LIMIT & OFFSET

```sql
-- Get top 3 cheapest rooms
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night ASC
LIMIT 3;

-- Pagination: page 2 (items 4 and 5)
-- OFFSET skips the first N rows
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night ASC
LIMIT 2 OFFSET 2;
```

> **Pagination Analogy:** Think of a book. `LIMIT 10` = show 10 pages at a time. `OFFSET 20` = start from page 21. Together they implement "next page" functionality.

```
Page 1: LIMIT 10 OFFSET 0
Page 2: LIMIT 10 OFFSET 10
Page 3: LIMIT 10 OFFSET 20
```

---

## 8. Aggregate Functions & GROUP BY

### 🏨 Hotel Analytics: Answering Business Questions

Aggregate functions collapse many rows into a single summary value — like a manager asking "What's our total revenue this month?"

```sql
-- Count rows
SELECT COUNT(*) AS total_rooms FROM rooms;

-- Sum of all prices
SELECT SUM(price_per_night) AS total_room_revenue FROM rooms;

-- Average price
SELECT AVG(price_per_night) AS avg_room_price FROM rooms;

-- Highest price
SELECT MAX(price_per_night) AS most_expensive FROM rooms;

-- Lowest price
SELECT MIN(price_per_night) AS cheapest FROM rooms;
```

#### Output of aggregate queries:

```
+--------------+
| total_rooms  |
+--------------+
|            5 |
+--------------+

+--------------------+
| total_room_revenue |
+--------------------+
|             860.00 |
+--------------------+

+----------------+
| avg_room_price |
+----------------+
|         172.00 |
+----------------+
```

### GROUP BY — Aggregating by Category

```sql
-- How many rooms of each type?
SELECT room_type, COUNT(*) AS count, AVG(price_per_night) AS avg_price
FROM rooms
GROUP BY room_type;

-- How many guests from each country?
SELECT country, COUNT(*) AS num_guests
FROM guests
GROUP BY country
ORDER BY num_guests DESC;
```

#### Output of room type summary:

```
+-----------+-------+-----------+
| room_type | count | avg_price |
+-----------+-------+-----------+
| Single    |     2 | 80.000000 |
| Double    |     2 |150.000000 |
| Suite     |     1 |400.000000 |
+-----------+-------+-----------+
```

### HAVING — Filtering After Grouping

> **WHERE vs HAVING analogy:** `WHERE` filters raw ingredients before cooking. `HAVING` filters finished dishes after cooking (after aggregation).

```sql
-- Room types with average price above 100
SELECT room_type, AVG(price_per_night) AS avg_price
FROM rooms
GROUP BY room_type
HAVING avg_price > 100;

-- Countries with more than 1 guest
SELECT country, COUNT(*) AS num_guests
FROM guests
GROUP BY country
HAVING num_guests > 1;
```

#### Output (after re-inserting some guests):

```
+-----------+-----------+
| room_type | avg_price |
+-----------+-----------+
| Double    |150.000000 |
| Suite     |400.000000 |
+-----------+-----------+
```

### Complete Query Order of Execution

```sql
-- Mental model: SQL clauses execute in this order
SELECT   country, COUNT(*) AS n   -- 6. Project columns
FROM     guests                   -- 1. Choose table
WHERE    country != 'Unknown'     -- 2. Filter rows
GROUP BY country                  -- 3. Group
HAVING   n > 0                    -- 4. Filter groups
ORDER BY n DESC                   -- 5. Sort
LIMIT    5;                       -- 7. Limit output
```

---

## 9. Relationships & Foreign Keys

### 🔗 DBMS Concept: Relational Model

The whole point of a **relational** database is that tables can **relate** to each other. This eliminates duplicate data and keeps everything consistent.

### Adding Bookings Table (Relationship)

```sql
CREATE TABLE bookings (
    booking_id   INT          NOT NULL AUTO_INCREMENT,
    guest_id     INT          NOT NULL,
    room_id      INT          NOT NULL,
    check_in     DATE         NOT NULL,
    check_out    DATE         NOT NULL,
    total_amount DECIMAL(10,2),
    status       ENUM('confirmed','cancelled','completed') DEFAULT 'confirmed',
    booked_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (booking_id),

    -- Foreign Keys link to other tables
    FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE RESTRICT,
    FOREIGN KEY (room_id)  REFERENCES rooms(room_id)   ON DELETE RESTRICT,

    -- Computed check: check_out must be after check_in
    CONSTRAINT chk_dates CHECK (check_out > check_in)
);
```

### 🔑 DBMS Concept: Foreign Key

A **Foreign Key** is like a reference number on a form. When you fill out a bank form with your account number, that number "references" your full account record elsewhere. If the account doesn't exist, the form is rejected.

```
Referential Integrity Rules:
├── You cannot INSERT a booking for a guest_id that doesn't exist in guests
├── You cannot DELETE a guest who has bookings (ON DELETE RESTRICT)
├── ON DELETE CASCADE → deleting a guest also deletes their bookings
├── ON DELETE SET NULL → sets foreign key to NULL when parent is deleted
└── ON UPDATE CASCADE → updating parent key updates all child references
```

```sql
-- Insert bookings
INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount) VALUES
(1, 3, '2024-04-01', '2024-04-05', 600.00),   -- Ahmed in Double for 4 nights
(2, 5, '2024-04-02', '2024-04-06', 1600.00),  -- Sarah in Suite for 4 nights
(3, 1, '2024-04-03', '2024-04-07', 320.00),   -- Maria in Single for 4 nights
(4, 2, '2024-04-01', '2024-04-04', 240.00);   -- James in Single for 3 nights
```

#### 📊 bookings table:

```
+------------+----------+---------+------------+------------+--------------+-----------+
| booking_id | guest_id | room_id | check_in   | check_out  | total_amount | status    |
+------------+----------+---------+------------+------------+--------------+-----------+
|          1 |        1 |       3 | 2024-04-01 | 2024-04-05 |       600.00 | confirmed |
|          2 |        2 |       5 | 2024-04-02 | 2024-04-06 |      1600.00 | confirmed |
|          3 |        3 |       1 | 2024-04-03 | 2024-04-07 |       320.00 | confirmed |
|          4 |        4 |       2 | 2024-04-01 | 2024-04-04 |       240.00 | confirmed |
+------------+----------+---------+------------+------------+--------------+-----------+
```

### Entity-Relationship (ER) Diagram

```
┌──────────────────────┐           ┌──────────────────────┐
│       GUESTS         │           │        ROOMS         │
│──────────────────────│           │──────────────────────│
│ PK guest_id (INT)    │           │ PK room_id (INT)     │
│    full_name         │           │    room_number       │
│    email (UNIQUE)    │           │    room_type (ENUM)  │
│    phone             │           │    price_per_night   │
│    country           │           │    is_available      │
│    created_at        │           └──────────┬───────────┘
└──────────┬───────────┘                      │
           │  1                               │ 1
           │                                  │
           │         ┌────────────────────────┤
           │         │      BOOKINGS          │
           │         │────────────────────────│
           └─────────┤ PK booking_id          ├─────────────┘
               Many  │ FK guest_id ──────────►│ FK room_id
                     │    check_in            │
                     │    check_out           │
                     │    total_amount        │
                     │    status              │
                     │    booked_at           │
                     └────────────────────────┘
                              Many

Relationship types:
  1 Guest  → Many Bookings  (One-to-Many)
  1 Room   → Many Bookings  (One-to-Many)
  1 Booking → 1 Guest + 1 Room
```

---

## 10. JOINs — Combining Tables

### 🧩 Analogy: JOINs are Like Joining Puzzle Pieces

Separate tables are like puzzle pieces stored in different boxes. JOINs combine them into the full picture. The connecting piece is the foreign key.

```sql
-- Setup reminder:
-- bookings.guest_id → guests.guest_id
-- bookings.room_id  → rooms.room_id
```

### INNER JOIN — Only Matching Rows

```sql
-- Get bookings with guest names and room details
SELECT
    b.booking_id,
    g.full_name      AS guest_name,
    r.room_number,
    r.room_type,
    b.check_in,
    b.check_out,
    b.total_amount
FROM bookings b
INNER JOIN guests g ON b.guest_id  = g.guest_id
INNER JOIN rooms  r ON b.room_id   = r.room_id
ORDER BY b.check_in;
```

#### 📊 Result of INNER JOIN:

```
+------------+--------------+-------------+-----------+------------+------------+--------------+
| booking_id | guest_name   | room_number | room_type | check_in   | check_out  | total_amount |
+------------+--------------+-------------+-----------+------------+------------+--------------+
|          1 | Ahmed Khan   | 201         | Double    | 2024-04-01 | 2024-04-05 |       600.00 |
|          4 | James Wright | 102         | Single    | 2024-04-01 | 2024-04-04 |       240.00 |
|          2 | Sarah Connor | 301         | Suite     | 2024-04-02 | 2024-04-06 |      1600.00 |
|          3 | Maria Lopez  | 101         | Single    | 2024-04-03 | 2024-04-07 |       320.00 |
+------------+--------------+-------------+-----------+------------+------------+--------------+
```

### LEFT JOIN — All from Left Table, Matching from Right

```sql
-- Show ALL guests, even if they have no bookings
SELECT
    g.full_name,
    g.country,
    b.booking_id,
    b.check_in
FROM guests g
LEFT JOIN bookings b ON g.guest_id = b.guest_id;
```

#### 📊 Result of LEFT JOIN (Yuki has no booking):

```
+----------------+---------+------------+------------+
| full_name      | country | booking_id | check_in   |
+----------------+---------+------------+------------+
| Ahmed Khan     | Pakistan|          1 | 2024-04-01 |
| Sarah Connor   | USA     |          2 | 2024-04-02 |
| Maria Lopez    | Spain   |          3 | 2024-04-03 |
| James Wright   | UK      |          4 | 2024-04-01 |
| Yuki Tanaka    | Japan   |       NULL |       NULL |  ← No booking!
+----------------+---------+------------+------------+
```

> **Use case:** Find guests who have NEVER made a booking:
>
> ```sql
> SELECT g.full_name FROM guests g
> LEFT JOIN bookings b ON g.guest_id = b.guest_id
> WHERE b.booking_id IS NULL;
> ```

### RIGHT JOIN — All from Right Table

```sql
-- All rooms, even unbooked ones
SELECT
    r.room_number,
    r.room_type,
    b.booking_id,
    b.check_in
FROM bookings b
RIGHT JOIN rooms r ON b.room_id = r.room_id;
```

#### 📊 Result of RIGHT JOIN:

```
+-------------+-----------+------------+------------+
| room_number | room_type | booking_id | check_in   |
+-------------+-----------+------------+------------+
| 101         | Single    |          3 | 2024-04-03 |
| 102         | Single    |          4 | 2024-04-01 |
| 201         | Double    |          1 | 2024-04-01 |
| 202         | Double    |       NULL |       NULL |  ← Never booked!
| 301         | Suite     |          2 | 2024-04-02 |
+-------------+-----------+------------+------------+
```

### JOIN Types Visual Summary

```
Table A (Guests)        Table B (Bookings)
  [A] [A∩B] [B]        (∩ = intersection = matching rows)

INNER JOIN   = [A∩B]          Only rows that match in BOTH tables
LEFT JOIN    = [A] + [A∩B]    All of A, plus matching B (NULL if no match)
RIGHT JOIN   = [A∩B] + [B]    Matching A, plus all of B (NULL if no match)
FULL OUTER   = [A] + [A∩B] + [B]  All rows from both (MySQL: use UNION)
CROSS JOIN   = Every A row × Every B row (Cartesian product)
SELF JOIN    = A table joined to itself (e.g., employees and their managers)
```

### SELF JOIN — Employees and Managers

```sql
CREATE TABLE employees (
    emp_id      INT PRIMARY KEY AUTO_INCREMENT,
    name        VARCHAR(100),
    manager_id  INT,  -- References another employee!
    salary      DECIMAL(10,2),
    FOREIGN KEY (manager_id) REFERENCES employees(emp_id)
);

INSERT INTO employees (name, manager_id, salary) VALUES
('CEO Bob',      NULL,  15000.00),   -- emp_id 1, no manager
('VP Alice',     1,     10000.00),   -- reports to CEO Bob
('Dev Carlos',   2,     7000.00),    -- reports to VP Alice
('Dev Diana',    2,     7500.00),    -- reports to VP Alice
('Intern Eve',   3,     2000.00);    -- reports to Dev Carlos

-- Self join to show name with manager name
SELECT
    e.name        AS employee,
    m.name        AS manager,
    e.salary
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.emp_id
ORDER BY e.emp_id;
```

#### 📊 Result of SELF JOIN:

```
+------------+----------+----------+
| employee   | manager  | salary   |
+------------+----------+----------+
| CEO Bob    | NULL     | 15000.00 |  ← Top of hierarchy
| VP Alice   | CEO Bob  | 10000.00 |
| Dev Carlos | VP Alice |  7000.00 |
| Dev Diana  | VP Alice |  7500.00 |
| Intern Eve | Dev Carlos| 2000.00 |
+------------+----------+----------+
```

---

## 11. Normalization (1NF → 3NF)

### 🧠 DBMS Concept: What is Normalization?

**Normalization** is the process of organizing a database to reduce **data redundancy** (duplicate data) and improve **data integrity** (accuracy).

### Analogy: The Address Book Problem

Imagine keeping a notebook of orders:

```
BAD (Unnormalized):
| order_id | customer_name | customer_email    | product1 | product2 | city    | state |
|----------|---------------|-------------------|----------|----------|---------|-------|
| 1001     | Ahmed Khan    | ahmed@email.com   | Laptop   | Mouse    | Karachi | Sindh |
| 1002     | Ahmed Khan    | ahmed@email.com   | Keyboard | NULL     | Karachi | Sindh |
```

Problems:

- Ahmed's email appears twice (what if it changes?)
- Products are in columns (what if there are 10 products?)
- City/State repeated (can cause inconsistency)

Normalization solves all of this.

### First Normal Form (1NF)

**Rule:** Each column must contain **atomic** (indivisible) values. No repeating groups or arrays in a column.

```sql
-- ❌ Violates 1NF (multiple values in one column)
CREATE TABLE bad_orders (
    order_id INT,
    products VARCHAR(500)  -- 'Laptop, Mouse, Keyboard'  ← NOT ATOMIC!
);

-- ✅ 1NF compliant
CREATE TABLE orders (
    order_id    INT,
    product_id  INT,
    quantity    INT,
    PRIMARY KEY (order_id, product_id)  -- Composite primary key
);
```

**1NF Checklist:**

```
✅ Each cell has one value (atomic)
✅ Each column has a unique name
✅ Order of rows doesn't matter
✅ No repeating column groups (product1, product2, product3...)
```

### Second Normal Form (2NF)

**Rule:** Must be in 1NF + every non-key column must depend on the **entire** primary key (not just part of it).

This only applies when you have a **composite primary key**.

```sql
-- ❌ Violates 2NF
-- Composite PK: (order_id, product_id)
-- But 'product_name' only depends on product_id (partial dependency!)
CREATE TABLE bad_order_items (
    order_id     INT,
    product_id   INT,
    product_name VARCHAR(100),  -- ← Only depends on product_id, not order_id!
    quantity     INT,
    PRIMARY KEY (order_id, product_id)
);

-- ✅ 2NF: Split into separate tables
CREATE TABLE products (
    product_id   INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(100) NOT NULL,
    price        DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id   INT,
    product_id INT,
    quantity   INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### Third Normal Form (3NF)

**Rule:** Must be in 2NF + no **transitive dependencies** (non-key column depending on another non-key column).

```sql
-- ❌ Violates 3NF
-- zip_code → city, state (zip determines city & state, but zip isn't the PK!)
CREATE TABLE bad_customers (
    customer_id INT PRIMARY KEY,
    full_name   VARCHAR(100),
    zip_code    VARCHAR(10),
    city        VARCHAR(60),   -- ← depends on zip_code, not customer_id directly
    state       VARCHAR(30)    -- ← depends on zip_code, not customer_id directly
);

-- ✅ 3NF: Extract the transitive dependency
CREATE TABLE zip_codes (
    zip_code VARCHAR(10) PRIMARY KEY,
    city     VARCHAR(60),
    state    VARCHAR(30)
);

CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name   VARCHAR(100),
    zip_code    VARCHAR(10),
    FOREIGN KEY (zip_code) REFERENCES zip_codes(zip_code)
);
```

### Normalization Summary Table

```
Normal Form | Rule                                     | Violation Example
------------|------------------------------------------|------------------------------------------
1NF         | Atomic values, no repeating groups       | products = 'Laptop, Mouse'
2NF         | No partial dependencies (on composite PK)| product_name in order_items
3NF         | No transitive dependencies               | city depending on zip_code (not PK)
BCNF        | Stricter 3NF (every determinant is a key)| Rarely needed for most apps
```

### When to Stop Normalizing?

> **Practical advice:** For most web apps, 3NF is the sweet spot. Over-normalization (splitting too aggressively) leads to too many JOINs, which hurts performance. Sometimes **denormalization** (intentionally duplicating data) is done for performance in read-heavy systems. This is common in data warehouses and analytics databases.

---

## 12. Indexes — Making Queries Fast

### 🏎️ Analogy: A Book Index vs Reading Every Page

Without an index, MySQL reads **every row** to find a match (Full Table Scan). With an index, it jumps directly to the right location — like using a book's index to find "acid" instead of reading every page.

### How MySQL Finds Data Without an Index

```
Query: SELECT * FROM guests WHERE email = 'ahmed@email.com';

Without index:
MySQL reads row 1 → not ahmed@email.com
MySQL reads row 2 → not ahmed@email.com
MySQL reads row 3 → not ahmed@email.com
...
MySQL reads row 1,000,000 → FOUND!

This is O(n) — linear time. Terrible on large tables.
```

### How MySQL Finds Data With an Index (B-Tree)

```
With an index on email:
MySQL checks B-Tree index → jumps to 'ahmed@email.com' directly

This is O(log n) — logarithmic time. Much faster.

B-Tree structure (simplified):
                    [M]
                /        \
           [D-H]          [R-Z]
          /     \         /   \
       [ahmed] [james] [sarah] [yuki]
```

### Creating Indexes

```sql
-- Simple index on one column
CREATE INDEX idx_guests_country ON guests (country);

-- Unique index (enforces uniqueness + speeds up lookups)
-- Note: email already has UNIQUE constraint, which auto-creates an index
CREATE UNIQUE INDEX idx_guests_email ON guests (email);

-- Composite index (for queries filtering on multiple columns together)
CREATE INDEX idx_bookings_dates ON bookings (check_in, check_out);

-- Index for searching by guest_id in bookings
CREATE INDEX idx_bookings_guest ON bookings (guest_id);

-- Show all indexes on a table
SHOW INDEX FROM guests;
```

### When to Use Indexes

```
✅ DO index:
  • Columns in WHERE clauses (WHERE country = 'USA')
  • Columns in JOIN conditions (ON b.guest_id = g.guest_id)
  • Columns in ORDER BY (for large result sets)
  • Columns with high cardinality (many unique values: email, phone)
  • Foreign key columns

❌ DON'T index:
  • Columns rarely used in queries
  • Small tables (full scan is fine for < 1000 rows)
  • Columns with very low cardinality (is_available only has 0 or 1)
  • Tables with frequent INSERT/UPDATE/DELETE (indexes slow down writes)
```

### EXPLAIN — Seeing MySQL's Query Plan

```sql
-- The EXPLAIN keyword shows HOW MySQL executes a query
EXPLAIN SELECT * FROM guests WHERE email = 'ahmed@email.com';
```

#### Output of EXPLAIN:

```
+----+-------------+--------+-------+---------------+-------------------+---------+-------+------+-------+
| id | select_type | table  | type  | possible_keys | key               | key_len | ref   | rows | Extra |
+----+-------------+--------+-------+---------------+-------------------+---------+-------+------+-------+
|  1 | SIMPLE      | guests | const | idx_email     | idx_email         | 602     | const |    1 |       |
+----+-------------+--------+-------+---------------+-------------------+---------+-------+------+-------+

Explanation:
  type = 'const' → Best possible! Single row lookup via unique index.
  key = 'idx_email' → MySQL IS using the index.
  rows = 1 → MySQL only needs to examine 1 row.
```

```sql
-- Compare: query on a non-indexed column
EXPLAIN SELECT * FROM guests WHERE full_name = 'Ahmed Khan';
```

```
+----+-------------+--------+------+---------------+------+-----+------+------+-------------+
| id | select_type | table  | type | possible_keys | key  | len | ref  | rows | Extra       |
+----+-------------+--------+------+---------------+------+-----+------+------+-------------+
|  1 | SIMPLE      | guests | ALL  | NULL          | NULL | NULL| NULL |    6 |Where cond.  |
+----+-------------+--------+------+---------------+------+-----+------+------+-------------+

  type = 'ALL' → Full table scan! Worst case.
  key = NULL → No index used.
  rows = 6 → MySQL examines ALL 6 rows.
```

### Types of Indexes in MySQL

```
B-Tree Index (default)
  └─ Used for: =, <, >, BETWEEN, LIKE 'abc%', ORDER BY
  └─ Not used for: LIKE '%abc' (leading wildcard)

FULLTEXT Index
  └─ Used for: Natural language text search
  └─ CREATE FULLTEXT INDEX idx_ft ON articles (title, body);
  └─ SELECT * FROM articles WHERE MATCH(title, body) AGAINST('database');

HASH Index (MEMORY engine only)
  └─ Used for: Exact equality (=) only, very fast
  └─ Not used for: Range queries (<, >, BETWEEN)

Composite Index
  └─ CREATE INDEX idx ON table (col1, col2, col3);
  └─ Used for queries on: col1 | col1+col2 | col1+col2+col3
  └─ NOT used for: col2 alone or col3 alone (leftmost prefix rule!)
```

---

## 13. Transactions & ACID Properties

### 💳 Real-World Scenario: Bank Transfer

This is the most important concept for data integrity. Imagine transferring $500 from Account A to Account B:

```
Step 1: Deduct $500 from Account A
Step 2: Add $500 to Account B
```

What if the database crashes after Step 1 but before Step 2? **Money disappears!**

This is why we need **Transactions**.

### What is a Transaction?

A **transaction** is a group of SQL statements that are treated as a **single unit of work**. Either ALL succeed, or NONE of them happen.

```sql
-- Bank Transfer Example
START TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE account_id = 1;  -- Deduct from A
UPDATE accounts SET balance = balance + 500 WHERE account_id = 2;  -- Add to B

-- If both succeeded:
COMMIT;   -- Makes changes permanent

-- If something went wrong:
-- ROLLBACK;  -- Undoes everything back to before START TRANSACTION
```

### 🧠 DBMS Concept: ACID Properties

ACID is the set of guarantees that make database transactions reliable. Named after: **A**tomicity, **C**onsistency, **I**solation, **D**urability.

```
╔════════════════════════════════════════════════════════════════╗
║                    ACID PROPERTIES                            ║
╠════════════╦══════════════════════════════════════════════════╣
║ Atomicity  ║ All or nothing. If any step fails, ALL changes  ║
║            ║ are rolled back. Half a transfer doesn't exist. ║
╠════════════╬══════════════════════════════════════════════════╣
║ Consistency║ DB always moves from one valid state to another.║
║            ║ Can't have negative balance if rule says >= 0.  ║
╠════════════╬══════════════════════════════════════════════════╣
║ Isolation  ║ Concurrent transactions don't interfere.        ║
║            ║ Two users booking same seat → only one succeeds.║
╠════════════╬══════════════════════════════════════════════════╣
║ Durability ║ Committed data survives crashes. Written to disk.║
║            ║ Even if server dies right after COMMIT, data is ║
║            ║ safe.                                           ║
╚════════════╩══════════════════════════════════════════════════╝
```

### Practical Transaction: Hotel Booking

```sql
-- Full hotel booking as a transaction
START TRANSACTION;

-- Step 1: Verify room is available
SELECT is_available FROM rooms WHERE room_id = 3 FOR UPDATE;
-- FOR UPDATE locks the row so no other transaction can modify it

-- Step 2: Create the booking
INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount)
VALUES (5, 3, '2024-05-01', '2024-05-05', 600.00);

-- Step 3: Mark room as unavailable
UPDATE rooms SET is_available = 0 WHERE room_id = 3;

-- Step 4: Deduct from guest's loyalty points (example)
-- UPDATE guests SET loyalty_points = loyalty_points - 100 WHERE guest_id = 5;

-- If all steps succeeded:
COMMIT;

-- To undo everything if a step failed:
-- ROLLBACK;
```

### Transaction Isolation Levels

Isolation levels control how much transactions can "see" each other's in-progress changes.

```sql
-- View current isolation level
SELECT @@transaction_isolation;

-- Set isolation level
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

```
Isolation Level    | Dirty Read | Non-Repeatable | Phantom Read
-------------------|------------|----------------|-------------
READ UNCOMMITTED   | Possible   | Possible       | Possible     ← Dangerous
READ COMMITTED     | Prevented  | Possible       | Possible     ← Default PostgreSQL
REPEATABLE READ    | Prevented  | Prevented      | Possible     ← Default MySQL (InnoDB)
SERIALIZABLE       | Prevented  | Prevented      | Prevented    ← Safest, slowest

Dirty Read:          Reading uncommitted data from another transaction
Non-Repeatable Read: Re-reading same row gives different result (it was updated)
Phantom Read:        Re-running query returns different number of rows (rows added/deleted)
```

### SAVEPOINT — Partial Rollback

```sql
START TRANSACTION;

INSERT INTO bookings (...) VALUES (...);     -- Step 1

SAVEPOINT after_booking;                     -- Checkpoint!

UPDATE rooms SET is_available = 0 ...;       -- Step 2

-- If step 2 has a problem but step 1 was fine:
ROLLBACK TO SAVEPOINT after_booking;         -- Only undo from step 2 forward

-- Or commit everything
COMMIT;
```

---

## 14. Subqueries & Views

### Subqueries — Queries Inside Queries

A **subquery** is a query nested inside another query. Think of it as answering a question with another question: "Who earns more than the **average** salary?" First you need to find the average, then compare.

```sql
-- Find guests who spent more than the average booking amount
SELECT full_name, email
FROM guests
WHERE guest_id IN (
    SELECT guest_id
    FROM bookings
    WHERE total_amount > (SELECT AVG(total_amount) FROM bookings)
);
```

Breaking down the execution:

```
1. Inner-most: SELECT AVG(total_amount) FROM bookings  → 690.00
2. Middle:     SELECT guest_id FROM bookings WHERE total_amount > 690.00  → [2] (Sarah)
3. Outer:      SELECT full_name, email FROM guests WHERE guest_id IN [2]
```

#### Output:

```
+--------------+-----------------+
| full_name    | email           |
+--------------+-----------------+
| Sarah Connor | sarah@email.com |
+--------------+-----------------+
```

### Correlated Subqueries

A **correlated subquery** references the outer query — it runs once per row of the outer query.

```sql
-- Find guests whose total spending is above average for their country
SELECT g.full_name, g.country, b.total_amount
FROM guests g
JOIN bookings b ON g.guest_id = b.guest_id
WHERE b.total_amount > (
    SELECT AVG(b2.total_amount)
    FROM bookings b2
    JOIN guests g2 ON b2.guest_id = g2.guest_id
    WHERE g2.country = g.country   -- ← references outer query's g.country
);
```

### WITH Clause (Common Table Expressions / CTEs)

CTEs make complex subqueries readable by naming them. Think of them as temporary named result sets.

```sql
-- Find the highest-spending guest using a CTE
WITH booking_totals AS (
    SELECT
        guest_id,
        SUM(total_amount) AS total_spent
    FROM bookings
    GROUP BY guest_id
),
top_spender AS (
    SELECT guest_id, total_spent
    FROM booking_totals
    ORDER BY total_spent DESC
    LIMIT 1
)
SELECT g.full_name, g.country, ts.total_spent
FROM guests g
JOIN top_spender ts ON g.guest_id = ts.guest_id;
```

#### Output:

```
+--------------+---------+-------------+
| full_name    | country | total_spent |
+--------------+---------+-------------+
| Sarah Connor | USA     |     1600.00 |
+--------------+---------+-------------+
```

### Views — Saved Queries

A **View** is a saved SELECT query that acts like a virtual table. You query it just like a real table.

```sql
-- Create a view: full booking details
CREATE VIEW booking_details AS
SELECT
    b.booking_id,
    g.full_name     AS guest_name,
    g.country,
    r.room_number,
    r.room_type,
    b.check_in,
    b.check_out,
    DATEDIFF(b.check_out, b.check_in) AS nights,
    b.total_amount,
    b.status
FROM bookings b
JOIN guests g ON b.guest_id = g.guest_id
JOIN rooms  r ON b.room_id  = r.room_id;

-- Now query the view like a table!
SELECT * FROM booking_details WHERE status = 'confirmed';

SELECT guest_name, SUM(total_amount) AS total
FROM booking_details
GROUP BY guest_name;

-- Show all views
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Drop a view
DROP VIEW booking_details;
```

#### Output of `SELECT * FROM booking_details`:

```
+------------+--------------+---------+-------------+-----------+------------+------------+--------+--------------+-----------+
| booking_id | guest_name   | country | room_number | room_type | check_in   | check_out  | nights | total_amount | status    |
+------------+--------------+---------+-------------+-----------+------------+------------+--------+--------------+-----------+
|          1 | Ahmed Khan   | Pakistan| 201         | Double    | 2024-04-01 | 2024-04-05 |      4 |       600.00 | confirmed |
|          2 | Sarah Connor | USA     | 301         | Suite     | 2024-04-02 | 2024-04-06 |      4 |      1600.00 | confirmed |
|          3 | Maria Lopez  | Spain   | 101         | Single    | 2024-04-03 | 2024-04-07 |      4 |       320.00 | confirmed |
|          4 | James Wright | UK      | 102         | Single    | 2024-04-01 | 2024-04-04 |      3 |       240.00 | confirmed |
+------------+--------------+---------+-------------+-----------+------------+------------+--------+--------------+-----------+
```

---

## 15. Stored Procedures & Functions

### 🏭 Analogy: Functions are Like Vending Machines

You put in coins (parameters), press a button (call the function), and get a result (return value) without knowing the internal mechanics.

### Stored Procedures

A **stored procedure** is a named block of SQL you save and call by name. Great for complex multi-step operations.

```sql
DELIMITER //

CREATE PROCEDURE make_booking(
    IN  p_guest_id    INT,
    IN  p_room_id     INT,
    IN  p_check_in    DATE,
    IN  p_check_out   DATE,
    OUT p_booking_id  INT,
    OUT p_message     VARCHAR(200)
)
BEGIN
    DECLARE v_available TINYINT;
    DECLARE v_price     DECIMAL(10,2);
    DECLARE v_nights    INT;
    DECLARE v_total     DECIMAL(10,2);

    -- Check if room is available
    SELECT is_available, price_per_night
    INTO v_available, v_price
    FROM rooms
    WHERE room_id = p_room_id;

    IF v_available = 0 THEN
        SET p_booking_id = -1;
        SET p_message = 'Room is not available for selected dates.';
    ELSE
        -- Calculate total
        SET v_nights = DATEDIFF(p_check_out, p_check_in);
        SET v_total  = v_nights * v_price;

        START TRANSACTION;

        INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount)
        VALUES (p_guest_id, p_room_id, p_check_in, p_check_out, v_total);

        SET p_booking_id = LAST_INSERT_ID();

        UPDATE rooms SET is_available = 0 WHERE room_id = p_room_id;

        COMMIT;

        SET p_message = CONCAT('Booking confirmed! ID: ', p_booking_id, '. Total: $', v_total);
    END IF;
END //

DELIMITER ;

-- Call the procedure
CALL make_booking(5, 4, '2024-05-01', '2024-05-03', @booking_id, @msg);
SELECT @booking_id AS booking_id, @msg AS message;
```

#### Output:

```
+------------+----------------------------------------------+
| booking_id | message                                      |
+------------+----------------------------------------------+
|          5 | Booking confirmed! ID: 5. Total: $300.00    |
+------------+----------------------------------------------+
```

### Stored Functions

A **stored function** returns a single value and can be used inline in SQL.

```sql
DELIMITER //

CREATE FUNCTION calculate_nights(
    check_in  DATE,
    check_out DATE
) RETURNS INT DETERMINISTIC
BEGIN
    RETURN DATEDIFF(check_out, check_in);
END //

CREATE FUNCTION get_booking_total(
    p_room_id INT,
    p_nights  INT
) RETURNS DECIMAL(10,2) DETERMINISTIC
BEGIN
    DECLARE v_price DECIMAL(10,2);
    SELECT price_per_night INTO v_price FROM rooms WHERE room_id = p_room_id;
    RETURN v_price * p_nights;
END //

DELIMITER ;

-- Use functions inline in queries
SELECT
    room_number,
    room_type,
    get_booking_total(room_id, 5) AS cost_for_5_nights
FROM rooms
ORDER BY cost_for_5_nights;
```

#### Output:

```
+-------------+-----------+-------------------+
| room_number | room_type | cost_for_5_nights |
+-------------+-----------+-------------------+
| 101         | Single    |            400.00 |
| 102         | Single    |            400.00 |
| 201         | Double    |            750.00 |
| 202         | Double    |            750.00 |
| 301         | Suite     |           2000.00 |
+-------------+-----------+-------------------+
```

### Triggers — Automatic Actions

A **trigger** fires automatically when something happens (INSERT, UPDATE, DELETE).

```sql
-- Automatically update room availability when booking is deleted
DELIMITER //

CREATE TRIGGER after_booking_delete
AFTER DELETE ON bookings
FOR EACH ROW
BEGIN
    UPDATE rooms
    SET is_available = 1
    WHERE room_id = OLD.room_id;
END //

-- Log price changes in an audit table
CREATE TABLE room_price_audit (
    audit_id    INT AUTO_INCREMENT PRIMARY KEY,
    room_id     INT,
    old_price   DECIMAL(10,2),
    new_price   DECIMAL(10,2),
    changed_by  VARCHAR(100) DEFAULT USER(),
    changed_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER before_price_update
BEFORE UPDATE ON rooms
FOR EACH ROW
BEGIN
    IF NEW.price_per_night != OLD.price_per_night THEN
        INSERT INTO room_price_audit (room_id, old_price, new_price)
        VALUES (OLD.room_id, OLD.price_per_night, NEW.price_per_night);
    END IF;
END //

DELIMITER ;
```

---

## 16. CAP Theorem

### 🧠 DBMS Concept: What is CAP Theorem?

The **CAP Theorem** (by Eric Brewer, 2000) states that a distributed database system can only guarantee **2 out of 3** properties at the same time:

```
╔══════════════════════════════════════════════════════════╗
║                   CAP THEOREM                           ║
║                                                          ║
║           CONSISTENCY (C)                                ║
║               /\                                         ║
║              /  \                                        ║
║             /    \                                       ║
║            / CP   \  CA                                  ║
║           /--------\                                     ║
║          /    AP    \                                    ║
║         /            \                                   ║
║ AVAILABILITY (A) ---- PARTITION TOLERANCE (P)            ║
╚══════════════════════════════════════════════════════════╝

C = Consistency     → Every read returns the most recent write
A = Availability    → Every request gets a response (not error)
P = Partition Tol.  → System works even if network splits occur

The Catch: Network partitions ALWAYS happen in distributed systems.
So you really choose between C and A when a partition occurs.
```

### Real-World Analogy: The ATM Network

```
Scenario: You withdraw $200 from ATM in Karachi.
At the same moment, someone uses your card in Dubai.

CA System (no partition tolerance):
  → If network between Karachi and Dubai breaks, STOP all transactions.
  → High consistency, but unavailable during network issues.

CP System (Consistent + Partition Tolerant):
  → During network split: one ATM refuses to process (returns error)
  → You might get "Service Unavailable" but your balance is never wrong
  → Example: HBase, Zookeeper, traditional SQL databases

AP System (Available + Partition Tolerant):
  → During network split: both ATMs process
  → Eventually both sides sync up (eventual consistency)
  → Your balance might temporarily show wrong values
  → Example: Cassandra, DynamoDB, CouchDB
```

### Where MySQL Fits

```
MySQL (single node):
  → Not distributed, so CAP doesn't directly apply
  → Provides ACID (which implies Strong Consistency)

MySQL with replication:
  → Primary-Replica setup = AP (slight replication lag)
  → During partition, replica might serve stale data

MySQL Cluster (NDB):
  → Aims for CP (consistency + partition tolerance)

MongoDB:
  → Configurable: default is CP (Primary reads)
  → Can be AP (secondary reads allowed during partition)

Cassandra:
  → AP by design, eventual consistency
  → Tunable consistency (QUORUM, ONE, ALL, etc.)
```

### PACELC — The Modern Extension

```
PACELC extends CAP:
  IF Partition (P):     Choose Availability (A) or Consistency (C)
  ELSE (E):             Choose Latency (L) or Consistency (C)

Real trade-off even without failures:
  Low latency   = might read stale data (Cassandra)
  Consistency   = might have higher latency (must sync all nodes)

System Examples:
  MySQL/PostgreSQL: PC/EC  (Consistent always)
  DynamoDB:         PA/EL  (Available + Low Latency)
  Cassandra:        PA/EL  (Available + Low Latency, tunable)
  HBase:            PC/EC  (Consistent always)
  MongoDB:          PC/EC  (default, configurable)
```

---

## 17. Real-World Project: E-Commerce Schema

### 🛍️ Building a Complete E-Commerce Database

Let's pull everything together. Here's a realistic, normalized e-commerce schema using all the concepts we've learned.

```sql
CREATE DATABASE ecommerce;
USE ecommerce;

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
    user_id    BIGINT       NOT NULL AUTO_INCREMENT,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password_hash CHAR(64)  NOT NULL,  -- SHA-256 hash
    full_name  VARCHAR(100),
    phone      VARCHAR(20),
    created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
    is_active  TINYINT(1)   DEFAULT 1,
    PRIMARY KEY (user_id),
    INDEX idx_email (email)
);

-- =============================================
-- ADDRESSES (separate table → 3NF)
-- =============================================
CREATE TABLE addresses (
    address_id  BIGINT      NOT NULL AUTO_INCREMENT,
    user_id     BIGINT      NOT NULL,
    label       VARCHAR(30) DEFAULT 'Home',  -- 'Home', 'Office', etc.
    street      VARCHAR(200) NOT NULL,
    city        VARCHAR(60)  NOT NULL,
    country     VARCHAR(60)  NOT NULL,
    postal_code VARCHAR(20),
    is_default  TINYINT(1)  DEFAULT 0,
    PRIMARY KEY (address_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================
-- CATEGORIES (self-referential for hierarchy)
-- =============================================
CREATE TABLE categories (
    category_id   INT         NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100) NOT NULL,
    parent_id     INT,  -- NULL = top-level category
    PRIMARY KEY (category_id),
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

-- Example hierarchy:
-- Electronics (id=1, parent=NULL)
--   └── Laptops (id=2, parent=1)
--       └── Gaming Laptops (id=3, parent=2)

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
    product_id    BIGINT       NOT NULL AUTO_INCREMENT,
    category_id   INT          NOT NULL,
    name          VARCHAR(200) NOT NULL,
    description   TEXT,
    sku           VARCHAR(50)  UNIQUE NOT NULL,  -- Stock Keeping Unit
    price         DECIMAL(10,2) NOT NULL,
    stock_qty     INT           NOT NULL DEFAULT 0,
    is_active     TINYINT(1)   DEFAULT 1,
    created_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id),
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    FULLTEXT INDEX ft_search (name, description)
);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE orders (
    order_id      BIGINT       NOT NULL AUTO_INCREMENT,
    user_id       BIGINT       NOT NULL,
    address_id    BIGINT       NOT NULL,
    status        ENUM('pending','processing','shipped','delivered','cancelled')
                               NOT NULL DEFAULT 'pending',
    subtotal      DECIMAL(10,2) NOT NULL,
    tax           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    shipping_fee  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total         DECIMAL(10,2) NOT NULL,
    placed_at     DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    FOREIGN KEY (address_id) REFERENCES addresses(address_id),
    INDEX idx_user_orders (user_id, placed_at)
);

-- =============================================
-- ORDER ITEMS (Junction table: orders ↔ products)
-- =============================================
CREATE TABLE order_items (
    item_id      BIGINT        NOT NULL AUTO_INCREMENT,
    order_id     BIGINT        NOT NULL,
    product_id   BIGINT        NOT NULL,
    quantity     INT           NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,  -- Price at time of purchase (snapshot!)
    subtotal     DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    PRIMARY KEY (item_id),
    UNIQUE KEY uq_order_product (order_id, product_id),
    FOREIGN KEY (order_id)   REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
    review_id    BIGINT   NOT NULL AUTO_INCREMENT,
    product_id   BIGINT   NOT NULL,
    user_id      BIGINT   NOT NULL,
    rating       TINYINT  NOT NULL,
    title        VARCHAR(200),
    body         TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    UNIQUE KEY uq_user_product_review (user_id, product_id),  -- One review per user per product
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (user_id)    REFERENCES users(user_id),
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
    INDEX idx_product_reviews (product_id, rating)
);
```

### E-Commerce ER Diagram

```
┌──────────┐    ┌────────────────┐    ┌───────────────┐
│  users   │    │   addresses    │    │  categories   │
│──────────│    │────────────────│    │───────────────│
│PK user_id│───►│PK address_id   │    │PK category_id │◄─┐
│  username│    │FK user_id      │    │   name        │  │ (self-ref)
│  email   │    │   street       │    │FK parent_id ──┘  │
│  password│    │   city         │    └───────┬───────────┘
│  phone   │    │   country      │            │ 1
└────┬─────┘    └────────────────┘            │
     │ 1                                      │ Many
     │                                 ┌──────▼───────┐
     │ Many                            │   products   │
     │                                 │──────────────│
┌────▼──────┐                         │PK product_id │
│  orders   │                         │FK category_id│
│───────────│                         │   name       │
│PK order_id│                         │   price      │
│FK user_id │                         │   stock_qty  │
│FK address │   ┌───────────────┐     │   sku        │
│   status  │──►│  order_items  │◄────┤              │
│   total   │   │───────────────│     └──────────────┘
└───────────┘   │PK item_id     │
     │ 1        │FK order_id    │     ┌───────────────┐
     │          │FK product_id  │     │    reviews    │
     │          │   quantity    │     │───────────────│
     │          │   unit_price  │     │PK review_id   │
     │          └───────────────┘     │FK product_id  │
     │                                │FK user_id     │
     └────────────────────────────────┤   rating 1-5  │
                                      │   body        │
                                      └───────────────┘
```

### Complex E-Commerce Queries

```sql
-- 1. Top 5 best-selling products (with revenue)
SELECT
    p.name,
    p.sku,
    SUM(oi.quantity)   AS units_sold,
    SUM(oi.subtotal)   AS total_revenue,
    AVG(r.rating)      AS avg_rating,
    COUNT(r.review_id) AS review_count
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders      o  ON oi.order_id  = o.order_id
LEFT JOIN reviews r ON p.product_id = r.product_id
WHERE o.status != 'cancelled'
GROUP BY p.product_id, p.name, p.sku
ORDER BY units_sold DESC
LIMIT 5;

-- 2. Users who spent more than $1000 (VIP customers)
SELECT
    u.full_name,
    u.email,
    COUNT(o.order_id)   AS total_orders,
    SUM(o.total)        AS lifetime_value
FROM users u
JOIN orders o ON u.user_id = o.user_id
WHERE o.status NOT IN ('cancelled')
GROUP BY u.user_id, u.full_name, u.email
HAVING lifetime_value > 1000
ORDER BY lifetime_value DESC;

-- 3. Products low on stock (< 10 units) that are actively ordered
SELECT
    p.name,
    p.sku,
    p.stock_qty,
    COUNT(oi.item_id) AS pending_order_items
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders      o  ON oi.order_id  = o.order_id
WHERE p.stock_qty < 10
  AND o.status IN ('pending', 'processing')
GROUP BY p.product_id, p.name, p.sku, p.stock_qty
ORDER BY p.stock_qty ASC;

-- 4. Place an order as a transaction
START TRANSACTION;

-- Create the order
INSERT INTO orders (user_id, address_id, subtotal, tax, shipping_fee, total)
VALUES (1, 1, 1299.99, 130.00, 15.00, 1444.99);

SET @new_order_id = LAST_INSERT_ID();

-- Add items
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES
    (@new_order_id, 1, 1, 1299.99);

-- Deduct stock
UPDATE products
SET stock_qty = stock_qty - 1
WHERE product_id = 1 AND stock_qty >= 1;

-- If stock deduction didn't affect any row (out of stock):
-- ROLLBACK;

COMMIT;

-- 5. Full-text search on products
SELECT name, price,
       MATCH(name, description) AGAINST('gaming laptop fast') AS relevance_score
FROM products
WHERE MATCH(name, description) AGAINST('gaming laptop fast' IN NATURAL LANGUAGE MODE)
ORDER BY relevance_score DESC;
```

---

## 🎯 Quick Reference Cheat Sheet

### DDL (Data Definition Language)

```sql
CREATE DATABASE db_name;
DROP DATABASE db_name;
CREATE TABLE t (col TYPE CONSTRAINTS, PRIMARY KEY(col));
ALTER TABLE t ADD COLUMN col TYPE;
ALTER TABLE t DROP COLUMN col;
DROP TABLE t;
TRUNCATE TABLE t;
```

### DML (Data Manipulation Language)

```sql
INSERT INTO t (col1, col2) VALUES (v1, v2);
SELECT col1, col2 FROM t WHERE condition;
UPDATE t SET col1 = v1 WHERE condition;
DELETE FROM t WHERE condition;
```

### DCL (Data Control Language)

```sql
GRANT SELECT, INSERT ON db.table TO 'user'@'host';
REVOKE INSERT ON db.table FROM 'user'@'host';
```

### TCL (Transaction Control Language)

```sql
START TRANSACTION;
COMMIT;
ROLLBACK;
SAVEPOINT name;
ROLLBACK TO SAVEPOINT name;
```

### Key Clauses & Functions

```sql
WHERE    → Filter rows          |  COUNT(), SUM(), AVG(), MAX(), MIN()
GROUP BY → Group rows           |  NOW(), CURDATE(), DATEDIFF(a, b)
HAVING   → Filter groups        |  CONCAT(a, b), UPPER(), LOWER()
ORDER BY → Sort results         |  IFNULL(col, 'default')
LIMIT    → Restrict row count   |  COALESCE(col1, col2, 'fallback')
DISTINCT → Unique values        |  CASE WHEN x THEN y ELSE z END
```

### JOIN Summary

```sql
INNER JOIN  → Matching rows only
LEFT JOIN   → All from left + matching from right (NULL if no match)
RIGHT JOIN  → Matching from left + all from right (NULL if no match)
CROSS JOIN  → Every combination of rows from both tables
SELF JOIN   → Table joined to itself (use aliases: a, b)
```

---

## 🧠 Key Concepts Summary

```
DBMS Concept         | What It Does                          | Where Used
---------------------|---------------------------------------|------------------
Primary Key          | Uniquely identifies each row          | Every table
Foreign Key          | Links tables, enforces integrity      | Relational tables
Normalization (1-3NF)| Removes redundancy                    | Schema design
Indexes (B-Tree)     | Speeds up queries                     | Large tables
Transactions         | Groups operations atomically          | Financial ops
ACID                 | Guarantees reliability                | All RDBMS
Views                | Saved queries as virtual tables       | Reporting
Stored Procedures    | Reusable SQL logic blocks             | Complex ops
Triggers             | Auto-run on INSERT/UPDATE/DELETE      | Auditing, sync
CAP Theorem          | Distributed system trade-offs         | Architecture
```

---

_This guide covers MySQL from beginner through intermediate, with real-world hotel and e-commerce scenarios, visual table outputs, and core DBMS theory integrated where it's actually used. Next steps: explore MySQL replication, partitioning, and query optimization with EXPLAIN ANALYZE._
