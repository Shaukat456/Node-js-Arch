
# Chapter 7 — JWT Authentication Middleware & Protected Routes

## Learning Objectives

By the end of this chapter, you will understand:

1. What middleware is in Express.
2. How authentication middleware works.
3. What Bearer tokens are.
4. How to extract JWT from request headers.
5. How `jwt.verify()` works.
6. How to attach authenticated user information to `req`.
7. How to protect API endpoints.
8. How to handle missing, invalid, and expired tokens.

---

## 1. The Problem: How Do We Protect Routes?

Suppose we have this endpoint:

```http
GET /api/users/profile
```

We want only logged-in users to access it.

Consider these two requests.

### Request A: Without a token

```http
GET /api/users/profile
```

This user has not provided any authentication information.

We should reject the request.

Expected response:

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

Status:

```text
401 Unauthorized
```

### Request B: With a valid token

```http
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

This user has provided a JWT.

Our backend must verify it before allowing access.

If valid, we allow the request to continue.

### The required flow

```text
Client Request
      |
      v
Authentication Middleware
      |
      v
Is Authorization Header Present?
      |
      +---- No ----> 401 Unauthorized
      |
      v
Extract JWT
      |
      v
Verify JWT Signature
      |
      +---- Invalid ----> 401 Unauthorized
      |
      v
Check Token Expiration
      |
      +---- Expired ----> 401 Unauthorized
      |
      v
Extract User Information
      |
      v
Attach User to req.user
      |
      v
Continue to Controller
```

This is exactly what we are going to implement.

---

## 2. Understanding Express Middleware

Before writing authentication middleware, understand how Express middleware works.

Middleware is a function that executes during the request-response cycle.

It can:

- Read the request.
- Modify the request.
- Modify the response.
- Reject a request.
- Pass control to the next middleware or controller.

A basic middleware function:

```js
const myMiddleware = (req, res, next) => {
  console.log("Middleware executed");

  next();
};
```

Let's understand its parameters.

| Parameter | Meaning |
|---|---|
| `req` | Incoming request |
| `res` | Response object |
| `next` | Function that passes control forward |

### What does `next()` do?

Consider:

```js
app.use((req, res, next) => {
  console.log("Middleware 1");

  next();
});

app.use((req, res, next) => {
  console.log("Middleware 2");

  next();
});

app.get("/", (req, res) => {
  res.send("Hello World");
});
```

When a request comes in, the execution order is:

```text
Request
   |
   v
Middleware 1
   |
   v
Middleware 2
   |
   v
Controller
   |
   v
Response
```

If middleware does not call `next()` or send a response, the request may remain pending.

### Middleware can also reject requests

```js
const checkAccess = (req, res, next) => {
  const allowed = false;

  if (!allowed) {
    return res.status(403).json({
      message: "Access forbidden"
    });
  }

  next();
};
```

Here, `next()` is not called when access is denied.

Therefore, the controller never executes.

This is the foundation of authentication and authorization.

---

## 3. What Is a Bearer Token?

When a user logs in, our backend returns a JWT.

The frontend stores the token and sends it with future requests.

A common way to send it is through the HTTP Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Why the word `Bearer`?

It indicates the authentication scheme being used.

In simple terms:

> Whoever possesses this valid bearer token can use it as proof of authentication.

This is why tokens must be protected.

### Example request

```http
GET /api/users/profile HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

In Express, we can access this header using:

```js
req.headers.authorization
```

The value will look like:

```text
Bearer eyJhbGciOiJIUzI1Ni...
```

We need to extract the token part.

---

## 4. Create Authentication Middleware

Our project structure will now look like this:

```text
src/
  config/
    db.js

  controllers/
    authController.js
    userController.js

  middleware/
    validate.js
    authMiddleware.js

  models/
    User.js

  routes/
    authRoutes.js
    userRoutes.js

  validators/
    authValidator.js

  app.js

server.js
.env
```

Create:

```text
src/middleware/authMiddleware.js
```

Add:

```js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check whether token exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    // 3. Check Bearer format
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format."
      });
    }

    // 4. Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        algorithms: ["HS256"]
      }
    );

    // 5. Attach authenticated identity to request
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };

    // 6. Continue to next middleware/controller
    next();

  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token."
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  protect
};
```

Let's understand each part carefully.

---

## 5. Understanding the Middleware Code

### Step 1: Read the Authorization header

```js
const authHeader = req.headers.authorization;
```

Suppose the client sends:

```http
Authorization: Bearer abc123
```

Then:

```js
authHeader = "Bearer abc123";
```

If the client does not send the header:

```js
authHeader = undefined;
```

### Step 2: Check whether a token exists

