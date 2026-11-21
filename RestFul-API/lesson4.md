
# Chapter 6 — User Login API & JWT Authentication

## Learning Objectives

By the end of this chapter, you will understand:

1. What happens when a user logs in.
2. How to compare passwords using bcrypt.
3. What JWT is and why we use it.
4. How JWT tokens are generated.
5. How to configure JWT securely.
6. How to build a login controller.
7. How to test the login API using Postman.

---

## 1. Understanding the Login Process

Imagine a user has already registered:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "mypassword123"
}
```

During registration, we did not save the original password.

Instead, we saved its bcrypt hash:

```text
Original password:
mypassword123

Stored password:
$2b$12$....
```

Now the user wants to log in.

The user sends:

```json
{
  "email": "ali@example.com",
  "password": "mypassword123"
}
```

Our backend must:

1. Find the user using their email.
2. Retrieve the stored password hash.
3. Compare the submitted password with the stored hash.
4. If the password is correct, generate a JWT.
5. Return the JWT to the client.

### Login flow

```text
Client
  |
  | POST /api/auth/login
  | email + password
  v
Auth Route
  |
  v
Auth Controller
  |
  | Find user by email
  v
MongoDB
  |
  | Return user + password hash
  v
bcrypt.compare()
  |
  | Password correct?
  |
  +------ No ------> 401 Unauthorized
  |
  +------ Yes -----> Generate JWT
                         |
                         v
                    Return token
                         |
                         v
                       Client
```

---

## 2. Why Can't We Compare Passwords Directly?

Remember that bcrypt hashes are not reversible.

For example:

```js
const password = "mypassword123";
```

After hashing:

```text
$2b$12$....
```

We cannot do this:

```js
const originalPassword = decrypt(hashedPassword);
```

Because bcrypt is a one-way password hashing algorithm, not encryption.

Instead, bcrypt provides a comparison method:

```js
const isMatch = await bcrypt.compare(
  submittedPassword,
  storedHash
);
```

It internally performs the necessary comparison.

The result is:

```js
true
```

or:

```js
false
```

### Example

```js
const bcrypt = require("bcrypt");

const password = "mypassword123";

const hashedPassword = await bcrypt.hash(password, 12);

const isCorrect = await bcrypt.compare(
  "mypassword123",
  hashedPassword
);

console.log(isCorrect); // true

const isWrong = await bcrypt.compare(
  "wrongpassword",
  hashedPassword
);

console.log(isWrong); // false
```

**Important:** We never compare the plaintext password directly with the stored hash.

---

## 3. What Is JWT?

JWT stands for **JSON Web Token**.

It is a compact token format that allows two parties to exchange information.

In our REST API, JWT will help the server identify an authenticated user.

For example, after successful login, our server generates a token.

The client receives something like:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The client sends this token with future requests.

Our backend verifies the token and determines which user is making the request.

### Why do we need JWT?

Consider a simple example.

A user logs in successfully.

The server confirms:

```text
Email: ali@example.com
Password: correct
```

But what happens when the user requests their profile?

```http
GET /api/users/profile
```

How does the server know who is making this request?

We need a way to carry the user's authenticated identity across requests.

JWT solves this problem.

The client sends the token with subsequent requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

The server verifies it before allowing access to protected resources.

---

## 4. Understanding JWT Structure

A JWT consists of three parts:

```text
HEADER.PAYLOAD.SIGNATURE
```

Let's understand each part.

### A. Header

The header contains information about the token type and signing algorithm.

Example:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

Here:

- `alg`: Algorithm used to sign the token.
- `typ`: Token type.

### B. Payload

The payload contains claims, which are pieces of information about the token or its subject.

Example:

```json
{
  "userId": "671a123456789abcdef12345",
  "role": "user",
  "iat": 1795250000,
  "exp": 1795253600
}
```

Here:

- `userId`: Identifies the user.
- `role`: User's role.
- `iat`: Issued-at timestamp.
- `exp`: Expiration timestamp.

**Important:** JWT payloads are encoded, not encrypted.

Anyone possessing a JWT can decode its payload. Therefore, never put passwords, secrets, or sensitive personal information inside it.

### C. Signature

The signature helps the server verify that the token was signed using the expected secret or key.

Conceptually:

```text
Signature =
HMACSHA256(
  base64url(header) + "." + base64url(payload),
  secret
)
```

If someone modifies the payload, the signature will no longer validate.

---

## 5. Install JWT

Install the `jsonwebtoken` package:

```bash
npm install jsonwebtoken
```

We will use it to generate and verify tokens.

---

## 6. Configure Environment Variables

Open your `.env` file.

Add:

```env
PORT=3000

