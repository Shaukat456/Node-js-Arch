
# Chapter 4 — MVC Architecture & MongoDB Connection

## Learning Objectives

By the end of this chapter, you should understand:

1. Why we need a proper backend architecture.
2. What separation of concerns means.
3. MVC architecture in REST APIs.
4. Responsibilities of Routes, Controllers, and Models.
5. Difference between app.js and server.js.
6. What MongoDB is.
7. SQL vs NoSQL databases.
8. MongoDB databases, collections, and documents.
9. What Mongoose is.
10. Difference between Schema and Model.
11. Connecting MongoDB to Express.
12. Creating our first User Model.
13. Performing basic database operations.

---

# 4.1 Why Do We Need a Proper Backend Architecture?

Imagine building an API with all application logic inside `server.js`.

Initially, it might look simple:

```javascript
const express = require("express");

const app = express();

app.use(express.json());

app.post("/register", async (req, res) => {

    // Validate user input

    // Check whether email already exists

    // Hash password

    // Save user in database

    // Generate JWT

    // Send response

});

app.post("/login", async (req, res) => {

    // Find user

    // Compare password

    // Generate JWT

    // Send response

});

app.get("/users", async (req, res) => {

    // Retrieve users from database

});

app.listen(3000);
```

For a small application, this might work.

But imagine adding:

- 20 API endpoints
- Authentication
- Authorization
- Payment processing
- Email notifications
- Product management
- Order management

Your `server.js` will become difficult to maintain.

This creates several problems:

1. Difficult to locate application logic.
2. Difficult to test individual components.
3. Difficult to reuse code.
4. Difficult to collaborate with other developers.
5. Difficult to maintain as the application grows.

## Solution: Separation of Concerns

Separation of concerns means dividing an application into independent components, where each component has a specific responsibility.

For example:

| Component | Responsibility |
|---|---|
| Routes | Define API endpoints |
| Controllers | Handle request-processing logic |
| Models | Handle database structure and operations |
| Middleware | Process requests before controllers |
| Config | Application configuration |
| Utils | Reusable helper functions |

Instead of writing everything in one file, we distribute responsibilities.

---

# 4.2 Understanding MVC Architecture

MVC stands for:

- Model
- View
- Controller

It is a software architectural pattern.

Let's understand each component.

## 1. Model

The Model represents the application's data and provides an interface for interacting with the database.

For example, our User Model will define:

- User name
- Email
- Password hash
- Role
- Account creation date

It will also provide database operations through Mongoose.

Example:

```javascript
const user = await User.findOne({
    email: "ali@example.com"
});
```

Here, `User` is our Model.

## 2. View

The View handles the presentation layer.

In traditional MVC applications, the View generates HTML pages.

For example:

```text
User Controller
       |
       v
User View
       |
       v
HTML Page
```

However, in our REST API, we won't use server-rendered views.

Our React frontend will handle the presentation.

The backend will return JSON responses.

Example:

```json
{
    "success": true,
    "data": {
        "name": "Ali",
        "email": "ali@example.com"
    }
}
```

## 3. Controller

The Controller handles application logic associated with an incoming request.

For example, when a user registers:

1. Receive registration data.
2. Validate the data.
3. Check whether the email exists.
4. Hash the password.
5. Create the user.
6. Return the response.

Example:

```javascript
const register = async (req, res) => {

    // Registration logic goes here

};
```

The controller coordinates the operations needed to handle the request.

---

# 4.3 Understanding Routes, Controllers and Models Together

Let's consider a registration request.

The frontend sends:

```http
POST /api/auth/register
```

With:

```json
{
    "name": "Ali",
    "email": "ali@example.com",
    "password": "Password123"
}
```

How does this request reach MongoDB?

### Step 1: Route

The route defines which controller should handle the request.

```javascript
router.post("/register", register);
```

### Step 2: Controller

The controller processes the request.

```javascript
const register = async (req, res) => {

    const { name, email, password } = req.body;

    // Registration logic

};
```

### Step 3: Model

The controller uses the Model to interact with MongoDB.

```javascript
const user = await User.create({
    name,
    email,
    password
});
```

### Step 4: Database

Mongoose sends the database operation to MongoDB.

### Complete Request Flow

```text
             React Client
                  |
                  |
             HTTP Request
                  |
                  v
                Route
                  |
                  v
              Controller
                  |
                  v
                Model
                  |
                  v
               MongoDB
                  |
                  v
                Model
                  |
                  v
              Controller
                  |
                  v
             JSON Response
                  |
                  v
             React Client
```

**Remember:**

- Route decides where the request goes.
- Controller decides what needs to happen.
- Model handles data operations.

---

# 4.4 Understanding app.js vs server.js

You might have noticed that we are going to create two separate files:

```text
app.js
server.js
```

