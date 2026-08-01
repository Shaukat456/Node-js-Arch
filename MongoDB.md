# MongoDB from Scratch with Express.js

## A Complete Beginner's Guide (Step by Step)

Since you've already learned **MySQL, Express, Transactions, Normalization, and Prisma**, we'll compare MongoDB with SQL throughout the tutorial so everything connects together.

---

# What you'll build

We'll build a simple **Student Management API**.

Features:

* Add Student
* Get Students
* Get One Student
* Update Student
* Delete Student

Technology Stack

```
Client
   │
HTTP Request
   │
Express.js
   │
Mongoose ODM
   │
MongoDB
```

This is similar to

```
Client
   │
HTTP Request
   │
Express.js
   │
MySQL Driver / Prisma
   │
MySQL
```

---

# Chapter 1: What is MongoDB?

MongoDB is a **NoSQL document database**.

Unlike MySQL, it does **NOT** store data in rows and columns.

Instead, it stores data as **documents**.

Example

Instead of

| id | name | age |
| -- | ---- | --- |
| 1  | Ali  | 20  |

MongoDB stores

```json
{
   "_id":"6831...",
   "name":"Ali",
   "age":20
}
```

This is called a **Document**.

---

# SQL vs MongoDB

Imagine a school.

## MySQL

Everything is kept in Excel sheets.

Students Sheet

| id | name |
| -- | ---- |
| 1  | Ali  |

Courses Sheet

| id | course |
| -- | ------ |
| 1  | Math   |

Enrollment Sheet

| student | course |
| ------- | ------ |
| 1       | 1      |

Lots of tables.

Lots of joins.

---

## MongoDB

Everything related to one student can stay together.

```json
{
   "name":"Ali",
   "age":20,
   "courses":[
      "Math",
      "Physics"
   ]
}
```

One document contains everything.

Much easier to read.

---

# SQL Terminology vs MongoDB

| MySQL       | MongoDB                       |
| ----------- | ----------------------------- |
| Database    | Database                      |
| Table       | Collection                    |
| Row         | Document                      |
| Column      | Field                         |
| Primary Key | _id                           |
| JOIN        | Embedding / Referencing       |
| Schema      | Optional (or Mongoose Schema) |

---

# Why MongoDB?

Imagine Facebook.

Every user has

* Name
* Email
* Friends
* Posts
* Profile Picture
* Likes
* Comments

Every user has different data.

SQL struggles because columns must exist beforehand.

MongoDB allows flexible documents.

---

Example

User 1

```json
{
   "name":"Ali"
}
```

User 2

```json
{
   "name":"Ahmed",
   "hobby":"Football"
}
```

No problem.

---

# But Isn't That Dangerous?

Yes.

Without rules, data becomes messy.

That's why we use

**Mongoose Schemas**

Think of them like:

> "Rules for documents."

Exactly like SQL table definitions.

---

# Chapter 2: Install MongoDB

We'll use MongoDB Community Edition or MongoDB Atlas (cloud). For learning locally, install MongoDB and also install **MongoDB Compass** (GUI).

Verify installation

```bash
mongod --version
```

---

# Create Project

```bash
mkdir student-api

cd student-api

npm init -y
```

Install Express

```bash
npm install express
```

Install Mongoose

```bash
npm install mongoose
```

---

# Project Structure

```
student-api

node_modules

models
    Student.js

routes
    students.js

app.js

package.json
```

---

# Chapter 3: What is Mongoose?

Without Mongoose

```
Express

↓

MongoDB Driver

↓

MongoDB
```

With Mongoose

```
Express

↓

Mongoose

↓

MongoDB Driver

↓

MongoDB
```

Think of Mongoose like Prisma for MongoDB.

It provides:

* Validation
* Schemas
* Models
* Easy queries
* Middleware
* Relationships
* Cleaner syntax

---

# Connect to Database

app.js

```javascript
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/schoolDB")
.then(()=>{
    console.log("Connected");
})
.catch(err=>{
    console.log(err);
});

app.listen(3000);
```

---

## What's happening?

### express()

Creates the Express application.

---

### express.json()

Middleware.

Converts

```json
{
 "name":"Ali"
}
```

into