MONGO_URI=mongodb://127.0.0.1:27017/secure_api

JWT_SECRET=your_long_random_secret_here

JWT_EXPIRES_IN=1h
```

### What is JWT_SECRET?

It is a secret key used to sign and verify JWTs when using a symmetric algorithm such as HS256.

Only your backend should know this secret.

Never:

- Hardcode it inside your source code.
- Commit it to GitHub.
- Send it to the frontend.
- Share it with users.

For a real application, generate a strong random secret rather than using the example value.

For example, you can generate one with Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the generated value into `.env`.

---

## 7. Important: The Password Field Is Hidden by Default

In our previous `User.js` model, we defined:

```js
password: {
  type: String,
  required: true,
  minlength: 8,
  select: false
}
```

Do you remember what `select: false` does?

It prevents Mongoose from including the password field in query results by default.

For login, however, we need the stored password hash.

Therefore, we must explicitly request it:

```js
const user = await User.findOne({ email })
  .select("+password");
```

Without `.select("+password")`, the password field will generally be unavailable in the returned document.

This is an important security feature: password hashes should not appear in ordinary user queries.

---

## 8. Create the Login Validator

Create:

```text
src/
  validators/
    authValidator.js
```

Add the login validation schema.

```js
const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
}).strict();

module.exports = {
  loginSchema
};
```

### Why validate login data?

Never assume the frontend will always send valid data.

Someone could send:

```json
{
  "email": 12345,
  "password": null
}
```

Or:

```json
{
  "email": "invalid-email",
  "password": "abc",
  "role": "admin"
}
```

Validation helps us reject malformed requests before they reach our controller.

Notice that our login schema does not accept a `role` field.

The user must not be allowed to choose their role during login.

---

## 9. Create the Login Controller

Open:

```text
src/controllers/authController.js
```

Add the following code:

```js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const login = async (req, res) => {
  try {
    const { email, password } = req.validatedBody;

    // 1. Find user and explicitly retrieve password hash
    const user = await User.findOne({ email })
      .select("+password");

    // 2. Check whether user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 3. Compare submitted password with stored hash
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // 4. Reject incorrect password
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        algorithm: "HS256"
      }
    );

    // 6. Send response
    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  login
};
```

Let's understand the important parts.

### A. Find the user

```js
const user = await User.findOne({ email })
  .select("+password");
```

We search MongoDB for a user with the submitted email.

We explicitly request the password hash because our model uses `select: false`.

### B. Compare the password

```js
const isPasswordCorrect = await bcrypt.compare(
  password,
  user.password
);
```

Here:

- `password`: Password submitted by the client.
- `user.password`: Stored bcrypt hash.

If the comparison fails, we return an authentication error.

### C. Generate the JWT

```js
const token = jwt.sign(
  {
    userId: user._id.toString(),
    role: user.role
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
    algorithm: "HS256"
  }
);
```

The `jwt.sign()` method accepts three important arguments:

| Argument | Purpose |
|---|---|
| Payload | Information stored inside the token |
| Secret | Key used to sign the token |
| Options | Expiration and signing configuration |

We include:

```js
{
  userId: user._id.toString(),
  role: user.role
}
```

This identifies the user and carries their current role.

We will use these claims in the next chapter when building authentication middleware and role-based access control.

**Security note:** The role in a JWT is a snapshot from login time. If a user's role changes later, an already-issued token can still contain the old role until it expires. We will discuss strategies for handling this later.

### D. Return the response

```js
return res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
```

Notice that we do not return:

```js
user.password
```

Never expose password hashes in API responses.

---

## 10. Create the Login Route

Open:

```text
src/routes/authRoutes.js
```

If your registration route already exists, keep it and add the login route.

```js
const express = require("express");

const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

const validate = require("../middleware/validate");

const {
  registerSchema,
  loginSchema
} = require("../validators/authValidator");

// Registration
router.post(
  "/register",
  validate(registerSchema),
  register
);

// Login
router.post(
  "/login",
  validate(loginSchema),
  login
);

module.exports = router;
```

Your validator file should export both schemas:

```js
module.exports = {
  registerSchema,
  loginSchema
};
```

Make sure your existing registration schema and controller remain intact.

---

## 11. Register the Routes in app.js

Open:

```text
src/app.js
```

Make sure your authentication routes are mounted:

```js
const express = require("express");

