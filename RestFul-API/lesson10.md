
# Chapter 11 — API Error Handling, Validation & Security Hardening

## Learning Objectives

By the end of this chapter, you will understand:

1. Why centralized error handling matters.
2. How Express error-handling middleware works.
3. How to create custom API error classes.
4. How to handle asynchronous controller errors.
5. How to handle 404 routes.
6. How to create consistent API responses.
7. How to use Helmet.
8. How to configure CORS.
9. How to implement rate limiting.
10. How to log API requests.

---

# Part 1 — Understanding Error Handling

## 1. What Is an API Error?

Imagine a client sends this request:

```http
GET /api/users/invalid-id
```

Our API may encounter several kinds of errors.

| Error | Example | HTTP Status |
|---|---|---|
| Validation error | Invalid email | 400 |
| Authentication error | Missing JWT | 401 |
| Authorization error | User accessing admin route | 403 |
| Not found | User doesn't exist | 404 |
| Conflict | Duplicate email | 409 |
| Server error | Unexpected database failure | 500 |

These errors should be handled consistently.

### Why is consistency important?

Suppose one controller returns:

```json
{
  "message": "User not found"
}
```

Another returns:

```json
{
  "success": false,
  "error": "No user exists"
}
```

Another returns:

```json
{
  "status": "failed",
  "data": null
}
```

The frontend now needs to understand multiple response formats.

We want a consistent response structure.

---

## 2. Understanding Express Error Middleware

Normal Express middleware:

```js
const middleware = (req, res, next) => {
  next();
};
```

Error-handling middleware has four parameters:

```js
const errorHandler = (
  error,
  req,
  res,
  next
) => {
  // Handle error
};
```

Notice the difference:

Normal middleware:

```js
(req, res, next)
```

Error middleware:

```js
(error, req, res, next)
```

Express recognizes error-handling middleware because it has four arguments.

### How does error handling work?

Consider this controller:

```js
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {
    next(error);
  }
};
```

What does this do?

```js
next(error);
```

It passes the error to Express's error-handling middleware.

Instead of handling the response inside every controller, we let one central middleware handle it.

---

# Part 2 — Creating a Custom Error Class

## 3. Why Do We Need Custom Errors?

Suppose we want to generate a 404 error.

We could write:

```js
res.status(404).json({
  success: false,
  message: "User not found"
});
```

But this mixes business logic with HTTP response handling.

Instead, we can create an error object.

For example:

```js
throw new ApiError(
  404,
  "User not found"
);
```

Our error handler will convert it into an HTTP response.

This separates two responsibilities:

- Controller: determines what went wrong.
- Error handler: determines how to respond.

## 4. Create ApiError Class

Create:

```text
src/utils/ApiError.js
```

Code:

```js
class ApiError extends Error {
  constructor(
    statusCode,
    message,
    errors = []
  ) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
```

### Understand the code

**Extending Error:**

```js
class ApiError extends Error
```

JavaScript already provides a built-in `Error` class.

By extending it, our custom class behaves like a normal JavaScript error.

**Calling super:**

```js
super(message);
```

This initializes the parent `Error` class with our message.

**Adding statusCode:**

```js
this.statusCode = statusCode;
```

JavaScript errors do not automatically contain HTTP status codes.

We add one ourselves.

Now we can create:

```js
const error = new ApiError(
  404,
  "User not found"
);
```

The object contains:

```js
{
  message: "User not found",
  statusCode: 404,
  success: false
}
```

---

# Part 3 — Centralized Error Middleware

## 5. Create Error Handler

Create:

```text
src/middleware/errorHandler.js
```

Code:

```js
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  let message =
    err.message || "Internal server error";

  let errors = err.errors || [];

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    message = "Validation failed";

    errors = Object.values(err.errors).map(
      (item) => ({
        field: item.path,
        message: item.message
      })
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  // Log internal error details on the server
  console.error(err);

  const response = {
    success: false,
    message
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // Hide internal error details from clients
  if (statusCode === 500) {
    response.message = "Internal server error";
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
```

### Why handle different error types?

Consider:

```js
if (err.code === 11000)
```

MongoDB uses error code `11000` for duplicate-key errors.

For example, if email is unique and someone registers with an existing email, MongoDB can generate this error.

We convert it to:

```text
409 Conflict
```

Similarly:

```js
if (err.name === "CastError")
```

Mongoose can generate a CastError when an invalid identifier is used in a database operation.

And:

```js
if (err.name === "ValidationError")
```

handles Mongoose schema validation errors.

**Important:** This middleware handles known error categories. Add application-specific mappings as your project grows. Do not expose database stack traces or internal implementation details to clients.

---

# Part 4 — Handling 404 Routes

## 6. What Happens When a Route Doesn't Exist?

Suppose someone requests:

```http
GET /api/products
```

But we haven't created a products route.

Express does not automatically know what response format we want.

We should create a not-found middleware.

Create:

```text
src/middleware/notFound.js
```

Code:

```js
const ApiError = require("../utils/ApiError");

const notFound = (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

module.exports = notFound;
```

Now an unknown route becomes an error that our centralized error handler can process.

---

## 7. Understand Middleware Order

This is extremely important.

Open:

```text
src/app.js
```

Our middleware order should be:

```js
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 1. Built-in middleware
app.use(express.json());

// 2. API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 3. Not-found middleware
app.use(notFound);

// 4. Centralized error handler
app.use(errorHandler);

module.exports = app;
```

Why this order?

Express executes middleware in the order in which it is registered.

If we place the not-found middleware before our routes, it may catch requests before they reach the routes.

The correct order is:

```text
Incoming Request
       |
       v
express.json()
       |
       v
API Routes
       |
       +---- Route Found ----> Controller
       |
       +---- Route Missing
                    |
                    v
                notFound
                    |
                    v
               errorHandler
                    |
                    v
              HTTP Response
```

---

# Part 5 — Using Custom Errors in Controllers

## 8. Refactor a Controller

Previously, we wrote:

```js
if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found"
  });
}
```

Now we can write:

```js
const ApiError = require("../utils/ApiError");

if (!user) {
  throw new ApiError(
    404,
    "User not found"
  );
}
```

But there is an important issue.

In Express 4, an asynchronous error thrown inside an async controller is not automatically forwarded to Express's error handler.

We need to handle this.

---

## 9. Create an Async Handler

Create:

```text
src/utils/asyncHandler.js
```

Code:

```js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);
  };
};

module.exports = asyncHandler;
```

### Understand the code

Suppose we have:

```js
async function getProfile(req, res) {
  const user = await User.findById(req.user.id);

  res.json(user);
}
```

If the database operation fails, the promise rejects.

Our wrapper:

```js
Promise.resolve(fn(req, res, next))
  .catch(next);
```

forwards that error to Express.

Now we don't need a try/catch block in every controller.

---

## 10. Refactor Controller Using asyncHandler

Example:

```js
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const getProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });

});
```

Notice:

We no longer write:

```js
try {
  // ...
} catch (error) {
  // ...
}
```

The async handler forwards errors automatically.

### Important

This wrapper is useful for Express 4 applications.

Express 5 automatically forwards rejected promises from async route handlers to error middleware. You can still use this wrapper, but don't wrap the same handler unnecessarily.

---

# Part 6 — Consistent API Responses

## 11. Why Standardize Responses?

Imagine your frontend receives:

```json
{
  "success": true,
  "user": {
    "name": "Ali"
  }
}
```

Another endpoint returns:

```json
{
  "status": "success",
  "data": {
    "name": "Ali"
  }
}
```

And another:

```json
{
  "result": {
    "name": "Ali"
  }
}
```

This makes frontend development unnecessarily complicated.

We can establish a standard response format.

### Successful response

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "name": "Ali",
    "email": "ali@example.com"
  }
}
```

### Error response

```json
{
  "success": false,
  "message": "User not found"
}
```

### Validation error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

## 12. Create Response Utilities

Create:

```text
src/utils/response.js
```

Code:

```js
const sendSuccess = (
  res,
  statusCode,
  message,
  data = null
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

module.exports = {
  sendSuccess
};
```

Usage:

```js
const { sendSuccess } = require("../utils/response");

const getProfile = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sendSuccess(
    res,
    200,
    "Profile fetched successfully",
    user
  );

});
```

This is a utility, not a requirement. You can also write the response directly when that is clearer.

---

# Part 7 — Security Hardening

Now that error handling is organized, let's improve the security of our Express application.

## 13. Helmet

### What is Helmet?

Helmet is an Express middleware package that sets various HTTP security headers.

These headers help protect applications against certain web vulnerabilities and unsafe browser behaviors.

Install:

```bash
npm install helmet
```

In `src/app.js`:

```js
const helmet = require("helmet");

app.use(helmet());
```

That's it.

Helmet applies a collection of security-related HTTP headers.

For example, it can configure:

- Content Security Policy.
- X-Content-Type-Options.
- Referrer Policy.
- Frame-related protections.

Helmet does not make an application automatically secure. You still need proper authentication, authorization, validation, and safe output handling.

---

## 14. CORS

### What is CORS?

CORS stands for Cross-Origin Resource Sharing.

Imagine:

Your backend:

```text
http://localhost:3000
```

Your frontend:

```text
http://localhost:5173
```

These are different origins because their ports are different.

A browser uses the same-origin policy to restrict certain cross-origin requests.

CORS allows a server to specify which origins are permitted to access its resources through browsers.

Install:

```bash
npm install cors
```

Configure:

```js
const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### Why not use this everywhere?