```javascript
req.body
```

Without it

```javascript
req.body
```

will be undefined.

---

### mongoose.connect()

Creates a database connection.

```
MongoDB Server

↓

schoolDB

↓

Collections

↓

Documents
```

If `schoolDB` doesn't exist yet, MongoDB creates it automatically when data is first written.

Unlike MySQL, you don't usually need to create tables first.

---

# Chapter 4: Database, Collection, Document

```
schoolDB

    Students Collection

        Document

        Document

        Document

    Teachers Collection

        Document

        Document
```

Exactly like

```
Database

   Tables

      Rows
```

---

# Chapter 5: Schema

Create

models/Student.js

```javascript
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    age:{
        type:Number,
        required:true
    },

    email:{
        type:String,
        unique:true
    }

});

module.exports = mongoose.model("Student",studentSchema);
```

---

## Explain every concept

### new Schema()

Defines rules.

Like SQL

```sql
CREATE TABLE students(
name VARCHAR(50),
age INT
);
```

---

### type

Data type.

```javascript
type:String
```

Similar to

```sql
VARCHAR
```

---

### required

```javascript
required:true
```

Means

```
Cannot be NULL
```

Equivalent SQL

```sql
NOT NULL
```

---

### unique

Means

No duplicate emails.

Equivalent SQL

```sql
UNIQUE
```

---

# What is a Model?

Schema

↓

Model

↓

Collection

↓

Documents

Think

```
Blueprint

↓

Factory

↓

Objects
```

Model gives us functions like

```javascript
Student.find()

Student.create()

Student.deleteOne()

Student.updateOne()
```

---

# Chapter 6: Create Student

Route

```javascript
const Student = require("./models/Student");

app.post("/students",async(req,res)=>{

    const student=await Student.create(req.body);

    res.json(student);

});
```

Request

```json
POST

{
 "name":"Ali",
 "age":20,
 "email":"ali@gmail.com"
}
```

Result

```json
{
 "_id":"...",
 "name":"Ali",
 "age":20,
 "email":"ali@gmail.com"
}
```

---

## What happens internally?

```
Request

↓

Express

↓

Student.create()

↓

Mongoose Validation

↓

MongoDB

↓

Response
```

---

# Why create()?

Equivalent SQL

```sql
INSERT INTO students(...)
VALUES(...);
```

---

# Chapter 7: Read Data

```javascript
app.get("/students",async(req,res)=>{

const students=await Student.find();

res.json(students);

});
```

Equivalent SQL

```sql
SELECT * FROM students;
```

---

# Get One Student

```javascript
app.get("/students/:id",async(req,res)=>{

const student=await Student.findById(req.params.id);

res.json(student);

});
```

Equivalent SQL

```sql
SELECT *
FROM students
WHERE id=1;
```

---

# Update Student

```javascript
app.put("/students/:id",async(req,res)=>{

const updated=await Student.findByIdAndUpdate(

req.params.id,

req.body,

{new:true}

);

res.json(updated);

});
```

Equivalent SQL

```sql
UPDATE students

SET age=25

WHERE id=1;
```

---

### Why `{ new: true }`?

Without it

```
Returns OLD document.
```

With it

```
Returns UPDATED document.
```

---

# Delete Student

```javascript
app.delete("/students/:id",async(req,res)=>{

await Student.findByIdAndDelete(req.params.id);

res.json({
message:"Deleted"
});

});
```

Equivalent SQL

```sql
DELETE
FROM students
WHERE id=1;
```

---

# CRUD Comparison

| Operation | MongoDB             | MySQL        |
| --------- | ------------------- | ------------ |
| Create    | create()            | INSERT       |
| Read      | find()              | SELECT       |
| Read One  | findById()          | SELECT WHERE |
| Update    | findByIdAndUpdate() | UPDATE       |
| Delete    | findByIdAndDelete() | DELETE       |

---

# Chapter 8: Understanding `_id`

Every document gets

```json
"_id":"683d8d9..."
```

Automatically.

This is like

```sql
id INT AUTO_INCREMENT
```

Except MongoDB uses an **ObjectId** by default, which is globally unique and also encodes a timestamp.

---

# Chapter 9: Querying