const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running"
  });
});

module.exports = app;
```

Our endpoints are now:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in a user |

---

## 12. Test the Login API Using Postman

First, start your server:

```bash
npm run dev
```

### Test 1: Login with valid credentials

Request:

```http
POST http://localhost:3000/api/auth/login
```

Body → raw → JSON:

```json
{
  "email": "ali@example.com",
  "password": "mypassword123"
}
```

Expected response:

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671a123456789abcdef12345",
    "name": "Ali",
    "email": "ali@example.com",
    "role": "user"
  }
}
```

Your actual token and ID will be different.

### Test 2: Incorrect password

Request:

```json
{
  "email": "ali@example.com",
  "password": "wrongpassword"
}
```

Expected:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

Status code:

```text
401 Unauthorized
```

### Test 3: User does not exist

Request:

```json
{
  "email": "unknown@example.com",
  "password": "mypassword123"
}
```

Expected:

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

We intentionally use the same message for an unknown email and an incorrect password.

Why?

If we returned different messages, attackers could discover which email addresses are registered in our system.

### Test 4: Invalid email

Request:

```json
{
  "email": "invalid-email",
  "password": "mypassword123"
}
```

Expected:

```text
400 Bad Request
```

The validation middleware should reject the request.

---

## 13. Understanding HTTP Status Codes Used Here

| Status | Meaning | When we use it |
|---|---|---|
| 200 | OK | Login successful |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid credentials |
| 500 | Internal Server Error | Unexpected backend error |

Remember:

- `400`: The request data is invalid.
- `401`: Authentication failed.
- `403`: The user is authenticated but lacks permission.

We will explore `403 Forbidden` in the RBAC chapters.

---

## 14. Important JWT Security Concepts

Before moving forward, understand these security principles.

### 1. JWT is not encrypted by default

The payload is encoded, not hidden.

Do not store:

- Passwords
- Database credentials
- JWT secrets
- Sensitive private information

### 2. Always verify JWT signatures

Never trust a token just because it has a valid-looking structure.

The backend must verify its signature and expiration.

### 3. Use HTTPS

Without HTTPS, a token sent over the network may be intercepted.

### 4. Use token expiration

A token should not remain valid forever.

For this project, we are using:

```env
JWT_EXPIRES_IN=1h
```

### 5. Protect your JWT secret

Anyone who obtains your symmetric signing secret can potentially create valid tokens.

### 6. Use generic login errors

Avoid revealing whether an email exists.

### 7. Add rate limiting

A production login endpoint should have rate limiting to reduce brute-force attempts.

We will add more security improvements as the API develops.

---

## 15. Exercises

Try these exercises yourself.

### Exercise 1

Change the token expiration from one hour to 30 minutes.

### Exercise 2

Add a `lastLogin` field to the User model.

Update it whenever a user successfully logs in.

### Exercise 3

Return the user's role in the login response.

### Exercise 4

Try logging in with:

- An email containing uppercase letters.
- An email containing leading or trailing spaces.
- An incorrect password.
- An email that does not exist.

Observe how your API responds.

### Exercise 5

Inspect a JWT using a JWT decoder.

Identify:

- Header
- Payload
- Signature
- Issued-at time
- Expiration time

Never paste a real production token into an untrusted online decoder.

---

## 16. Knowledge Check

Answer these questions before moving to the next chapter.

1. Why do we use `bcrypt.compare()` instead of decrypting a password hash?
2. What are the three parts of a JWT?
3. Is the JWT payload encrypted?
4. What is the purpose of `JWT_SECRET`?
5. Why do we use `.select("+password")`?
6. What does `jwt.sign()` do?
7. What is the difference between HTTP 401 and HTTP 403?
8. Why should we not return the password hash in the login response?
9. Why should JWTs have an expiration time?
10. What information should we avoid putting inside a JWT payload?

---

## 17. What We Have Built

Our authentication system now supports:

```text
POST /api/auth/register
POST /api/auth/login
```

The registration endpoint creates users and securely hashes passwords.

The login endpoint verifies credentials and generates JWTs.

However, we have one important problem left.

**Generating a JWT is not enough.**

We still need to protect API endpoints using that token.

For example:

```http
GET /api/users/profile
Authorization: Bearer YOUR_TOKEN
```

Our backend needs middleware that:

1. Extracts the token from the request.
2. Verifies the JWT signature.
3. Checks whether the token has expired.
4. Identifies the authenticated user.
5. Attaches the user information to `req`.

That is what we will build next.

---