```js
app.use(cors());
```

This allows requests from any origin by default.

That may be acceptable for some public APIs, but for an application with private user data, you should configure allowed origins deliberately.

If you use cookies for authentication, you also need to configure credentials carefully and cannot combine credentialed requests with a wildcard origin.

Remember:

CORS is not authentication.

A server must still verify JWTs and enforce permissions.

---

## 15. Rate Limiting

### What is rate limiting?

Imagine an attacker repeatedly sends:

```text
POST /api/auth/login
```

They try thousands of passwords.

This is a brute-force attack.

Rate limiting restricts how many requests a client can make during a specific period.

Install:

```bash
npm install express-rate-limit
```

Configure:

```js
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});
```

Apply it to authentication routes:

```js
app.use("/api/auth", authLimiter, authRoutes);
```

This configuration allows up to 10 requests per 15-minute window for each client according to the limiter's default keying behavior.

For production, consider:

- Separate limits for login and forgot-password routes.
- Distributed rate limiting when running multiple server instances.
- Correct client IP handling behind a trusted reverse proxy.
- Monitoring and alerting for suspicious traffic.

Rate limiting makes automated attacks harder, but does not replace account lockout policies, MFA, or other security controls.

---

## 16. Request Logging

When an API receives thousands of requests, debugging becomes difficult without logs.

We can use Morgan.

Install:

```bash
npm install morgan
```

Configure:

```js
const morgan = require("morgan");

app.use(morgan("dev"));
```

Now you will see request logs in your terminal.

Example:

```text
GET /api/users/profile 200
POST /api/auth/login 200
GET /api/users 403
```

### Why is logging useful?

It helps us understand:

- Which endpoint was accessed.
- Which HTTP method was used.
- Which status code was returned.
- How long a request took.

Never log passwords, Authorization headers, JWTs, reset tokens, or other sensitive information.

For larger applications, use structured logging and a centralized logging platform.

---

# Part 8 — Final app.js

After installing the packages, your `src/app.js` can look like this:

```js
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Request parsing
app.use(express.json());

// Request logging
app.use(morgan("dev"));

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);

// Not-found handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
```

Note: This applies the same limiter to all authentication routes. In a production system, you may want different limits for login, registration, and password-reset endpoints.

---

# Part 9 — Updated Project Structure

Our project is becoming more organized.

```text
secure-api/
│
├── server.js
├── .env
├── package.json
│
└── src/
    │
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── models/
    │   └── User.js
    │
    ├── controllers/
    │   ├── authController.js
    │   └── userController.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   └── userRoutes.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── authorize.js
    │   ├── validate.js
    │   ├── errorHandler.js
    │   └── notFound.js
    │
    ├── validators/
    │   ├── authValidator.js
    │   └── userValidator.js
    │
    └── utils/
        ├── ApiError.js
        ├── asyncHandler.js
        └── response.js
```

---

# Part 10 — Exercises

## Exercise 1: Centralized Errors

Refactor your `getUserById` controller.

Instead of directly returning a 404 response, throw:

```js
new ApiError(404, "User not found");
```

Use `asyncHandler`.

## Exercise 2: Duplicate Email

Register an existing email.

Make sure MongoDB duplicate-key errors return:

```text
409 Conflict
```

## Exercise 3: Invalid ObjectId

Request:

```http
GET /api/users/invalid-id
```

Return:

```text
400 Bad Request
```

## Exercise 4: Unknown Route

Request:

```http
GET /api/unknown
```

Return:

```json
{
  "success": false,
  "message": "Route not found: GET /api/unknown"
}
```

## Exercise 5: Rate Limiting

Send more than 10 requests to an authentication endpoint within 15 minutes.

Verify that the limiter blocks additional requests.

## Exercise 6: CORS

Try accessing your backend from a frontend running on another port.

Configure the allowed origin and test again.

---

# Part 11 — Knowledge Check

1. What is centralized error handling?
2. What are the four parameters of Express error middleware?
3. What does `next(error)` do?
4. Why do we create a custom `ApiError` class?
5. What does `asyncHandler` solve in Express 4?
6. Why should 404 middleware come after API routes?
7. What is the purpose of Helmet?
8. What problem does CORS address?
9. Is CORS a replacement for authentication?
10. What is a brute-force attack?
11. How does rate limiting help?
12. Why should we never log JWTs or passwords?

---

# Chapter Summary

We have improved our API architecture with:

- Custom API errors.
- Centralized error handling.
- Async error forwarding.
- 404 handling.
- Consistent response utilities.
- Helmet security headers.
- CORS configuration.
- Rate limiting.
- Request logging.

Our API is now easier to maintain and has several important security protections.

---