Find students older than 18

```javascript
const students=await Student.find({

age:{
$gt:18
}

});
```

Equivalent SQL

```sql
SELECT *

FROM students

WHERE age>18;
```

---

Find by name

```javascript
Student.find({

name:"Ali"

});
```

Equivalent SQL

```sql
WHERE name='Ali'
```

---

# Chapter 10: Operators

| MongoDB | Meaning      | SQL Equivalent |
| ------- | ------------ | -------------- |
| $gt     | Greater Than | >              |
| $lt     | Less Than    | <              |
| $gte    | >=           | >=             |
| $lte    | <=           | <=             |
| $ne     | Not Equal    | !=             |
| $in     | Inside List  | IN             |
| $or     | OR           | OR             |

Example

```javascript
Student.find({

age:{

$gte:18,

$lte:25

}

});
```

---

# Chapter 11: Validation

```javascript
email:{
type:String,
required:true,
unique:true
}
```

If missing

```json
{
error:"Email required"
}
```

Validation happens before saving.

This prevents bad data from reaching the database.

---

# Chapter 12: Folder Structure (Production)

```
project

controllers

services

routes

models

middlewares

config

utils

app.js
```

Why separate layers?

```
Route
   │
Controller
   │
Service (Business Logic)
   │
Model (Database)
```

This keeps code organized and easier to test.

---

# MongoDB vs MySQL

| Feature                 | MongoDB                                                        | MySQL                                                    |
| ----------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| Storage                 | Documents                                                      | Tables                                                   |
| Schema                  | Flexible (optionally enforced)                                 | Fixed                                                    |
| Joins                   | Limited (`$lookup`)                                            | Excellent (`JOIN`)                                       |
| Normalization           | Optional                                                       | Recommended                                              |
| Scalability             | Horizontal scaling is a major strength                         | Traditionally vertical scaling, though clustering exists |
| Transactions            | Supported (multi-document)                                     | Supported                                                |
| Nested Data             | Excellent                                                      | Requires multiple tables or JSON columns                 |
| Analytics & Complex SQL | Less expressive                                                | Very powerful                                            |
| Best Use Cases          | Content, catalogs, social apps, logs, rapidly evolving schemas | Banking, ERP, accounting, inventory, reporting           |

---

# When should you choose MongoDB?

✅ Rapidly changing data models

✅ Social media applications

✅ Product catalogs

✅ User profiles

✅ Chat applications

✅ IoT sensor data

✅ Logging and event storage

---

# When should you choose MySQL?

✅ Banking systems

✅ Financial software

✅ School/University ERP

✅ Inventory management

✅ Payroll systems

✅ Complex reporting

✅ Applications with many relationships and joins

---

# Key Concepts You Learned

| Concept          | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| Database         | Container for collections                                      |
| Collection       | Equivalent of a SQL table                                      |
| Document         | Equivalent of a SQL row                                        |
| Field            | Equivalent of a SQL column                                     |
| Schema           | Rules for document structure                                   |
| Model            | Interface for querying and updating documents                  |
| ObjectId (`_id`) | Unique identifier for each document                            |
| Mongoose         | ODM that simplifies working with MongoDB                       |
| CRUD             | Create, Read, Update, Delete operations                        |
| Query Operators  | Filter documents using conditions like `$gt`, `$in`, and `$or` |

---

# What You Should Learn Next (Intermediate MongoDB)

Now that you understand the basics, the next topics are:

1. Mongoose Schema Types (String, Number, Date, Boolean, Array, ObjectId, Mixed)
2. Built-in and Custom Validation
3. Schema Methods, Statics, and Virtuals
4. Middleware (Pre/Post Hooks)
5. Relationships: Embedding vs Referencing
6. `populate()` (MongoDB's alternative to manual joins)
7. Indexes and Query Performance
8. Aggregation Pipeline (`$match`, `$group`, `$project`, `$lookup`)
9. Pagination, Sorting, and Field Selection
10. Transactions and Sessions in MongoDB
11. Error Handling and Validation Patterns in Express
12. Production Practices (environment variables, connection pooling, logging, backups, security)

These topics will take you from basic CRUD applications to building production-ready Express APIs with MongoDB.