Why?

Because configuring an application and starting an HTTP server are two different responsibilities.

## app.js

This file configures our Express application.

It contains:

- Middleware
- Routes
- Error handling
- Express configuration

Example:

```javascript
const express = require("express");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({
        message: "API is working"
    });
});

module.exports = app;
```

Notice:

We export the Express application instead of starting the server here.

## server.js

This file starts the actual HTTP server.

```javascript
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Why Separate Them?

Consider testing.

When we want to test the Express application, we can import `app.js` without immediately starting a network listener.

This makes automated testing easier.

It also keeps application configuration separate from server startup.

---

# 4.5 Final Project Structure

Our project will follow this structure:

```text
secure-rest-api/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── validators/
│   │   └── authValidator.js
│   │
│   ├── utils/
│   │   └── generateToken.js
│   │
│   └── app.js
│
├── server.js
├── .env
├── .gitignore
└── package.json
```

We will gradually create these files as we implement each feature.

---

# 4.6 What is MongoDB?

Now let's understand our database.

A backend application generally needs to store persistent information.

For example:

Our application needs to store:

- User accounts
- Password hashes
- User roles
- Registration dates
- Other application data

We need a database to store this information.

## What is a Database?

A database is an organized system for storing, managing, retrieving, and modifying data.

For our project, we'll use MongoDB.

## What is MongoDB?

MongoDB is a NoSQL document-oriented database.

Unlike traditional relational databases, MongoDB stores data in documents, generally using BSON (Binary JSON).

Example MongoDB document:

```json
{
    "_id": "671234567890abcdef123456",
    "name": "Ali",
    "email": "ali@example.com",
    "password": "$2b$12$hashedPassword",
    "role": "user"
}
```

Notice that the information is stored as key-value pairs.

This makes MongoDB convenient for applications that work with document-based data.

---

# 4.7 SQL vs NoSQL

There are two widely used database categories:

1. Relational databases (SQL).
2. Non-relational databases (NoSQL).

## SQL Databases

Examples:

- PostgreSQL
- MySQL
- Microsoft SQL Server

SQL databases organize data into tables containing rows and columns.

Example: Users table

| id | name | email |
|---|---|---|
| 1 | Ali | ali@example.com |
| 2 | Ahmed | ahmed@example.com |
| 3 | Sara | sara@example.com |

## NoSQL Databases

Examples:

- MongoDB
- Redis
- Cassandra

MongoDB stores information in documents grouped into collections.

Example:

```json
{
    "name": "Ali",
    "email": "ali@example.com",
    "role": "user"
}
```

## Comparison

| Feature | SQL | MongoDB |
|---|---|---|
| Data structure | Tables | Collections |
| Records | Rows | Documents |
| Schema | Usually predefined | Flexible |
| Relationships | Foreign keys and joins | References and embedding |
| Query language | SQL | MongoDB query API |
| Example | PostgreSQL | MongoDB |

### When Should We Use SQL?

SQL is particularly useful when:

- Data has well-defined relationships.
- Strong relational constraints are important.
- Complex joins are common.
- Transactions across related records are important.

### When Should We Use MongoDB?

MongoDB is particularly useful when:

- Data naturally fits a document structure.
- Documents have varying fields.
- Application data benefits from embedding.
- Flexible document-oriented modeling is useful.

Neither database is universally better.

For our learning project, we'll use MongoDB.

---

# 4.8 Understanding MongoDB Database, Collection and Document

These three concepts are fundamental.

## 1. Database

A database is a container that holds collections.

Example:

```text
secure_api
```

## 2. Collection

A collection is a group of related documents.

Example:

```text
users
```

It is conceptually similar to a table in a relational database.

## 3. Document

A document represents an individual record.

Example:

```json
{
    "_id": "123",
    "name": "Ali",
    "email": "ali@example.com",
    "role": "user"
}
```

### Visual Representation

```text
MongoDB
   |
   v
Database: secure_api
   |
   +------------------+
   |                  |
   v                  v
users             products
   |                  |
   v                  v