```js
if (!authHeader) {
  return res.status(401).json({
    success: false,
    message: "Access denied. No token provided."
  });
}
```

If no token exists, we reject the request.

We use `401 Unauthorized` because the user has not successfully authenticated.

### Step 3: Extract the token

```js
const [scheme, token] = authHeader.split(" ");
```

Suppose:

```js
const authHeader = "Bearer abc123";
```

Calling:

```js
authHeader.split(" ");
```

Produces:

```js
["Bearer", "abc123"]
```

JavaScript destructuring assigns:

```js
scheme = "Bearer";
token = "abc123";
```

We then check:

```js
if (scheme !== "Bearer" || !token) {
  // Reject request
}
```

This ensures that the request uses the expected format.

### Step 4: Verify the JWT

This is the most important part:

```js
const decoded = jwt.verify(
  token,
  process.env.JWT_SECRET,
  {
    algorithms: ["HS256"]
  }
);
```

Remember that in Chapter 6 we generated a JWT using:

```js
jwt.sign(payload, JWT_SECRET, options);
```

Now we verify it using:

```js
jwt.verify(token, JWT_SECRET, options);
```

The verification process checks:

1. Whether the signature is valid.
2. Whether the token has expired.
3. Whether the token is valid for the configured algorithm.
4. Whether other registered time constraints, such as `nbf`, are satisfied.

If verification succeeds, `jwt.verify()` returns the decoded payload.

If verification fails, it throws an error.

### Step 5: Attach user information to req

```js
req.user = {
  id: decoded.userId,
  role: decoded.role
};
```

This is an important Express concept.

We can add our own properties to the request object.

For example:

```js
req.user
```

Now contains:

```js
{
  id: "671a123456789abcdef12345",
  role: "user"
}
```

Why do we do this?

Because the next middleware or controller can access the authenticated user's information.

For example:

```js
const getProfile = (req, res) => {
  console.log(req.user.id);

  console.log(req.user.role);
};
```

We do not need to decode the token again in every controller.

### Step 6: Call next()

```js
next();
```

This tells Express:

> Authentication was successful. Continue processing the request.

If we do not call `next()`, the controller will not execute.

---

## 6. Create a Protected User Controller

Now let's create an endpoint that returns the currently authenticated user's profile.

Create:

```text
src/controllers/userController.js
```

Add:

```js
const User = require("../models/User");

const getProfile = async (req, res) => {
  try {
    // Get authenticated user ID
    const userId = req.user.id;

    // Find user in database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Return safe user information
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getProfile
};
```

Notice this line:

```js
const userId = req.user.id;
```

Where did `req.user` come from?

Our authentication middleware!

The request flow is:

```text
Client
  |
  v
protect middleware
  |
  | Verifies JWT
  | Sets req.user
  v
getProfile controller
  |
  | Uses req.user.id
  v
MongoDB
  |
  v
Profile response
```

This is how middleware and controllers work together.

---

## 7. Create the User Route

Create:

```text
src/routes/userRoutes.js
```

Add:

```js
const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getProfile
} = require("../controllers/userController");

// Protected route
router.get("/profile", protect, getProfile);

module.exports = router;
```

Understand this line:

```js
router.get("/profile", protect, getProfile);
```

There are two functions after the route path:

1. `protect`
2. `getProfile`

Express executes them in order.

```text
GET /profile
     |
     v
protect middleware
     |
     v
getProfile controller
```

If `protect` rejects the request, `getProfile` never executes.

---

## 8. Register User Routes in app.js

Open:

```text
src/app.js
```

Add the user routes.

```js
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running"
  });
});

module.exports = app;
```

Our API now has these endpoints:

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/users/profile` | Protected |

---

## 9. Test the Protected Route Using Postman

Now let's test everything.

### Test 1: Access profile without a token

Request:

```http
GET http://localhost:3000/api/users/profile
```

Do not add an Authorization header.

Expected response:

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

Status:

```text
401 Unauthorized
```

### Test 2: Access profile with a valid token

First, log in:

```http
POST http://localhost:3000/api/auth/login
```

Body:

```json
{
  "email": "ali@example.com",
  "password": "mypassword123"
}
```

Copy the token from the response.

Now send:

```http
GET http://localhost:3000/api/users/profile
```

In Postman:

1. Open the Authorization tab.
2. Select Bearer Token.
3. Paste your JWT into the token field.
4. Send the request.

Postman automatically adds:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

Expected response:

```json
{
  "success": true,
  "user": {
    "id": "671a123456789abcdef12345",
    "name": "Ali",
    "email": "ali@example.com",
    "role": "user",
    "createdAt": "2026-11-21T10:00:00.000Z"
  }
}
```

The actual ID and timestamp will be different.

### Test 3: Send an invalid token

Use:

```http
Authorization: Bearer invalidtoken123
```

Expected:

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

Status:

```text
401 Unauthorized
```

### Test 4: Send an expired token

If a token expires, `jwt.verify()` throws a `TokenExpiredError`.

Our middleware catches it and returns:

```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

