
# Complete REST API with JWT Authentication & Role-Based Access Control

## Project Overview

We are going to build a complete REST API using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- bcrypt
- Zod
- MVC Architecture

We will build a practical **User Management System** with authentication and authorization.

### Features

1. User Registration
2. User Login
3. Password Hashing
4. JWT Authentication
5. Protected Routes
6. User Profile
7. Update User Profile
8. Role-Based Access Control (RBAC)
9. Admin-Only Routes
10. CRUD Operations
11. Input Validation
12. Centralized Error Handling

---

# Chapter 1: Understanding REST APIs

## 1.1 What is an API?

API stands for Application Programming Interface.

An API allows two software applications to communicate with each other.

For example:

Imagine we have a React frontend and a Node.js backend.

The user enters their email and password into a login form.

The React application sends these credentials to our backend.

The backend verifies the credentials and returns a response.

The React application then uses that response to update the UI.

**Communication flow:**

```text
React Frontend
      |
      | HTTP Request
      v
Node.js Backend
      |
      | Database Query
      v
MongoDB
      |
      | Database Result
      v
Node.js Backend
      |
      | HTTP Response
      v
React Frontend
```

## 1.2 What is REST?

REST stands for Representational State Transfer.

It is an architectural style for designing network-based APIs.

REST APIs commonly use HTTP methods to perform operations on resources.

### HTTP Methods

| Method | Purpose | Example |
|---|---|---|
| GET | Retrieve data | Get all users |
| POST | Create data | Register a user |
| PUT | Replace data | Replace user profile |
| PATCH | Partially update data | Update username |
| DELETE | Delete data | Delete a user |

### Example API Endpoints

```http
POST   /api/auth/register
POST   /api/auth/login

GET    /api/users
GET    /api/users/profile
PATCH  /api/users/profile

GET    /api/admin/users
DELETE /api/admin/users/:id
PATCH  /api/admin/users/:id/role
```

## 1.3 What is a Resource?

In REST architecture, we work with resources.

A resource represents an entity in our application.

Examples:

- Users
- Products
- Orders
- Courses
- Payments

For example:

```http
GET /api/users
```

This endpoint represents the users resource.

---

# Chapter 2: Understanding MVC Architecture

## 2.1 What is MVC?

MVC stands for:

- Model
- View
- Controller

It is an architectural pattern used to organize application code.

Its primary purpose is separation of concerns.

Instead of writing all application logic in one file, we divide responsibilities into different components.

### Model

The Model handles data and database interactions.

For example:

- User schema
- Password field
- Email field
- User roles
- Database queries

### View

The View handles presentation.

In a traditional web application, it generates HTML pages.

In our REST API, React or another frontend application handles the presentation.

Therefore, we won't need server-rendered views.

### Controller

The Controller handles request-processing logic.

For example:

- Register a user
- Authenticate credentials
- Generate JWT
- Return user information

## 2.2 Request Flow in MVC

```text
Client
  |
  | HTTP Request
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
HTTP Response
```

## 2.3 Why Separate These Responsibilities?

Imagine putting everything inside `server.js`:

- Database connection
- User registration
- Login
- Password hashing
- JWT generation
- Authorization
- API routes

As the application grows, the file becomes difficult to maintain.

MVC helps us:

1. Organize code.
2. Reuse logic.
3. Maintain application structure.
4. Test components independently.
5. Scale the application more easily.

---

# Chapter 3: Project Setup

## 3.1 Create Project

```bash
mkdir secure-rest-api
cd secure-rest-api

npm init -y
```

## 3.2 Install Dependencies

```bash
npm install express mongoose dotenv bcrypt jsonwebtoken zod
```

Install development dependencies:

```bash
npm install -D nodemon
```

## 3.3 Project Structure

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

---

# Chapter 4: Understanding Authentication

## 4.1 What is Authentication?

Authentication means verifying the identity of a user.

In simple words:

**Authentication answers: Who are you?**

For example:

A user enters:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Our backend checks whether the credentials belong to a registered user.

If the credentials are correct, the user is authenticated.

## 4.2 What is Authorization?