Document 1        Document 1
Document 2        Document 2
Document 3        Document 3
```

---

# 4.9 What is Mongoose?

MongoDB is our database.

But how do we conveniently interact with it from Node.js?

We can use the official MongoDB Node.js driver.

However, for this project, we'll use Mongoose.

## What is Mongoose?

Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js.

It provides an abstraction for working with MongoDB documents.

Mongoose offers:

- Schema definitions.
- Model creation.
- Data validation.
- Query helpers.
- Middleware and hooks.
- Relationship population.
- Document methods.

### What is ODM?

ODM stands for Object Document Mapper or Object Data Modeling, depending on context.

It helps map application-level objects to database documents.

For example:

```javascript
const user = await User.findOne({
    email: "ali@example.com"
});
```

Instead of manually writing low-level database operations, we use Mongoose methods.

## Install Mongoose

```bash
npm install mongoose
```

---

# 4.10 Understanding Schema and Model

These two concepts are extremely important.

## What is a Schema?

A Schema defines the structure and validation rules for documents in a MongoDB collection.

Imagine our users should have:

- name
- email
- password
- role

We can define a schema:

```javascript
const userSchema = new mongoose.Schema({

    name: String,

    email: String,

    password: String,

    role: String

});
```

This describes the structure of our user documents.

## What is a Model?

A Model is a compiled interface created from a Schema.

We use it to interact with the database.

Example:

```javascript
const User = mongoose.model("User", userSchema);
```

Now we can perform operations:

```javascript
const user = await User.findOne({
    email: "ali@example.com"
});
```

### Schema vs Model

| Schema | Model |
|---|---|
| Defines document structure | Provides database operations |
| Defines fields and validation | Creates, finds, updates, deletes |
| Blueprint | Interface for working with documents |

Remember:

**Schema defines how data should look. Model lets us work with that data.**

---

# 4.11 Connecting MongoDB to Express

Now let's implement our database connection.

## Step 1: Install Dependencies

```bash
npm install mongoose dotenv
```

## Step 2: Configure Environment Variables

Create `.env` in the project root:

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/secure_api
```

This example assumes MongoDB is running locally.

Alternatively, you can use MongoDB Atlas and provide its connection URI.

### What is MongoDB Atlas?

MongoDB Atlas is MongoDB's managed cloud database service.

It allows us to create and manage MongoDB databases without maintaining our own database server.

## Step 3: Create Database Connection File

Create:

`src/config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {

    try {

        const connection = await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            `MongoDB Connected: ${connection.connection.host}`
        );

    } catch (error) {

        console.error("MongoDB Connection Failed:", error.message);

        process.exit(1);

    }

};

module.exports = connectDB;
```

### Understand the Code

**1. Import Mongoose**

```javascript
const mongoose = require("mongoose");
```

We import Mongoose to communicate with MongoDB.

**2. Create Connection Function**

```javascript
const connectDB = async () => {
```

We create an asynchronous function because connecting to a database takes time.

**3. Connect to MongoDB**

```javascript
await mongoose.connect(process.env.MONGO_URI);
```

This establishes the database connection.

`process.env.MONGO_URI` retrieves the connection URI from our environment variables.

**4. Handle Errors**

```javascript
catch (error) {
    console.error(error.message);
    process.exit(1);
}
```

If the connection fails, we log the error and terminate the process.

This prevents the application from running as though it were ready when the database is unavailable.

---

# 4.12 Create app.js

Create:

`src/app.js`

```javascript
const express = require("express");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Home route
app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Secure REST API is running"
    });

});

// Health check
app.get("/health", (req, res) => {

    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });

});

module.exports = app;
```

## Why Export app?

We export the Express application so `server.js` can import it and start the server.

This separation also makes testing easier.

---

# 4.13 Create server.js

Create:

`server.js`

```javascript
require("dotenv").config();

const app = require("./src/app");

const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {

    try {

        await connectDB();

        app.listen(PORT, () => {

            console.log(`Server running on port ${PORT}`);

        });

    } catch (error) {

        console.error("Server startup failed:", error.message);

        process.exit(1);

    }

};

startServer();
```

### Why Connect Database Before Starting Server?

Consider this situation:

Our server starts successfully, but MongoDB is unavailable.

A user sends a registration request.

Our application tries to save the user, but the database connection fails.

We can avoid accepting requests before the initial database connection succeeds.

Therefore:

```text
Start Application
       |
       v
Connect MongoDB
       |
       v
Connection Successful?
       |
       v
Start HTTP Server
```

For production systems, we should also handle unexpected database disconnections and graceful shutdowns.

---

# 4.14 Create Our First User Schema

Now let's create the actual User Model.

Create:

`src/models/User.js`

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },

    role: {
        type: String,
        enum: ["user", "moderator", "admin"],
        default: "user"
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;
```

## Understanding Schema Properties

### name

```javascript
name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
}
```

- `type`: Data type.
- `required`: Field is required.
- `trim`: Removes whitespace from the beginning and end.
- `minlength`: Minimum number of characters.

### email

```javascript
email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
}
```

- `unique`: Creates a unique index.
- `lowercase`: Converts email to lowercase when stored.
- `trim`: Removes surrounding whitespace.

Important: `unique: true` is an index constraint, not a Mongoose validator. We should handle MongoDB duplicate-key errors separately.

### password

```javascript
password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
}
```

`select: false` means the password field is excluded from query results by default.

It can be explicitly selected when needed:

```javascript
const user = await User.findOne({
    email: "ali@example.com"
}).select("+password");
```

This is useful during login, when we need the stored password hash to compare credentials.

### role

```javascript
role: {
    type: String,
    enum: ["user", "moderator", "admin"],
    default: "user"
}
```

`enum` restricts the field to allowed values.

`default` assigns the user role when a value is not provided.

**Security note:** Our public registration endpoint must never allow clients to choose their own role. We will enforce that in the controller.

### timestamps

```javascript
{
    timestamps: true
}
```

Mongoose automatically adds:

```json
{
    "createdAt": "2026-11-21T00:00:00.000Z",
    "updatedAt": "2026-11-21T00:00:00.000Z"
}
```

These timestamps are useful for tracking when records are created and updated.

---

# 4.15 Understanding Basic Mongoose Operations

Now that we have a Model, let's understand how to interact with the database.

## 1. Create

```javascript
const user = await User.create({

    name: "Ali",

    email: "ali@example.com",

    password: "hashedPassword"

});
```

Creates and saves a new document.

For now, this is only illustrating a database operation. In our actual registration controller, we will hash the password before saving it.

## 2. Find All

```javascript
const users = await User.find();
```

Returns all matching documents.

Exclude password hashes explicitly as an additional safeguard:

```javascript
const users = await User.find().select("-password");
```

## 3. Find One

```javascript
const user = await User.findOne({
    email: "ali@example.com"
});
```

Returns the first matching document.

## 4. Find By ID

```javascript
const user = await User.findById(userId);
```

Finds a document using its MongoDB `_id`.

## 5. Update

```javascript
const updatedUser = await User.findByIdAndUpdate(

    userId,

    {
        name: "Ali Ahmed"
    },

    {
        new: true,
        runValidators: true
    }

);
```

- `new: true` returns the updated document.
- `runValidators: true` runs applicable schema validators.

For security-sensitive updates, explicitly whitelist the fields that the user is allowed to modify.

## 6. Delete

```javascript
const deletedUser = await User.findByIdAndDelete(userId);
```

Deletes the matching document.

---

# 4.16 Complete Application Structure

At this stage, our project should look like this:

```text
secure-rest-api/
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   └── User.js
│   │
│   └── app.js
│
├── server.js
├── .env
├── .gitignore
└── package.json
```

Our `.gitignore`:

```text
node_modules/
.env
```

Our `package.json` scripts:

```json
{
    "scripts": {
        "start": "node server.js",
        "dev": "nodemon server.js"
    }
}
```

---

# 4.17 Run the Application

Make sure MongoDB is running.

Then execute:

```bash
npm run dev
```

Expected terminal output:

```text
MongoDB Connected: 127.0.0.1
Server running on port 3000
```

Test:

### Endpoint 1

```http
GET http://localhost:3000/
```

Expected:

```json
{
    "success": true,
    "message": "Secure REST API is running"
}
```

### Endpoint 2

```http
GET http://localhost:3000/health
```

Expected:

```json
{
    "success": true,
    "message": "Server is healthy"
}
```

---

# Chapter 4 — Practical Exercises

## Exercise 1: Understand MVC

Explain the responsibilities of:

1. Routes
2. Controllers
3. Models
4. Middleware

Draw the request flow for a user registration request.

## Exercise 2: Project Architecture

Create the following folders:

```text
config/
models/
controllers/
routes/
middleware/
validators/
utils/
```

Create `app.js` and `server.js` separately.

## Exercise 3: MongoDB Connection

Connect your Express application to MongoDB.

Verify the database connection through terminal output.

## Exercise 4: Product Model

Create a Product Model with these fields:

| Field | Type | Required |
|---|---|---|
| name | String | Yes |
| description | String | Yes |
| price | Number | Yes |
| category | String | Yes |
| stock | Number | Yes |

Additional requirements:

- Price must be greater than or equal to zero.
- Stock must be a non-negative integer.
- Name should be trimmed.
- Add timestamps.

## Exercise 5: Mongoose Operations

Write code to:

1. Create a product.
2. Retrieve all products.
3. Find a product by ID.
4. Find a product by name.
5. Update product price.
6. Delete a product.

---

# Chapter 4 — Knowledge Check

1. What is separation of concerns?
2. What is MVC architecture?
3. What is the responsibility of a controller?
4. What is the difference between a Route and a Controller?
5. Why do we separate app.js and server.js?
6. What is MongoDB?
7. What is the difference between SQL and NoSQL?
8. What is a MongoDB collection?
9. What is a MongoDB document?
10. What is Mongoose?
11. What is the difference between a Schema and a Model?
12. What does mongoose.connect() do?
13. What is the purpose of process.env?
14. What does select: false do?
15. What is the purpose of timestamps?
16. What is the difference between findOne() and findById()?
17. What does unique: true do?
18. Why should the database connection be established before accepting API requests?

---