Status:

```text
401 Unauthorized
```

---

## 10. Authentication vs Authorization

These are two different concepts.

### Authentication

Authentication answers:

**Who are you?**

Example:

A user sends a valid JWT.

Our middleware verifies the token and identifies the user.

```js
req.user = {
  id: "123",
  role: "user"
};
```

The user is now authenticated.

### Authorization

Authorization answers:

**What are you allowed to do?**

For example:

| Role | Permission |
|---|---|
| User | View own profile |
| Moderator | Moderate content |
| Admin | Manage users |

A user might be successfully authenticated but still not have permission to delete another user's account.

That is an authorization problem, not an authentication problem.

We will implement authorization using RBAC in the upcoming chapters.

---

## 11. Important Security Consideration: Is JWT Verification Enough?

Our current middleware verifies the JWT signature and expiration.

However, notice something:

```js
req.user = {
  id: decoded.userId,
  role: decoded.role
};
```

We are trusting the user ID and role stored in the token.

This is safe from ordinary token tampering because the signature is verified.

However, there is an important limitation.

Suppose:

1. Ali logs in as a normal user.
2. The server issues a JWT with `role: "user"`.
3. An administrator later changes Ali's role to `admin`.
4. Ali still has the old token.

That token still contains:

```json
{
  "userId": "123",
  "role": "user"
}
```

Or consider the opposite: an administrator is demoted, but their old token still contains `role: "admin"`.

A signed JWT does not automatically update when database data changes.

For stronger role and account-state enforcement, we can retrieve the current user from MongoDB during authentication or use a token-version/revocation strategy.

We will improve this in the RBAC implementation.

Also, if a user is deleted after receiving a token, the current middleware does not automatically know that the user no longer exists. A database lookup can address this.

---

## 12. Exercises

Complete these exercises yourself.

### Exercise 1 — Protect Another Route

Create:

```http
GET /api/users/dashboard
```

Only authenticated users should access it.

Return:

```json
{
  "success": true,
  "message": "Welcome to your dashboard"
}
```

### Exercise 2 — Add User Information

Modify the dashboard response to include:

- User ID
- User role

Use `req.user`.

### Exercise 3 — Test Different Authorization Headers

Try:

```http
Authorization: abc123
```

```http
Authorization: Bearer
```

```http
Authorization: Basic abc123
```

Observe which requests are rejected.

### Exercise 4 — Add Current User Lookup

Modify authentication middleware to retrieve the current user from MongoDB.

If the user no longer exists, reject the request.

Hint:

```js
const user = await User.findById(decoded.userId);
```

### Exercise 5 — Add Account Status

Add an `isActive` field to the User model.

If the user is inactive, do not allow access to protected routes.

---

## 13. Knowledge Check

Answer these questions before moving forward.

1. What is Express middleware?
2. What does `next()` do?
3. Where does the client send its JWT?
4. What is a Bearer token?
5. What is the difference between `jwt.sign()` and `jwt.verify()`?
6. What happens when a JWT expires?
7. Why do we attach information to `req.user`?
8. Why should a protected route execute authentication middleware before its controller?
9. What is authentication?
10. What is authorization?
11. Why can a user's role inside an existing JWT become outdated?
12. Does a valid JWT automatically prove that the user still exists in MongoDB?

---

## 14. What We Have Built

Our API now supports:

| Endpoint | Purpose | Access |
|---|---|---|
| POST `/api/auth/register` | Register user | Public |
| POST `/api/auth/login` | Login user | Public |
| GET `/api/users/profile` | Get own profile | Authenticated |
| GET `/api/users/dashboard` | Dashboard exercise | Authenticated |

We have successfully implemented:

- JWT generation
- JWT verification
- Bearer token extraction
- Authentication middleware
- Protected routes
- User identification using `req.user`

---

## Next Chapter — Role-Based Access Control (RBAC)

Now we will implement authorization.

Topics:

1. What is RBAC?
2. Roles vs permissions.
3. Why authentication alone is insufficient.
4. Creating authorization middleware.
5. Restricting endpoints to admins.
6. Restricting endpoints to moderators and admins.
7. Returning `403 Forbidden`.
8. Building admin-only user management endpoints.

**Goal:** An authenticated normal user should not be able to access administrator-only functionality.