Authorization determines what an authenticated user is allowed to do.

**Authorization answers: What are you allowed to access?**

Example:

A normal user can:

- View their profile.
- Update their profile.

An admin can:

- View all users.
- Delete users.
- Change user roles.

### Authentication vs Authorization

| Authentication | Authorization |
|---|---|
| Verifies identity | Checks permissions |
| Who are you? | What can you do? |
| Login | Role/permission checks |
| Happens first | Happens after authentication |

---

# Chapter 5: Understanding JWT

## 5.1 What is JWT?

JWT stands for JSON Web Token.

It is a compact, URL-safe format for representing claims between two parties.

JWT is commonly used for stateless authentication.

When a user successfully logs in, our backend generates a token.

The client stores the token and sends it with subsequent protected API requests.

## 5.2 JWT Structure

A JWT contains three parts:

```text
HEADER.PAYLOAD.SIGNATURE
```

### Header

Contains information about the token type and signing algorithm.

Example:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload

Contains claims about the user.

Example:

```json
{
  "userId": "12345",
  "role": "admin"
}
```

### Signature

The signature verifies that the token was signed using the expected secret or key.

It is generated using:

- Encoded header
- Encoded payload
- Secret key

### Important

JWT payloads are encoded, not encrypted.

Anyone possessing a JWT can decode its payload.

Never store passwords, secrets, or sensitive personal information inside JWT payloads.

## 5.3 JWT Authentication Flow

```text
1. User enters email and password
             |
             v
2. Backend verifies credentials
             |
             v
3. Backend generates JWT
             |
             v
4. JWT returned to client
             |
             v
5. Client sends JWT with requests
             |
             v
6. Authentication middleware verifies JWT
             |
             v
7. Request reaches protected controller
```

## 5.4 What is Bearer Authentication?

When sending a JWT to the backend, we commonly use the Authorization header.

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Bearer means whoever possesses the token can use it.

Therefore, tokens must be protected against theft.

---

# Chapter 6: Understanding Role-Based Access Control (RBAC)

## 6.1 What is RBAC?

RBAC stands for Role-Based Access Control.

It is an authorization approach in which permissions are assigned according to user roles.

Instead of checking individual permissions for every user, we assign users roles.

### Example

Our application has three roles:

| Role | Permissions |
|---|---|
| user | View and update own profile |
| moderator | User permissions + manage selected content |
| admin | Full administrative access |

## 6.2 How RBAC Works

```text
                  User
                   |
                   v
             Authentication
                   |
                   v
              Verify JWT
                   |
                   v
             Identify Role
                   |
          +--------+--------+
          |        |        |
          v        v        v
         User  Moderator   Admin
          |        |        |
          v        v        v
       Limited  Content   Full Admin
       Access   Management Access
```

## 6.3 Why Do We Need RBAC?

Imagine an application with 10,000 users.

We don't want every user to access administrative endpoints.

RBAC allows us to control access centrally.

For example:

```http
GET /api/admin/users
```

Only users with the admin role should access this endpoint.

---

# Chapter 7: Implementation Roadmap

We will implement the application in the following order.

| Step | Task |
|---|---|
| 1 | Initialize Express server |
| 2 | Connect MongoDB |
| 3 | Create User Model |
| 4 | Implement registration |
| 5 | Implement password hashing |
| 6 | Implement login |
| 7 | Generate JWT |
| 8 | Create authentication middleware |
| 9 | Create protected user routes |
| 10 | Implement role middleware |
| 11 | Create admin routes |
| 12 | Add input validation |
| 13 | Add centralized error handling |
| 14 | Test all endpoints using Postman |
| 15 | Apply security improvements |

---

# Chapter 8: Final API Design

Our completed application will expose these endpoints.

## Authentication Routes

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |

## User Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/users/profile | Authenticated |
| PATCH | /api/users/profile | Authenticated |

## Admin Routes

| Method | Endpoint | Access |
|---|---|---|
| GET | /api/admin/users | Admin |
| GET | /api/admin/users/:id | Admin |
| DELETE | /api/admin/users/:id | Admin |
| PATCH | /api/admin/users/:id/role | Admin |

---

