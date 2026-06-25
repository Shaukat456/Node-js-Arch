# MongoDB & MySQL: The Complete Side-by-Side Guide
### From Beginner to Intermediate — with DBMS Concepts, Real-World Scenarios & Visual Diagrams

---

> **How to use this guide:** Every concept is taught *simultaneously* in both databases. Left-side panels show MySQL (relational), right-side panels show MongoDB (document). Read them together to understand how the same idea is expressed differently.

---

## Table of Contents

1. [What is a Database? (DBMS Fundamentals)](#1-what-is-a-database)
2. [Relational vs Document Model](#2-relational-vs-document-model)
3. [Installation & Setup](#3-installation--setup)
4. [Data Modeling & Schema Design](#4-data-modeling--schema-design)
5. [CRUD Operations](#5-crud-operations)
6. [Data Types](#6-data-types)
7. [Relationships & Joins](#7-relationships--joins)
8. [Normalization (DBMS Deep Dive)](#8-normalization)
9. [Indexes](#9-indexes)
10. [Transactions & ACID Properties](#10-transactions--acid-properties)
11. [Aggregation & Analytics](#11-aggregation--analytics)
12. [CAP Theorem](#12-cap-theorem)
13. [Security & Users](#13-security--users)
14. [Performance & Query Optimization](#14-performance--query-optimization)
15. [Real-World Use Cases: When to Use Which?](#15-real-world-use-cases)
16. [Quick Reference Cheat Sheet](#16-quick-reference-cheat-sheet)

---

## 1. What is a Database?

### 🏦 The Bank Analogy

Imagine you run a **bank**. You have thousands of customers, millions of transactions, account balances, loans, and staff records. You *could* store all this in Excel spreadsheets on someone's laptop — but what happens when:

- Two tellers update the same account at the same time?
- The laptop crashes and you lose everything?
- You need to find every transaction over $10,000 in the last 30 days in under a second?
- You have 10 million customers and need fast lookups?

A **Database Management System (DBMS)** solves all of these problems.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHAT A DBMS PROVIDES                         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Storage    │  │   Querying   │  │  Concurrency Control │  │
│  │              │  │              │  │                      │  │
│  │  Persistent  │  │  Fast data   │  │  Multiple users can  │  │
│  │  organized   │  │  retrieval   │  │  read/write safely   │  │
│  │  data on     │  │  using SQL   │  │  at the same time    │  │
│  │  disk        │  │  or queries  │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Security   │  │   Integrity  │  │     Recovery         │  │
│  │              │  │              │  │                      │  │
│  │  Control who │  │  Rules that  │  │  Restore data after  │  │
│  │  can read/   │  │  keep data   │  │  crash or failure    │  │
│  │  write what  │  │  consistent  │  │  using logs/backups  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Key DBMS Terminology

| Term | Plain English | Bank Example |
|------|---------------|--------------|
| **Database** | A named container of related data | "Chase Bank Database" |
| **Table / Collection** | A category of similar records | "Accounts" table |
| **Row / Document** | One single record | One customer's account |
| **Column / Field** | One property of a record | "account_balance" |
| **Schema** | The blueprint/structure of data | Fields every account must have |
| **Query** | A question you ask the database | "Show all accounts with balance > $1000" |
| **Index** | A lookup shortcut for fast queries | Like the index at the back of a book |
| **Transaction** | A group of operations that must ALL succeed | Transfer: debit A AND credit B |

---

## 2. Relational vs Document Model

### 🗂️ The Filing Cabinet vs Scrapbook Analogy

**MySQL (Relational)** is like a perfectly organized **filing cabinet**:
- Every drawer has a label (table name)
- Every folder has identical fields (columns)
- All folders must follow the exact same format
- Folders reference each other by ID numbers
- Very structured, very consistent

**MongoDB (Document)** is like a **scrapbook**:
- Each page (document) can look completely different
- You can paste photos, text, sticky notes — whatever fits
- Pages can contain other pages (nested documents)
- Very flexible, great for varied or evolving data

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RELATIONAL MODEL (MySQL)                             │
│                                                                         │
│   users table                    orders table                           │
│  ┌────┬──────────┬─────────┐    ┌────┬─────────┬────────┬──────────┐  │
│  │ id │  name    │  email  │    │ id │user_id  │product │  amount  │  │
│  ├────┼──────────┼─────────┤    ├────┼─────────┼────────┼──────────┤  │
│  │  1 │ Alice    │ a@x.com │    │  1 │    1    │ Laptop │  999.00  │  │
│  │  2 │ Bob      │ b@x.com │    │  2 │    1    │ Mouse  │   29.99  │  │
│  │  3 │ Carol    │ c@x.com │    │  3 │    2    │ Tablet │  499.00  │  │
│  └────┴──────────┴─────────┘    └────┴─────────┴────────┴──────────┘  │
│                                          ↑                              │
│                           Foreign key references users.id               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT MODEL (MongoDB)                             │
│                                                                         │
│   users collection                                                      │
│  {                                                                      │
│    _id: ObjectId("abc123"),                                             │
│    name: "Alice",                                                       │
│    email: "a@x.com",                                                    │
│    orders: [                    ← Orders EMBEDDED inside user!          │
│      { product: "Laptop", amount: 999.00 },                            │
│      { product: "Mouse",  amount:  29.99 }                             │
│    ],                                                                   │
│    address: {                   ← Nested object                         │
│      city: "New York",                                                  │
│      zip: "10001"                                                       │
│    }                                                                    │
│  }                                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

### When Would You Choose Each?

```
┌─────────────────────────────────────────────────────────────────────────┐
│              MySQL ✅                     MongoDB ✅                    │
├─────────────────────────────────────────────────────────────────────────┤
│  Banking & Finance                  │  Product catalogs                │
│  E-commerce (orders/inventory)      │  User profiles                   │
│  HR systems                         │  Content management (blogs/CMS)  │
│  ERP / accounting software          │  Real-time analytics             │
│  When data is highly structured     │  IoT sensor data                 │
│  When you need complex JOINs        │  Mobile app backends             │
│  Strict consistency required        │  Rapidly changing schema         │
│  Reporting & BI                     │  Hierarchical/nested data        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Installation & Setup

### MySQL Setup

```bash
# Ubuntu/Debian
sudo apt-get install mysql-server
sudo mysql_secure_installation

# macOS
brew install mysql
brew services start mysql

# Connect
mysql -u root -p
```

```sql
-- Create a database (think: create a new filing cabinet)
CREATE DATABASE ecommerce;

-- Use it
USE ecommerce;

-- See all databases
SHOW DATABASES;

-- See all tables in current database
SHOW TABLES;
```

### MongoDB Setup

```bash
# Ubuntu (official repo)
sudo apt-get install mongodb-org
sudo systemctl start mongod

# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Connect via shell
mongosh
```

```javascript
// Switch to (or create) a database
use ecommerce

// Show all databases
show dbs

// Show all collections
show collections

// Current database name
db.getName()
```

> **Key Difference:** In MySQL you must `CREATE DATABASE` explicitly. In MongoDB, a database and collection are **created automatically** the moment you first insert data into them — no setup required!

---

## 4. Data Modeling & Schema Design

### 🏗️ Real-World Scenario: Building an E-Commerce System

Let's model an e-commerce platform with: **Users**, **Products**, **Orders**, and **Reviews**.

#### MySQL: Schema-First Design

In MySQL, you design your schema *before* inserting any data. Every table has a fixed structure.

```sql
-- Users Table
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active   BOOLEAN DEFAULT TRUE
);

-- Products Table
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    stock_qty   INT DEFAULT 0,
    category    VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    status      ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
    total       DECIMAL(10, 2) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items (many-to-many bridge table)
CREATE TABLE order_items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    order_id    INT NOT NULL,
    product_id  INT NOT NULL,
    quantity    INT NOT NULL,
    unit_price  DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews Table
CREATE TABLE reviews (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    product_id  INT NOT NULL,
    rating      TINYINT CHECK (rating BETWEEN 1 AND 5),
    body        TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

```
┌─────────────────────────────────────────────────────────────────────┐
│              MySQL E-Commerce Entity Relationship Diagram            │
│                                                                     │
│   ┌──────────┐         ┌──────────┐         ┌──────────────┐       │
│   │  users   │  1    * │  orders  │  1    * │ order_items  │       │
│   ├──────────┤─────────├──────────┤─────────├──────────────┤       │
│   │ id (PK)  │         │ id (PK)  │         │ id (PK)      │       │
│   │ email    │         │ user_id  │         │ order_id(FK) │       │
│   │ name     │         │ status   │         │ product_id   │       │
│   │ ...      │         │ total    │         │ quantity     │       │
│   └──────────┘         └──────────┘         │ unit_price   │       │
│                                             └──────┬───────┘       │
│   ┌──────────┐                                     │ *             │
│   │ reviews  │  *                                  │               │
│   ├──────────┤        ┌──────────┐         1 ┌─────┴──────┐       │
│   │ id (PK)  │────────│ products │───────────│  products  │       │
│   │ user_id  │  *   1 ├──────────┤           ├────────────┤       │
│   │product_id│        │ id (PK)  │           │ id (PK)    │       │
│   │ rating   │        │ name     │           │ name       │       │
│   │ body     │        │ price    │           │ price      │       │
│   └──────────┘        │ stock_qty│           │ ...        │       │
│                       └──────────┘           └────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

#### MongoDB: Schema-Flexible Design

In MongoDB, you define structure in your application code, not in the database. Collections have no enforced schema by default (though you *can* add validation).

```javascript
// No "CREATE TABLE" needed! Just insert and the collection is created.

// users collection - document example
{
  _id: ObjectId("64a1f2b3c4d5e6f7a8b9c0d1"),
  email: "alice@example.com",
  firstName: "Alice",
  lastName: "Smith",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  isActive: true,
  // You can add extra fields any time — no migration needed!
  address: {                       // Embedded sub-document
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "US"
  },
  preferences: {                   // Flexible — users can have different prefs
    newsletter: true,
    theme: "dark"
  }
}

// products collection - document example
{
  _id: ObjectId("64a1f2b3c4d5e6f7a8b9c0d2"),
  name: "MacBook Pro 16-inch",
  price: 2499.00,
  stockQty: 45,
  category: "Electronics",
  tags: ["laptop", "apple", "portable"],   // Arrays are native!
  specs: {                                  // Nested object for product specs
    cpu: "M3 Pro",
    ram: "18GB",
    storage: "512GB SSD"
  },
  images: [                                 // Array of sub-documents
    { url: "https://cdn.example.com/mac-front.jpg", isPrimary: true },
    { url: "https://cdn.example.com/mac-side.jpg",  isPrimary: false }
  ]
}

// orders collection - with embedded items (denormalized)
{
  _id: ObjectId("64a1f2b3c4d5e6f7a8b9c0d3"),
  userId: ObjectId("64a1f2b3c4d5e6f7a8b9c0d1"),  // Reference to user
  status: "delivered",
  items: [                                          // Items embedded in order
    {
      productId: ObjectId("64a1f2b3c4d5e6f7a8b9c0d2"),
      productName: "MacBook Pro 16-inch",           // Denormalized for speed
      quantity: 1,
      unitPrice: 2499.00
    },
    {
      productId: ObjectId("64a2..."),
      productName: "Magic Mouse",
      quantity: 1,
      unitPrice: 79.00
    }
  ],
  total: 2578.00,
  shippingAddress: {                               // Snapshot at time of order
    street: "123 Main St",
    city: "New York",
    zip: "10001"
  },
  createdAt: ISODate("2024-03-10T14:22:00Z")
}
```

> **Key Design Decision — Embed vs Reference:**
>
> - **Embed** (put inside the document) when: data is always accessed together, sub-data doesn't grow unboundedly, 1-to-few relationship
> - **Reference** (store ID, join in app) when: data is accessed independently, many-to-many relationship, data could grow large

---

## 5. CRUD Operations

### 🛒 Scenario: Managing Products in Our E-Commerce Store

CRUD = **C**reate, **R**ead, **U**pdate, **D**elete — the four fundamental data operations.

---

### CREATE (Insert Data)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CREATE / INSERT                              │
├────────────────────────────────────┬────────────────────────────────────┤
│           MySQL (SQL)              │         MongoDB (JS/Shell)         │
├────────────────────────────────────┼────────────────────────────────────┤
│                                    │                                    │
│ INSERT INTO products               │ db.products.insertOne({           │
│   (name, price, stock_qty,         │   name: "Wireless Headphones",    │
│    category)                       │   price: 149.99,                  │
│ VALUES                             │   stockQty: 200,                  │
│   ('Wireless Headphones',          │   category: "Electronics",        │
│    149.99, 200, 'Electronics');    │   tags: ["audio", "wireless"]     │
│                                    │ })                                │
│ -- Insert multiple rows            │                                    │
│ INSERT INTO products               │ // Insert multiple documents       │
│   (name, price, category)          │ db.products.insertMany([{         │
│ VALUES                             │   name: "USB-C Cable",            │
│   ('USB-C Cable', 9.99, 'Cables'), │   price: 9.99,                   │
│   ('HDMI Cable', 14.99, 'Cables'), │   category: "Cables"             │
│   ('Webcam', 79.99, 'Electronics');│ }, {                              │
│                                    │   name: "HDMI Cable",             │
│                                    │   price: 14.99,                   │
│                                    │   category: "Cables"              │
│                                    │ }])                               │
└────────────────────────────────────┴────────────────────────────────────┘
```

> **MySQL:** You must list columns and values that match your schema. Unknown columns = error.
> **MongoDB:** No predefined structure. Add any fields you want per document.

---

### READ (Query Data)

```sql
-- MySQL: Basic SELECT
-- Get all products
SELECT * FROM products;

-- Get specific columns
SELECT name, price FROM products;

-- Filter with WHERE
SELECT * FROM products 
WHERE price < 100;

-- Multiple conditions
SELECT * FROM products 
WHERE price < 100 
  AND category = 'Electronics';

-- Pattern matching (LIKE)
SELECT * FROM products 
WHERE name LIKE '%Cable%';

-- Sort results
SELECT * FROM products 
ORDER BY price DESC;

-- Limit results
SELECT * FROM products 
ORDER BY price ASC 
LIMIT 10;

-- Count records
SELECT COUNT(*) FROM products 
WHERE category = 'Electronics';

-- Find one specific record
SELECT * FROM products 
WHERE id = 5;
```

```javascript
// MongoDB: find() queries

// Get all documents
db.products.find()

// Get specific fields (projection)
// 1 = include, 0 = exclude
db.products.find({}, { name: 1, price: 1, _id: 0 })

// Filter with query object
db.products.find({ price: { $lt: 100 } })

// Multiple conditions (implicit AND)
db.products.find({
  price: { $lt: 100 },
  category: "Electronics"
})

// Pattern matching (regex)
db.products.find({
  name: { $regex: /Cable/i }
})

// Sort results (1=ASC, -1=DESC)
db.products.find().sort({ price: -1 })

// Limit results
db.products.find()
  .sort({ price: 1 })
  .limit(10)

// Count documents
db.products.countDocuments({ category: "Electronics" })

// Find one document
db.products.findOne({ _id: ObjectId("64a1...") })
```

### MongoDB Comparison Operators

```
┌─────────────────────────────────────────────────────────────────┐
│         MySQL Operator  →  MongoDB Equivalent                   │
├─────────────────────────────────────────────────────────────────┤
│  =          →  { field: value }  or  { field: { $eq: value } } │
│  != or <>   →  { field: { $ne: value } }                        │
│  >          →  { field: { $gt: value } }                        │
│  >=         →  { field: { $gte: value } }                       │
│  <          →  { field: { $lt: value } }                        │
│  <=         →  { field: { $lte: value } }                       │
│  IN (a,b,c) →  { field: { $in: [a, b, c] } }                   │
│  NOT IN     →  { field: { $nin: [a, b, c] } }                  │
│  AND        →  { cond1, cond2 } or { $and: [...] }              │
│  OR         →  { $or: [{ cond1 }, { cond2 }] }                 │
│  IS NULL    →  { field: null } or { field: { $exists: false }}  │
│  LIKE '%x%' →  { field: /x/ }   (regex)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### UPDATE

```sql
-- MySQL: UPDATE
-- Update a single record
UPDATE products 
SET price = 129.99 
WHERE id = 1;

-- Update multiple columns
UPDATE products 
SET price = 129.99, 
    stock_qty = 150
WHERE id = 1;

-- Update all records matching condition
UPDATE products 
SET price = price * 0.9  -- 10% discount
WHERE category = 'Electronics';

-- Increment a value
UPDATE products 
SET stock_qty = stock_qty - 1 
WHERE id = 1;
```

```javascript
// MongoDB: updateOne / updateMany

// Update one document - set new value
db.products.updateOne(
  { _id: ObjectId("64a1...") },  // filter
  { $set: { price: 129.99 } }    // update
)

// Update multiple fields
db.products.updateOne(
  { _id: ObjectId("64a1...") },
  { $set: { price: 129.99, stockQty: 150 } }
)

// Update many documents
db.products.updateMany(
  { category: "Electronics" },
  { $mul: { price: 0.9 } }    // multiply price by 0.9
)

// Increment a field ($inc)
db.products.updateOne(
  { _id: ObjectId("64a1...") },
  { $inc: { stockQty: -1 } }  // decrement by 1
)

// Add to an array ($push)
db.products.updateOne(
  { _id: ObjectId("64a1...") },
  { $push: { tags: "sale" } }
)

// Upsert (insert if not found, update if found)
db.products.updateOne(
  { sku: "HEADPH-001" },
  { $set: { price: 149.99, name: "Headphones" } },
  { upsert: true }
)
```

### MongoDB Update Operators

```
┌──────────────────────────────────────────────────────────────────────┐
│                    MongoDB Update Operators                          │
├──────────────┬───────────────────────────────────────────────────────┤
│  $set        │  Set field value  { $set: { name: "New" } }          │
│  $unset      │  Remove a field   { $unset: { oldField: "" } }       │
│  $inc        │  Increment        { $inc: { count: 1 } }             │
│  $mul        │  Multiply         { $mul: { price: 1.1 } }           │
│  $rename     │  Rename field     { $rename: { old: "new" } }        │
│  $push       │  Add to array     { $push: { tags: "new" } }         │
│  $pull       │  Remove from array{ $pull: { tags: "old" } }         │
│  $addToSet   │  Add if unique    { $addToSet: { tags: "x" } }       │
│  $pop        │  Remove last elem { $pop: { items: 1 } }             │
│  $min / $max │  Update if lower/higher                              │
└──────────────┴───────────────────────────────────────────────────────┘
```

---

### DELETE

```sql
-- MySQL: DELETE

-- Delete specific record
DELETE FROM products 
WHERE id = 5;

-- Delete with condition
DELETE FROM products 
WHERE stock_qty = 0;

-- Delete all records (keep table)
DELETE FROM products;
-- OR (faster, resets auto-increment)
TRUNCATE TABLE products;

-- Drop entire table
DROP TABLE products;
```

```javascript
// MongoDB: deleteOne / deleteMany

// Delete one document
db.products.deleteOne({ _id: ObjectId("64a1...") })

// Delete with condition
db.products.deleteOne({ name: "Old Product" })

// Delete many documents
db.products.deleteMany({ stockQty: 0 })

// Delete ALL documents (keep collection)
db.products.deleteMany({})

// Drop entire collection
db.products.drop()

// Drop entire database
db.dropDatabase()
```

---

## 6. Data Types

### 🏷️ The "What type of data can we store?" Guide

```
┌────────────────────────────────────────────────────────────────────────┐
│                     DATA TYPE COMPARISON                               │
├─────────────────────────┬──────────────────────────────────────────────┤
│    MySQL Type           │         MongoDB Type                        │
├─────────────────────────┼──────────────────────────────────────────────┤
│  INT, BIGINT, TINYINT   │  NumberInt, NumberLong, Int32/Int64          │
│  FLOAT, DOUBLE          │  Double (64-bit float)                      │
│  DECIMAL(10,2)          │  Decimal128 (high precision)                │
│  VARCHAR(n)             │  String (UTF-8, unlimited)                  │
│  TEXT, LONGTEXT         │  String                                     │
│  BOOLEAN/TINYINT(1)     │  Boolean (true/false)                       │
│  DATE                   │  Date / ISODate                             │
│  DATETIME, TIMESTAMP    │  Date (ISODate, UTC)                        │
│  JSON (MySQL 5.7+)      │  Object / Embedded Document                 │
│  BLOB, LONGBLOB         │  BinData (binary data)                      │
│  ENUM('a','b','c')      │  String (validated in app/schema)           │
│  AUTO_INCREMENT INT     │  ObjectId (auto-generated _id)              │
│  NULL                   │  null                                       │
│  -                      │  Array  [ ]  ← Native array type!           │
│  -                      │  ObjectId (12-byte unique identifier)       │
│  -                      │  Regular Expression                         │
└─────────────────────────┴──────────────────────────────────────────────┘
```

### The ObjectId — MongoDB's Auto-Generated Primary Key

```javascript
// Every document gets an _id automatically if you don't provide one
// ObjectId("64a1f2b3c4d5e6f7a8b9c0d1")
//          └──────────────────────────┘
//                12 bytes total
//
//  Bytes 0-3:  Unix timestamp (seconds since epoch)
//  Bytes 4-8:  Random value (unique per machine+process)
//  Bytes 9-11: Random incrementing counter
//
//  This means ObjectIds are:
//  ✅ Globally unique (without a central coordinator!)
//  ✅ Sortable by creation time
//  ✅ Safe to generate in your app without a DB roundtrip

const id = new ObjectId()
console.log(id.getTimestamp())  // Returns creation date!

// You can also use your own _id:
db.users.insertOne({ _id: "alice@example.com", name: "Alice" })
```

### MySQL: Common Constraints

```sql
-- Constraints enforce data integrity at the database level
CREATE TABLE users (
    id          INT AUTO_INCREMENT PRIMARY KEY,  -- Unique, not null, auto-inc
    email       VARCHAR(255) UNIQUE NOT NULL,     -- Must be unique, can't be null
    age         INT CHECK (age >= 18),            -- Must satisfy condition
    role        ENUM('admin','user','guest')      -- Must be one of these values
                DEFAULT 'user',
    created_at  TIMESTAMP DEFAULT NOW()          -- Default value
);
```

---

## 7. Relationships & Joins

### 🧩 The "How data connects to other data" Section

**DBMS Concept: Relationships**

Three types of relationships exist between entities:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RELATIONSHIP TYPES                           │
│                                                                 │
│  ONE-TO-ONE (1:1)                                               │
│  Each user has exactly one passport                             │
│  users ──────── passports                                       │
│  (1 user : 1 passport)                                          │
│                                                                 │
│  ONE-TO-MANY (1:N)                                              │
│  One customer can have many orders                              │
│  users ──────<< orders                                          │
│  (1 user : many orders)                                         │
│                                                                 │
│  MANY-TO-MANY (M:N)                                             │
│  Students enroll in many courses, courses have many students    │
│  students >>──────<< courses                                    │
│  (needs a bridge/junction table in SQL)                         │
└─────────────────────────────────────────────────────────────────┘
```

### MySQL JOINs — The "Connect the Dots" Operations

```
                     Types of SQL JOINs Visualized
┌───────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  INNER JOIN          LEFT JOIN          RIGHT JOIN       FULL JOIN    │
│                                                                       │
│   A  ∩  B            A  +  (A∩B)       B  +  (A∩B)     A  ∪  B     │
│                                                                       │
│   ○ ●●● ○            ●●●●● ○           ○ ●●●●●          ●●●●●●●●●  │
│   ╔═══╗              ╔═══╗             ╔═══╗             ╔════════╗  │
│   ║A∩B║              ║ A ║             ║ B ║             ║  A∪B   ║  │
│   ╚═══╝              ╚═══╝             ╚═══╝             ╚════════╝  │
│                                                                       │
│  Only matching      All of A +        All of B +       Everything    │
│  rows in both       matches           matches          from both      │
└───────────────────────────────────────────────────────────────────────┘
```

#### Real-World JOIN Examples: E-Commerce

```sql
-- Scenario: Get all orders with user names and product details

-- INNER JOIN: Only orders that have a valid user
SELECT 
    u.first_name,
    u.last_name,
    o.id AS order_id,
    o.status,
    o.total,
    o.created_at
FROM orders o
INNER JOIN users u ON o.user_id = u.id
WHERE o.status = 'delivered'
ORDER BY o.created_at DESC;

-- Output:
-- first_name | last_name | order_id | status    | total
-- Alice      | Smith     | 1001     | delivered | 2578.00
-- Bob        | Jones     | 1002     | delivered |  499.99
```

```sql
-- LEFT JOIN: All users, even those with NO orders
SELECT 
    u.email,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email
ORDER BY total_spent DESC;

-- Output includes users with 0 orders:
-- email           | order_count | total_spent
-- alice@x.com     | 5           | 4250.00
-- newuser@x.com   | 0           | 0.00     ← LEFT JOIN includes this
```

```sql
-- Multi-table JOIN: Full order detail (users + orders + items + products)
SELECT 
    u.first_name,
    p.name        AS product_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS line_total
FROM order_items oi
INNER JOIN orders   o ON oi.order_id   = o.id
INNER JOIN users    u ON o.user_id     = u.id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.id = 1001;
```

#### MongoDB: Querying Related Data

MongoDB has two approaches to related data:

**Approach 1: Embedded (Denormalized)** — Data lives inside the parent document.

```javascript
// If orders are embedded inside users:
// db.users.findOne({ email: "alice@example.com" })
// Returns: { name: "Alice", orders: [ {...}, {...} ] }

// Find users who bought a specific product
db.users.find({
  "orders.productName": "MacBook Pro"
})

// Find users who spent more than $1000 total
db.users.find({
  "orders.unitPrice": { $gt: 1000 }
})
```

**Approach 2: $lookup (JOIN equivalent)** — Join two collections in an aggregation pipeline.

```javascript
// "JOIN" orders to users using $lookup
db.orders.aggregate([
  {
    $lookup: {
      from: "users",           // collection to join
      localField: "userId",    // field in orders
      foreignField: "_id",     // field in users
      as: "userDetails"        // output array field name
    }
  },
  {
    $unwind: "$userDetails"    // flatten the array to a single object
  },
  {
    $project: {
      "userDetails.email": 1,
      "userDetails.firstName": 1,
      status: 1,
      total: 1
    }
  }
])

// Equivalent to:
// SELECT u.email, u.first_name, o.status, o.total
// FROM orders o INNER JOIN users u ON o.user_id = u.id
```

> **Performance Tip:** MongoDB `$lookup` is powerful but slower than embedded documents. Design your schema so that the most common queries don't need lookups. Use `$lookup` for less-frequent reporting queries.

---

## 8. Normalization

### 📐 The "No Redundancy" Principle (Critical DBMS Concept)

**What is Normalization?**

Normalization is the process of organizing database tables to **reduce redundancy** and **improve data integrity**. Think of it as "Don't Repeat Yourself" (DRY) for databases.

**The Problem Without Normalization:**

```
┌──────────────────────────────────────────────────────────────────────┐
│               UNNORMALIZED: order_details table                      │
├───────┬──────────┬────────────┬───────────────┬──────────┬─────────┤
│ order │  cust_   │  cust_city │   product_    │  prod_   │  qty   │
│  _id  │  name    │            │   name        │  price   │        │
├───────┼──────────┼────────────┼───────────────┼──────────┼─────────┤
│  1    │  Alice   │  New York  │  MacBook Pro  │ 2499.00  │  1     │
│  1    │  Alice   │  New York  │  Magic Mouse  │   79.00  │  1     │  ← Alice repeated!
│  2    │  Bob     │  Chicago   │  iPad         │  799.00  │  2     │
│  2    │  Bob     │  Chicago   │  Apple Pencil │  129.00  │  1     │  ← Bob repeated!
└───────┴──────────┴────────────┴───────────────┴──────────┴─────────┘

PROBLEMS:
❌ Update anomaly:  If Alice moves to "Los Angeles", must update every row for her
❌ Insert anomaly:  Can't add a product until someone orders it
❌ Delete anomaly:  Deleting order 2 deletes all info about Bob!
❌ Storage waste:   Same data repeated many times
```

### Normal Forms

```
┌─────────────────────────────────────────────────────────────────────┐
│                 NORMALIZATION JOURNEY                               │
│                                                                     │
│  0NF (Raw table)                                                    │
│       │                                                             │
│       ▼                                                             │
│  1NF: Each cell has ONE atomic value. No repeating groups.          │
│       (Remove arrays/sets from columns)                             │
│       │                                                             │
│       ▼                                                             │
│  2NF: Must be 1NF + Every non-key column depends on the WHOLE       │
│       primary key (eliminate partial dependencies)                  │
│       │                                                             │
│       ▼                                                             │
│  3NF: Must be 2NF + No transitive dependencies                      │
│       (non-key columns don't depend on other non-key columns)       │
│       │                                                             │
│       ▼                                                             │
│  BCNF: Stronger version of 3NF (rarely needed in practice)          │
│       │                                                             │
│       ▼                                                             │
│  4NF, 5NF: Handle very specific multi-valued dependency cases       │
│            (usually overkill in practice)                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Normalization Example

#### Starting Point: Unnormalized Order Data

```
order_id | customer_name | customer_email | products (as text)
---------|---------------|----------------|------------------------
1        | Alice         | a@x.com        | "MacBook,Mouse"
2        | Bob           | b@x.com        | "iPad,Pencil,Keyboard"
```

**First Normal Form (1NF)** — Each cell = one value, no repeating groups:

```sql
-- 1NF: Split multi-valued cells into rows
-- order_id | customer_name | customer_email | product
-- ---------|---------------|----------------|--------
-- 1        | Alice         | a@x.com        | MacBook
-- 1        | Alice         | a@x.com        | Mouse       ← Alice duplicated
-- 2        | Bob           | b@x.com        | iPad
-- 2        | Bob           | b@x.com        | Pencil      ← Bob duplicated
-- 2        | Bob           | b@x.com        | Keyboard    ← Bob duplicated
```

**Second Normal Form (2NF)** — Remove partial dependencies (each column depends on the *whole* key):

```sql
-- Composite key is (order_id, product)
-- customer_name depends only on order_id (partial dependency!)
-- Move customer info to its own table:

-- orders table:
-- order_id | customer_id
-- ---------|------------
-- 1        | 101
-- 2        | 102

-- customers table:
-- customer_id | customer_name | customer_email
-- ------------|---------------|---------------
-- 101         | Alice         | a@x.com
-- 102         | Bob           | b@x.com

-- order_items table:
-- order_id | product
-- ---------|--------
-- 1        | MacBook
-- 1        | Mouse
-- 2        | iPad
```

**Third Normal Form (3NF)** — Remove transitive dependencies:

```sql
-- If we also had: product → category → category_tax_rate
-- That's a transitive dependency (category_tax_rate depends on category, not order)
-- Solution: Create a categories table

-- ✅ FULLY NORMALIZED (3NF):

CREATE TABLE customers (
    id    INT PRIMARY KEY,
    name  VARCHAR(100),
    email VARCHAR(255) UNIQUE
);

CREATE TABLE categories (
    id         INT PRIMARY KEY,
    name       VARCHAR(100),
    tax_rate   DECIMAL(5,4)       -- stored here, not in products!
);

CREATE TABLE products (
    id          INT PRIMARY KEY,
    name        VARCHAR(255),
    price       DECIMAL(10,2),
    category_id INT REFERENCES categories(id)
);

CREATE TABLE orders (
    id          INT PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    created_at  TIMESTAMP
);

CREATE TABLE order_items (
    order_id    INT REFERENCES orders(id),
    product_id  INT REFERENCES products(id),
    quantity    INT,
    PRIMARY KEY (order_id, product_id)
);
```

### Normalization vs Denormalization

```
┌──────────────────────────────────────────────────────────────────────┐
│                  WHEN TO NORMALIZE vs DENORMALIZE                    │
├─────────────────────────────────┬────────────────────────────────────┤
│      Normalize when...          │      Denormalize when...           │
├─────────────────────────────────┼────────────────────────────────────┤
│  Data is updated frequently     │  Read speed is critical            │
│  (CUD-heavy workload)           │  (READ-heavy workload)             │
│                                 │                                    │
│  Storage space matters          │  Complex JOINs are too slow        │
│                                 │                                    │
│  Data consistency is critical   │  Caching computed results          │
│  (financial, medical)           │  (e.g., pre-computed totals)       │
│                                 │                                    │
│  Avoiding update anomalies      │  Analytics / reporting / OLAP      │
│                                 │                                    │
│  MySQL by default               │  MongoDB by default                │
│                                 │  Data warehouses (Redshift, etc.)  │
└─────────────────────────────────┴────────────────────────────────────┘
```

---

## 9. Indexes

### 📚 The "Book Index" That Makes Queries Lightning Fast

**What is an Index?**

Without an index, finding a record requires scanning every single row — like reading an entire book to find one word. An index is like the **index at the back of a book** — it points directly to what you need.

```
WITHOUT INDEX (Full Table Scan):
┌──────────────────────────────────────────────────────┐
│ Looking for email = "alice@example.com"              │
│                                                      │
│ Row 1:  check bob@x.com     ✗                        │
│ Row 2:  check carol@x.com   ✗                        │
│ Row 3:  check alice@x.com   ✓ FOUND!                 │
│ Row 4:  check dave@x.com    ✗  (still checks these!) │
│ Row 5:  check eve@x.com     ✗                        │
│ ...continues for 1,000,000 rows...                   │
│                                                      │
│ Time complexity: O(n) — gets SLOWER as data grows   │
└──────────────────────────────────────────────────────┘

WITH INDEX (B-Tree Index Lookup):
┌──────────────────────────────────────────────────────┐
│ Looking for email = "alice@example.com"              │
│                                                      │
│ B-Tree:  a... → al... → ali... → alice@  ✓ FOUND!   │
│          (only 3-4 comparisons for 1M rows!)         │
│                                                      │
│ Time complexity: O(log n) — stays fast!             │
└──────────────────────────────────────────────────────┘
```

### Types of Indexes

```
┌──────────────────────────────────────────────────────────────────────┐
│                    INDEX TYPES                                       │
├──────────────────────┬───────────────────────────────────────────────┤
│  Type                │  Description & Use Case                      │
├──────────────────────┼───────────────────────────────────────────────┤
│  PRIMARY KEY index   │  Auto-created on PK. Fastest lookup.         │
│                      │  Each table has exactly one.                 │
├──────────────────────┼───────────────────────────────────────────────┤
│  UNIQUE index        │  Like primary, but allows NULL.              │
│                      │  Enforces uniqueness (e.g., email).          │
├──────────────────────┼───────────────────────────────────────────────┤
│  Regular (B-Tree)    │  General-purpose. Good for =, <, >, BETWEEN. │
│                      │  Most common index type.                     │
├──────────────────────┼───────────────────────────────────────────────┤
│  Composite           │  Index on multiple columns.                  │
│                      │  ORDER MATTERS! (first col most selective)   │
├──────────────────────┼───────────────────────────────────────────────┤
│  Full-Text           │  For searching text content (LIKE is slow).  │
│                      │  Tokenizes words for fast text search.       │
├──────────────────────┼───────────────────────────────────────────────┤
│  Hash               │  O(1) equality lookups only. No range scans.  │
│ (MySQL MEMORY engine)│  Very fast for exact matches.                │
├──────────────────────┼───────────────────────────────────────────────┤
│  Partial (MongoDB)   │  Index only a subset of documents.           │
│                      │  Smaller, faster when not all docs need it.  │
└──────────────────────┴───────────────────────────────────────────────┘
```

### MySQL Index Operations

```sql
-- Check if a query uses an index with EXPLAIN
EXPLAIN SELECT * FROM users WHERE email = 'alice@x.com';
-- If type = "ref" or "const" → using index ✅
-- If type = "ALL" → full table scan, needs index! ❌

-- Create a simple index
CREATE INDEX idx_email ON users(email);

-- Create a unique index
CREATE UNIQUE INDEX idx_unique_email ON users(email);

-- Create a composite index (order matters!)
-- Use for queries like: WHERE status = 'active' AND created_at > '2024-01-01'
CREATE INDEX idx_status_created 
ON orders(status, created_at);

-- Create a full-text index
CREATE FULLTEXT INDEX idx_product_name 
ON products(name, description);

-- Full-text search query
SELECT * FROM products 
WHERE MATCH(name, description) 
AGAINST('wireless headphones' IN NATURAL LANGUAGE MODE);

-- Show all indexes on a table
SHOW INDEX FROM orders;

-- Drop an index
DROP INDEX idx_email ON users;

-- ⚠️ Composite Index "Left-Prefix Rule":
-- Index on (last_name, first_name, age) helps:
--   WHERE last_name = 'Smith'                    ✅
--   WHERE last_name = 'Smith' AND first_name = 'Alice'  ✅
--   WHERE last_name = 'Smith' AND age > 30       ✅ (partial)
-- Does NOT help:
--   WHERE first_name = 'Alice'                   ❌ (skipped first column)
--   WHERE age > 30                               ❌ (skipped first two columns)
```

### MongoDB Index Operations

```javascript
// Explain a query (like MySQL's EXPLAIN)
db.users.find({ email: "alice@x.com" }).explain("executionStats")
// Look for: "stage": "IXSCAN" (index) vs "COLLSCAN" (full scan)

// Create a single field index
db.users.createIndex({ email: 1 })     // 1=ascending, -1=descending

// Create a unique index
db.users.createIndex({ email: 1 }, { unique: true })

// Create a compound index (like composite in MySQL)
db.orders.createIndex({ status: 1, createdAt: -1 })

// Create a text index (like full-text in MySQL)
db.products.createIndex({ name: "text", description: "text" })

// Full-text search
db.products.find({ $text: { $search: "wireless headphones" } })

// Partial index (only index active users — saves space and memory!)
db.users.createIndex(
  { email: 1 },
  { partialFilterExpression: { isActive: true } }
)

// TTL Index (auto-delete documents after X seconds — great for sessions!)
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // Delete after 1 hour
)

// Wildcard index (index all fields in a subdocument)
db.products.createIndex({ "specs.$**": 1 })

// List all indexes
db.users.getIndexes()

// Drop an index
db.users.dropIndex("email_1")
```

### The Index Trade-off

```
┌──────────────────────────────────────────────────────────────────────┐
│                    THE INDEX COST/BENEFIT                            │
│                                                                      │
│  BENEFITS of Indexes:                                                │
│  ✅ Dramatically faster SELECT/query performance                     │
│  ✅ Faster ORDER BY (already sorted in index)                        │
│  ✅ Unique indexes enforce data integrity                            │
│                                                                      │
│  COSTS of Indexes:                                                   │
│  ❌ Slower INSERT / UPDATE / DELETE (index must be updated too)      │
│  ❌ Uses additional disk space                                       │
│  ❌ Too many indexes = poor write performance                        │
│                                                                      │
│  RULE OF THUMB:                                                      │
│  • Index columns used in WHERE, JOIN ON, ORDER BY, GROUP BY         │
│  • Index high-cardinality columns (many unique values like email)   │
│  • DON'T index low-cardinality columns (e.g., gender: M/F)          │
│  • For write-heavy tables, keep indexes minimal                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 10. Transactions & ACID Properties

### 💸 The "Bank Transfer" Problem

Imagine transferring $500 from Alice's account to Bob's account:

```
Step 1: Debit Alice  (-$500)
Step 2: Credit Bob   (+$500)
```

What if the system crashes **between** Step 1 and Step 2? Alice loses $500 but Bob never receives it. Money vanishes. This is catastrophic.

**Transactions** solve this by grouping operations so they **all succeed or all fail together**.

### ACID Properties — The Four Pillars of Reliable Transactions

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ACID PROPERTIES                             │
│                                                                     │
│  A — ATOMICITY                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "All or Nothing"                                           │    │
│  │ Either ALL operations in a transaction succeed,            │    │
│  │ or NONE of them do. No partial results.                    │    │
│  │                                                            │    │
│  │ 💰 Transfer $500: BOTH debit AND credit happen, or         │    │
│  │    NEITHER happens. Never just one.                        │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  C — CONSISTENCY                                                    │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "Rules are always maintained"                              │    │
│  │ The database starts valid, ends valid.                     │    │
│  │ Constraints, foreign keys, data rules always enforced.     │    │
│  │                                                            │    │
│  │ 💰 Account balance can never go below $0 (constraint).    │    │
│  │    Transaction either completes validly or rolls back.     │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  I — ISOLATION                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "Transactions don't see each other's dirty work"           │    │
│  │ Concurrent transactions appear to run sequentially.        │    │
│  │ One transaction's intermediate state is invisible to others│    │
│  │                                                            │    │
│  │ 💰 While Alice's transfer is processing, Bob can't see     │    │
│  │    a weird intermediate state of the database.            │    │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  D — DURABILITY                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ "Committed = permanent"                                    │    │
│  │ Once committed, data survives crashes, power failures.     │    │
│  │ Written to disk (WAL/redo log) before confirming success.  │    │
│  │                                                            │    │
│  │ 💰 Once the bank says "Transfer complete", that data       │    │
│  │    won't disappear even if servers crash immediately.      │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### MySQL Transactions

```sql
-- MySQL is ACID-compliant (with InnoDB engine)

-- Basic transaction structure
START TRANSACTION;
    -- Operation 1
    UPDATE accounts 
    SET balance = balance - 500 
    WHERE user_id = 1;   -- Alice
    
    -- Operation 2
    UPDATE accounts 
    SET balance = balance + 500 
    WHERE user_id = 2;   -- Bob
    
    -- If both succeeded, make permanent
COMMIT;

-- If something went wrong, undo everything
ROLLBACK;
```

```sql
-- Real-world transaction with error handling
START TRANSACTION;

-- Check if Alice has enough funds
SELECT balance INTO @alice_balance 
FROM accounts WHERE user_id = 1 FOR UPDATE;  -- Lock the row!

IF @alice_balance >= 500 THEN
    UPDATE accounts SET balance = balance - 500 WHERE user_id = 1;
    UPDATE accounts SET balance = balance + 500 WHERE user_id = 2;
    COMMIT;
    SELECT 'Transfer successful' AS result;
ELSE
    ROLLBACK;
    SELECT 'Insufficient funds' AS result;
END IF;
```

```sql
-- SAVEPOINTS: Partial rollback within a transaction
START TRANSACTION;

    INSERT INTO orders (user_id, total) VALUES (1, 100);
    SAVEPOINT after_order;         -- Mark a save point
    
    INSERT INTO order_items (order_id, product_id) VALUES (LAST_INSERT_ID(), 5);
    
    -- Oops, something went wrong with items but not the order
    ROLLBACK TO SAVEPOINT after_order;  -- Only undo after savepoint
    
COMMIT;  -- Order is saved, items were rolled back
```

### Isolation Levels — How Much Can Transactions See?

```
┌────────────────────────────────────────────────────────────────────────┐
│            TRANSACTION ISOLATION LEVELS (MySQL/PostgreSQL)             │
│                                                                        │
│  Problem types:                                                        │
│  • Dirty Read:    Reading uncommitted data from another transaction    │
│  • Non-repeatable Read: Re-reading a row gets different result         │
│  • Phantom Read:  Re-running a query returns different rows            │
│                                                                        │
├──────────────────────┬──────────────┬─────────────────┬───────────────┤
│    Isolation Level   │  Dirty Read  │ Non-Repeatable  │  Phantom Read │
├──────────────────────┼──────────────┼─────────────────┼───────────────┤
│  READ UNCOMMITTED    │   Possible   │    Possible     │   Possible    │
│  (Lowest isolation)  │              │                 │               │
├──────────────────────┼──────────────┼─────────────────┼───────────────┤
│  READ COMMITTED      │   Prevented  │    Possible     │   Possible    │
│  (Default: Postgres) │              │                 │               │
├──────────────────────┼──────────────┼─────────────────┼───────────────┤
│  REPEATABLE READ     │   Prevented  │    Prevented    │   Possible    │
│  (Default: MySQL)    │              │                 │               │
├──────────────────────┼──────────────┼─────────────────┼───────────────┤
│  SERIALIZABLE        │   Prevented  │    Prevented    │   Prevented   │
│  (Highest isolation) │              │                 │               │
└──────────────────────┴──────────────┴─────────────────┴───────────────┘

Higher isolation = more protection but LESS concurrency (slower)
```

```sql
-- Set isolation level in MySQL
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
START TRANSACTION;
-- ... your queries
COMMIT;
```

### MongoDB Transactions

MongoDB added multi-document ACID transactions in version 4.0 (2018).

```javascript
// MongoDB requires a session for transactions
const session = db.getMongo().startSession()

session.startTransaction({
  readConcern:  { level: "snapshot" },
  writeConcern: { w: "majority" }
})

try {
  const accountsColl = session.getDatabase("bank").accounts
  
  // Debit Alice
  accountsColl.updateOne(
    { userId: "alice" },
    { $inc: { balance: -500 } },
    { session }
  )
  
  // Credit Bob
  accountsColl.updateOne(
    { userId: "bob" },
    { $inc: { balance: 500 } },
    { session }
  )
  
  // All good — commit!
  session.commitTransaction()
  console.log("Transfer successful")
  
} catch (error) {
  // Something failed — undo everything
  session.abortTransaction()
  console.log("Transfer failed:", error.message)
  
} finally {
  session.endSession()
}
```

> **Important:** MongoDB was designed around single-document atomicity (a single document write is always atomic). Multi-document transactions carry overhead and should be used only when truly needed. A well-designed MongoDB schema often avoids the need for multi-document transactions by embedding related data.

---

## 11. Aggregation & Analytics

### 📊 Scenario: E-Commerce Sales Dashboard

#### MySQL: GROUP BY, Aggregation Functions, HAVING

```sql
-- Total sales by category
SELECT 
    p.category,
    COUNT(DISTINCT o.id)    AS order_count,
    SUM(oi.quantity)        AS total_units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    AVG(oi.unit_price)      AS avg_unit_price
FROM order_items oi
JOIN orders   o ON oi.order_id   = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'delivered'
GROUP BY p.category
HAVING total_revenue > 10000  -- Filter AFTER grouping (not WHERE)
ORDER BY total_revenue DESC;

-- Result:
-- category     | order_count | total_units | total_revenue | avg_price
-- Electronics  | 450         | 512         | 185000.00     | 361.33
-- Accessories  | 980         | 2100        |  45000.00     |  21.43
```

```sql
-- Monthly sales trend
SELECT 
    YEAR(o.created_at)  AS year,
    MONTH(o.created_at) AS month,
    COUNT(*)            AS orders,
    SUM(o.total)        AS revenue
FROM orders o
WHERE o.status = 'delivered'
  AND o.created_at >= '2024-01-01'
GROUP BY YEAR(o.created_at), MONTH(o.created_at)
ORDER BY year, month;

-- Top 5 customers by spending
SELECT 
    u.first_name,
    u.last_name,
    COUNT(o.id)   AS total_orders,
    SUM(o.total)  AS lifetime_value
FROM users u
JOIN orders o ON u.id = o.user_id
GROUP BY u.id
ORDER BY lifetime_value DESC
LIMIT 5;
```

#### MySQL: Window Functions (Advanced)

```sql
-- Rank products by revenue within each category
SELECT 
    p.category,
    p.name,
    SUM(oi.quantity * oi.unit_price) AS revenue,
    RANK() OVER (
        PARTITION BY p.category 
        ORDER BY SUM(oi.quantity * oi.unit_price) DESC
    ) AS rank_in_category
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.id, p.category, p.name;

-- Running total of daily revenue
SELECT 
    DATE(created_at)   AS day,
    SUM(total)         AS daily_revenue,
    SUM(SUM(total)) OVER (ORDER BY DATE(created_at)) AS running_total
FROM orders
WHERE status = 'delivered'
GROUP BY DATE(created_at);
```

#### MongoDB: Aggregation Pipeline

MongoDB's aggregation pipeline is a **series of stages** that transform documents step by step. Think of it like an assembly line.

```
MongoDB Aggregation Pipeline Flow:

Collection
    │
    ▼
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ $match  │───▶│ $group   │───▶│ $sort    │───▶│ $project │───▶ Results
│ (WHERE) │    │(GROUP BY)│    │(ORDER BY)│    │ (SELECT) │
└─────────┘    └──────────┘    └──────────┘    └──────────┘
     ▲               ▲               ▲               ▲
     │               │               │               │
  Filter         Calculate        Sort the        Choose
  documents      groupings        results          fields
```

```javascript
// Total sales by category (equivalent to the MySQL query above)
db.orders.aggregate([
  // Stage 1: Only look at delivered orders
  { $match: { status: "delivered" } },
  
  // Stage 2: Expand items array into individual documents
  { $unwind: "$items" },
  
  // Stage 3: Join with products to get category
  { $lookup: {
    from: "products",
    localField: "items.productId",
    foreignField: "_id",
    as: "product"
  }},
  { $unwind: "$product" },
  
  // Stage 4: Group by category and calculate totals
  { $group: {
    _id: "$product.category",
    orderCount:  { $addToSet: "$_id" },    // unique orders
    totalUnits:  { $sum: "$items.quantity" },
    totalRevenue:{ $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] } },
    avgPrice:    { $avg: "$items.unitPrice" }
  }},
  
  // Stage 5: Calculate order count from set
  { $addFields: { orderCount: { $size: "$orderCount" } } },
  
  // Stage 6: Filter categories with >$10k revenue
  { $match: { totalRevenue: { $gt: 10000 } } },
  
  // Stage 7: Sort by revenue descending
  { $sort: { totalRevenue: -1 } },
  
  // Stage 8: Shape the output
  { $project: {
    category: "$_id",
    orderCount: 1,
    totalUnits: 1,
    totalRevenue: { $round: ["$totalRevenue", 2] },
    avgPrice: { $round: ["$avgPrice", 2] },
    _id: 0
  }}
])
```

```javascript
// MongoDB Aggregation Operators Reference
// ─────────────────────────────────────────────────────────────
// $match    →  WHERE / HAVING (filter documents)
// $group    →  GROUP BY (with $sum, $avg, $min, $max, $count)
// $sort     →  ORDER BY
// $limit    →  LIMIT
// $skip     →  OFFSET
// $project  →  SELECT (choose/rename/compute fields)
// $unwind   →  Expand array into multiple documents
// $lookup   →  JOIN another collection
// $addFields→  Add computed fields
// $bucket   →  Group into ranges (like: 0-100, 100-500, etc.)
// $facet    →  Run multiple pipelines in parallel
// $out      →  Write results to a new collection
// $count    →  Count documents

// Quick analytics: Average order value by month
db.orders.aggregate([
  { $match: { status: "delivered" } },
  { $group: {
    _id: {
      year:  { $year: "$createdAt" },
      month: { $month: "$createdAt" }
    },
    avgOrderValue: { $avg: "$total" },
    orderCount: { $sum: 1 }
  }},
  { $sort: { "_id.year": 1, "_id.month": 1 } }
])
```

---

## 12. CAP Theorem

### 🔺 The Impossible Triangle of Distributed Systems

**DBMS Concept: CAP Theorem** — formulated by Eric Brewer in 2000 and proved by Gilbert & Lynch in 2002.

In a **distributed database** (data spread across multiple servers/nodes), you can only **guarantee 2 out of 3** of these properties simultaneously:

```
                        ┌──────────────────┐
                        │   CONSISTENCY    │
                        │                  │
                        │  Every read gets │
                        │  the most recent │
                        │  write (or error)│
                        └────────┬─────────┘
                                 │
                                / \
                               /   \
                              /     \
                             /       \
                            /  ↑Pick ↑\
                           /    2 of 3 \
                          ─────────────────
                         /               \
                        /                 \
              ┌────────┴──────┐   ┌───────┴────────┐
              │  AVAILABILITY  │   │   PARTITION     │
              │                │   │   TOLERANCE     │
              │ Every request  │   │                 │
              │ gets a response│   │ System works    │
              │ (not error)    │   │ despite network │
              │                │   │ splits between  │
              │                │   │ nodes           │
              └────────────────┘   └─────────────────┘

  CA System: Consistent + Available     (no partition tolerance)
             → Traditional SQL on single server (MySQL, PostgreSQL)
             
  CP System: Consistent + Partition Tolerant  (may be unavailable)
             → MongoDB (strong consistency mode), HBase, Zookeeper
             
  AP System: Available + Partition Tolerant   (may be inconsistent)
             → MongoDB (eventual consistency), Cassandra, DynamoDB
             → DNS system, Shopping cart (Amazon)
```

### Why Partition Tolerance is Usually Required

In a real distributed system, **network partitions WILL happen** — cables get cut, servers go down, packets get lost. So in practice, you must choose **P**, and then decide between **C** and **A**.

This makes the real choice: **CP vs AP**

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CP vs AP: A Real Scenario                       │
│                                                                     │
│  Your database has 3 nodes: Node A (US-East), Node B (EU), Node C  │
│  A network cut isolates Node B from Nodes A & C.                   │
│                                                                     │
│  A write comes into Node A: "Alice's balance = $1000"              │
│  Node A can't reach Node B to sync this change.                    │
│                                                                     │
│  CP System (Consistency Priority):                                  │
│  → Refuses reads/writes until network heals                        │
│  → Node B returns error to users: "Service unavailable"            │
│  → When network heals, everyone has the same data                  │
│  → ✅ No stale data  ❌ Service unavailable during partition        │
│  → Good for: Banking, medical records, inventory systems           │
│                                                                     │
│  AP System (Availability Priority):                                 │
│  → Node B continues serving requests with potentially stale data   │
│  → Returns Alice's old balance until the network heals             │
│  → When network heals, resolves conflicts (last-write-wins, etc.)  │
│  → ✅ Always responds  ❌ May return stale data during partition    │
│  → Good for: Social media likes, DNS, shopping carts, metrics      │
└─────────────────────────────────────────────────────────────────────┘
```

### MySQL and MongoDB in CAP Context

```
MySQL:
• Single server: Not subject to CAP (no partition)
• With replication: By default, CP-like behavior (primary handles writes)
• MySQL Cluster / Group Replication: Can be tuned for CP
• Best for: Strong consistency requirements

MongoDB:
• Default (Primary-Secondary replica set): CP
  - Writes go to primary only
  - If primary fails, election happens, service may be briefly unavailable
• With "w:0" write concern / "readPreference: nearest": Moves toward AP
• You can TUNE MongoDB's consistency guarantees!
  - writeConcern: { w: "majority" } = CP (confirm majority of nodes)
  - writeConcern: { w: 1 } = faster but less consistent
  - readConcern: "linearizable" = strongest consistency
  - readConcern: "eventual" = better performance, possible stale reads
```

### BASE vs ACID

```
┌────────────────────────────────────────────────────────────────────┐
│                      ACID vs BASE                                  │
├─────────────────────────────┬──────────────────────────────────────┤
│          ACID               │            BASE                      │
│  (Relational DBs emphasis)  │  (NoSQL/distributed emphasis)        │
├─────────────────────────────┼──────────────────────────────────────┤
│  Atomic                     │  Basically Available                 │
│  Consistent                 │  Soft state                          │
│  Isolated                   │  Eventually consistent               │
│  Durable                    │                                      │
│                             │                                      │
│  → Strong guarantees        │  → Trades some consistency for       │
│  → Lower throughput at      │    availability and performance      │
│    massive scale            │  → "Eventually" all nodes agree      │
│                             │                                      │
│  "All or nothing"           │  "Best effort, will sync later"      │
│                             │                                      │
│  Bank transfer              │  Facebook like count                 │
│  (Must be exact)            │  (Approximate is fine)              │
└─────────────────────────────┴──────────────────────────────────────┘
```

---

## 13. Security & Users

### 🔐 Real-World Scenario: Multi-Tenant Application

**Principle of Least Privilege:** Grant users only the minimum permissions they need to do their job.

#### MySQL: Users & Privileges

```sql
-- Create users with different privilege levels

-- Read-only analyst (can only query, not modify)
CREATE USER 'analyst'@'%' IDENTIFIED BY 'SecurePass123!';
GRANT SELECT ON ecommerce.* TO 'analyst'@'%';

-- Application user (CRUD but no admin)
CREATE USER 'app_user'@'%' IDENTIFIED BY 'AppPass456!';
GRANT SELECT, INSERT, UPDATE, DELETE 
  ON ecommerce.* 
  TO 'app_user'@'%';

-- Admin (full access to one database)
CREATE USER 'db_admin'@'localhost' IDENTIFIED BY 'AdminPass789!';
GRANT ALL PRIVILEGES ON ecommerce.* TO 'db_admin'@'localhost';

-- Never do this in production:
-- GRANT ALL PRIVILEGES ON *.* TO 'user'@'%';  ← Access to ALL databases from anywhere!

-- Apply privilege changes
FLUSH PRIVILEGES;

-- See what a user can do
SHOW GRANTS FOR 'analyst'@'%';

-- Revoke a privilege
REVOKE DELETE ON ecommerce.* FROM 'app_user'@'%';

-- Remove a user
DROP USER 'old_user'@'%';

-- Row-Level Security with VIEWs
-- Create a view that only shows a user's own data
CREATE VIEW my_orders AS
SELECT * FROM orders 
WHERE user_id = CURRENT_USER_ID();  -- (in a stored procedure context)
```

#### MongoDB: Users & Roles

```javascript
// Switch to the database you want to secure
use ecommerce

// Create a read-only user for this database
db.createUser({
  user: "analyst",
  pwd: "SecurePass123!",
  roles: [{ role: "read", db: "ecommerce" }]
})

// Create an application user with read/write
db.createUser({
  user: "app_user",
  pwd: "AppPass456!",
  roles: [{ role: "readWrite", db: "ecommerce" }]
})

// Create a database admin
db.createUser({
  user: "db_admin",
  pwd: "AdminPass789!",
  roles: [{ role: "dbAdmin", db: "ecommerce" }]
})

// Built-in MongoDB roles:
// read        - read collections in one db
// readWrite   - read and write one db
// dbAdmin     - admin tasks (indexes, stats) for one db
// userAdmin   - manage users for one db
// dbOwner     - everything in one db
// readAnyDatabase  - read across all databases
// root        - superuser (avoid!)

// View users
db.getUsers()

// Update a user's roles
db.updateUser("analyst", {
  roles: [
    { role: "read", db: "ecommerce" },
    { role: "read", db: "analytics" }   // Add access to another db
  ]
})

// Remove a user
db.dropUser("old_user")
```

#### Schema Validation (MongoDB)

```javascript
// Add validation rules to a MongoDB collection
// (Brings some schema discipline to the document model)
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "firstName", "lastName"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^.+@.+\\..+$",
          description: "Must be a valid email address"
        },
        firstName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100
        },
        age: {
          bsonType: "int",
          minimum: 18,
          description: "Must be at least 18"
        }
      }
    }
  },
  validationAction: "error"    // "error" = reject, "warn" = allow but log
})
```

---

## 14. Performance & Query Optimization

### ⚡ Making Slow Queries Fast

#### MySQL: EXPLAIN & Query Optimization

```sql
-- The most important tool: EXPLAIN
EXPLAIN SELECT * FROM orders 
WHERE user_id = 1 
ORDER BY created_at DESC;

-- Output columns to look for:
-- type:   "ALL" = bad (full scan), "ref"/"const"/"eq_ref" = good (index)
-- key:    Which index was used (NULL = no index!)
-- rows:   Estimated rows scanned (lower = better)
-- Extra:  "Using filesort" = slow, "Using index" = very fast

-- Even better: EXPLAIN ANALYZE (MySQL 8.0+)
-- Shows actual execution times
EXPLAIN ANALYZE 
SELECT o.*, u.email
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending';

-- Common optimization tips:
-- 1. Add index for the WHERE clause column
CREATE INDEX idx_orders_status ON orders(status);

-- 2. Add composite index for common filter+sort combos
CREATE INDEX idx_user_date ON orders(user_id, created_at);
-- Now this query uses the index efficiently:
SELECT * FROM orders 
WHERE user_id = 1 
ORDER BY created_at DESC;

-- 3. Avoid SELECT * in production
-- ❌ Slow:   SELECT * FROM products
-- ✅ Faster: SELECT id, name, price FROM products

-- 4. Use LIMIT always in pagination
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 0;   -- Page 1
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 20;  -- Page 2

-- 5. Avoid functions on indexed columns (prevents index use)
-- ❌ Can't use index:  WHERE YEAR(created_at) = 2024
-- ✅ Index-friendly:   WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'

-- 6. Slow Query Log — find your worst queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries taking > 1 second
-- Then analyze: mysqldumpslow /var/log/mysql/slow-query.log
```

#### MongoDB: Query Performance Tools

```javascript
// explain() is your best friend
db.orders.find({ status: "pending", userId: ObjectId("...") })
  .explain("executionStats")

// Key fields to look at:
// executionStats.nReturned vs totalDocsExamined
// If nReturned=10 but totalDocsExamined=100000 → need an index!
// stage: "COLLSCAN" = slow, "IXSCAN" = fast

// Enable profiler to find slow queries
db.setProfilingLevel(1, { slowms: 100 })  // Log queries > 100ms

// Read the profiler output
db.system.profile.find().sort({ millis: -1 }).limit(5)

// Common MongoDB optimizations:

// 1. Create indexes for your most common queries
db.orders.createIndex({ status: 1, createdAt: -1 })

// 2. Use projection to return fewer fields
// ❌ Returns entire document:
db.products.find({ category: "Electronics" })
// ✅ Returns only what you need:
db.products.find(
  { category: "Electronics" },
  { name: 1, price: 1, _id: 0 }
)

// 3. Use $match early in pipeline to reduce documents
// ❌ Filter late:
db.orders.aggregate([
  { $unwind: "$items" },          // expensive! processes all docs
  { $match: { status: "delivered" } }  // filter at the end
])
// ✅ Filter first:
db.orders.aggregate([
  { $match: { status: "delivered" } }, // filter first = fewer docs!
  { $unwind: "$items" }
])

// 4. Covered queries (index contains ALL needed fields)
// Index on { email: 1, firstName: 1 }
// This query is "covered" — never touches actual documents!
db.users.find(
  { email: "alice@x.com" },
  { firstName: 1, _id: 0 }        // both fields are in the index
)

// 5. Avoid large skip() for pagination (use cursor-based pagination)
// ❌ Gets slower as offset increases:
db.products.find().skip(10000).limit(20)
// ✅ Cursor-based (always fast):
db.products.find({ _id: { $gt: lastSeenId } }).limit(20)
```

---

## 15. Real-World Use Cases

### 🌍 When to Choose MySQL vs MongoDB

#### Use Case 1: Banking System → MySQL ✅

```
Why MySQL wins:
✅ ACID transactions are non-negotiable (money must balance)
✅ Complex JOINs: accounts ↔ transactions ↔ users ↔ branches
✅ Strict schema: Every account MUST have all required fields
✅ Regulatory compliance requires data consistency
✅ Reporting: SQL makes it easy to generate financial reports

Schema:
accounts → transactions → users → branches → loans
All linked by foreign keys, normalized to 3NF
```

#### Use Case 2: Product Catalog → MongoDB ✅

```
Why MongoDB wins:
✅ Different product types have DIFFERENT fields
   - Shirt: { size, color, material }
   - TV: { screen_size, resolution, refresh_rate }
   - Book: { author, isbn, pages }
   Using one MySQL table would mean hundreds of NULL columns!

✅ Nested specs: { cpu: "M3", ram: "16GB", ports: [...] }
✅ Tags: ["wireless", "bluetooth", "noise-canceling"]
✅ Images array: [{ url, isPrimary, alt_text }]
✅ Schema changes often (add new product attributes easily)
```

#### Use Case 3: E-Commerce Orders → Both (Common Pattern)

```
Hybrid Architecture (Polyglot Persistence):
┌─────────────────────────────────────────────────────────┐
│  MySQL                      │  MongoDB                  │
│  ─────────────────────────  │  ─────────────────────    │
│  users (account, auth)      │  product_catalog          │
│  orders (financial records) │  user_sessions            │
│  payments                   │  shopping_carts           │
│  inventory (stock counts)   │  product_reviews          │
│  promotions/discounts       │  activity_logs            │
│                             │  search index data        │
└─────────────────────────────────────────────────────────┘

Many large companies (eBay, Airbnb, LinkedIn) use BOTH.
Choose the right tool for each part of the system!
```

#### Use Case 4: Real-Time Analytics → MongoDB ✅

```javascript
// IoT sensor data: Each sensor type has different readings
{
  deviceId: "sensor_001",
  timestamp: ISODate("2024-03-15T14:30:00Z"),
  type: "temperature",
  readings: { celsius: 22.5, humidity: 65 }
}
{
  deviceId: "sensor_002",
  type: "air_quality",
  readings: { co2: 412, pm25: 8.2, voc: 0.15, temperature: 21.1 }
}
// Each sensor type has DIFFERENT fields → MongoDB's flexibility shines
```

#### Use Case 5: Social Media Platform → MongoDB ✅

```javascript
// User post with nested comments, reactions, tags
{
  _id: ObjectId("..."),
  authorId: ObjectId("..."),
  content: "Just launched my new product! 🚀",
  tags: ["startup", "launch", "product"],
  media: [{ type: "image", url: "...", width: 1920, height: 1080 }],
  reactions: { likes: 234, loves: 45, shares: 12 },
  topComments: [    // Embed top 3 for fast feed rendering
    { authorName: "Bob", text: "Congrats!", likes: 5 },
    { authorName: "Carol", text: "Amazing!", likes: 3 }
  ],
  commentCount: 89,   // Cached count (don't count every time)
  createdAt: ISODate("2024-03-15T09:00:00Z")
}
// Entire post + top comments = ONE document read = blazing fast feed
```

---

## 16. Quick Reference Cheat Sheet

### Side-by-Side Command Reference

```
┌────────────────────────────────────┬────────────────────────────────────┐
│          MySQL (SQL)               │         MongoDB (Shell)            │
├────────────────────────────────────┼────────────────────────────────────┤
│ SHOW DATABASES;                    │ show dbs                           │
│ CREATE DATABASE db;                │ use db  (auto-creates)             │
│ USE db;                            │ use db                             │
│ SHOW TABLES;                       │ show collections                   │
│ DESCRIBE table;                    │ db.col.findOne()                   │
├────────────────────────────────────┼────────────────────────────────────┤
│ INSERT INTO t(a,b) VALUES(1,2);    │ db.t.insertOne({a:1, b:2})        │
│ SELECT * FROM t;                   │ db.t.find()                        │
│ SELECT a,b FROM t WHERE c=1;       │ db.t.find({c:1},{a:1,b:1,_id:0}) │
│ SELECT * FROM t ORDER BY a DESC;   │ db.t.find().sort({a:-1})           │
│ SELECT * FROM t LIMIT 10;          │ db.t.find().limit(10)              │
│ SELECT COUNT(*) FROM t;            │ db.t.countDocuments()              │
├────────────────────────────────────┼────────────────────────────────────┤
│ UPDATE t SET a=1 WHERE id=5;       │ db.t.updateOne({_id:id},{$set:{a:1}})│
│ UPDATE t SET a=a+1 WHERE id=5;     │ db.t.updateOne({_id:id},{$inc:{a:1}})│
│ DELETE FROM t WHERE id=5;          │ db.t.deleteOne({_id:id})           │
│ DELETE FROM t;                     │ db.t.deleteMany({})                │
│ DROP TABLE t;                      │ db.t.drop()                        │
│ DROP DATABASE db;                  │ db.dropDatabase()                  │
├────────────────────────────────────┼────────────────────────────────────┤
│ CREATE INDEX idx ON t(col);        │ db.t.createIndex({col:1})          │
│ EXPLAIN SELECT ...;                │ db.t.find(...).explain()           │
├────────────────────────────────────┼────────────────────────────────────┤
│ START TRANSACTION;                 │ session.startTransaction()         │
│ COMMIT;                            │ session.commitTransaction()        │
│ ROLLBACK;                          │ session.abortTransaction()         │
├────────────────────────────────────┼────────────────────────────────────┤
│ WHERE a > 5                        │ { a: { $gt: 5 } }                  │
│ WHERE a BETWEEN 5 AND 10           │ { a: { $gte: 5, $lte: 10 } }       │
│ WHERE a IN (1,2,3)                 │ { a: { $in: [1,2,3] } }            │
│ WHERE a IS NULL                    │ { a: null }                        │
│ WHERE a LIKE '%text%'              │ { a: /text/ }                      │
│ WHERE a=1 AND b=2                  │ { a:1, b:2 }                       │
│ WHERE a=1 OR b=2                   │ { $or: [{a:1},{b:2}] }             │
└────────────────────────────────────┴────────────────────────────────────┘
```

### The Big Picture Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  MYSQL vs MONGODB: THE FINAL COMPARISON                 │
├─────────────────────────┬───────────────────────┬────────────────────── ┤
│  Feature                │  MySQL                │  MongoDB              │
├─────────────────────────┼───────────────────────┼───────────────────────┤
│  Data Model             │  Tables + Rows         │  Collections + Docs   │
│  Schema                 │  Fixed, enforced       │  Flexible, dynamic    │
│  Relationships          │  JOINs (foreign keys)  │  Embed or $lookup     │
│  Query Language         │  SQL (standardized)    │  MQL (JSON-based)     │
│  ACID Transactions      │  Always (InnoDB)       │  Multi-doc (v4.0+)    │
│  Scaling                │  Vertical (scale up)   │  Horizontal (sharding)│
│  Indexing               │  B-Tree, Full-text     │  B-Tree, Text, Geo    │
│  Normalization          │  Strong encouragement  │  Denormalization OK   │
│  CAP behavior           │  CA (single) / CP      │  CP or AP (tunable)   │
│  Best for writes        │  Moderate              │  High throughput      │
│  Best for reads         │  Complex queries       │  Simple, nested reads │
│  Schema changes         │  Require migrations    │  Easy, no migration   │
│  Community/Ecosystem    │  Massive, 30+ years    │  Large, growing fast  │
└─────────────────────────┴───────────────────────┴───────────────────────┘
```

---

## Next Steps

Having mastered these concepts, here's where to go next:

**MySQL path:**
- Stored Procedures & Functions
- Triggers & Events
- Partitioning large tables
- MySQL Replication (Primary-Secondary)
- Query tuning with optimizer hints
- PostgreSQL (similar SQL, even more features)

**MongoDB path:**
- Change Streams (real-time data changes)
- Atlas Search (full-text search)
- Time-Series collections
- MongoDB Atlas (managed cloud)
- Mongoose ODM (Node.js)
- PyMongo / Motor (Python)

**Both:**
- Connection pooling
- Database migrations (Flyway, Liquibase, mongoose-migrate)
- Monitoring (Percona Monitoring, MongoDB Atlas Metrics)
- Backups & Disaster Recovery
- Sharding architecture
- Redis (caching layer for both)

---

*Guide covers MySQL 8.0+ and MongoDB 6.0+. Some features may differ in older versions.*