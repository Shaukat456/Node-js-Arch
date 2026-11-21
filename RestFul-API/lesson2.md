
# Chapter 9 — Security Considerations

## Learning Objectives

By the end of this chapter, you should understand:

1. Why plain-text passwords are dangerous.
2. Password hashing using bcrypt.
3. Environment variables and secret management.
4. Input validation and sanitization.
5. JWT signature verification and expiration.
6. Authentication vs authorization.
7. Role-based route protection.
8. Preventing privilege escalation.
9. Secure API responses.
10. HTTPS and secure communication.
11. Rate limiting and brute-force attacks.
12. Secure token storage.
13. Refresh tokens, rotation, and revocation.

---

# 9.1 Never Store Plain-Text Passwords

## What is a Plain-Text Password?

A plain-text password is a password stored exactly as the user entered it.

Imagine a user registers with:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "MyPassword123"
}
```

An insecure application might save this directly in MongoDB:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "MyPassword123"
}
```

### Why is this dangerous?

Imagine someone gains unauthorized access to your database.

If passwords are stored in plain text, the attacker can immediately read every user's password.

This is especially dangerous because users sometimes reuse passwords across multiple websites.

One database breach could compromise multiple accounts.

### Correct Approach

We should never store the original password.

Instead, we store a password hash.

---

# 9.2 Password Hashing Using bcrypt

## What is Hashing?

Hashing is the process of converting input data into a fixed-format output using a mathematical algorithm.

For example:

```text
Input:
MyPassword123

Hash:
$2b$12$...
```

The output is called a hash.

### Important: Hashing vs Encryption

These are different concepts.

| Hashing | Encryption |
|---|---|
| One-way transformation | Reversible transformation |
| No decryption key | Requires a decryption key |
| Used for password storage | Used for protecting data |
| Example: bcrypt | Example: AES |

We use password hashing because we don't need to recover the original password.

We only need to verify whether the password entered during login matches the stored password hash.

## What is bcrypt?

bcrypt is a password-hashing algorithm designed specifically for securely storing passwords.

It uses:

- A salt
- A configurable computational cost
- A password-hashing process

### What is Salt?

A salt is a random value added during password hashing.

Suppose two users have the same password:

```text
User A: password123
User B: password123
```

Without unique salts, their hashes could be identical.

With bcrypt, each password receives a unique salt.

Therefore:

```text
User A → Hash A
User B → Hash B
```

Even though both users entered the same password, their hashes will normally be different.

This makes precomputed hash attacks more difficult.

## Installing bcrypt

```bash
npm install bcrypt
```

## Hashing a Password

```javascript
const bcrypt = require("bcrypt");

async function hashPassword(password) {

    const saltRounds = 12;

    const hashedPassword = await bcrypt.hash(
        password,
        saltRounds
    );

    return hashedPassword;
}
```

### Understanding the Code

`bcrypt.hash()` generates a password hash.

It takes two arguments:

1. Original password.
2. Salt rounds (cost factor).

The higher the cost, the more computationally expensive hashing becomes.

The appropriate cost should be benchmarked for your production environment.

### Example

```javascript
const password = "MyPassword123";

const hashedPassword = await bcrypt.hash(password, 12);

console.log(hashedPassword);
```

Example output:

```text
$2b$12$someLongHashedValue...
```

The actual hash will be different each time because bcrypt generates a random salt.

## Verifying a Password

During login, we need to verify the entered password.

We use:

```javascript
bcrypt.compare()
```

Example:

```javascript
const isMatch = await bcrypt.compare(
    "MyPassword123",
    hashedPassword
);

console.log(isMatch);
```

It returns:

```text
true
```

If the password is incorrect:

```text
false
```

### Important Concept

We do not decrypt the stored hash.

Instead:

```text
User enters password
        |
        v
bcrypt.compare()
        |
        v
Compare against stored hash
        |
        v
true or false
```

---

# 9.3 Never Expose JWT Secrets in Source Code

## What is a JWT Secret?

When we generate a JWT, we sign it using a secret key.

Example:

```javascript
const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        userId: "123",
        role: "user"
    },
    "my-secret-key"
);
```

The string `"my-secret-key"` is the signing secret.

### Why is Hardcoding Dangerous?

Imagine uploading your project to GitHub.

If your JWT secret is inside your source code, anyone who can access that code may obtain it.

If an attacker gets your signing secret, they may be able to create forged tokens that your backend accepts.

### Correct Approach: Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/secure_api
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
```

Install dotenv:

```bash
npm install dotenv
```

Load environment variables:

```javascript
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET;
```

Now generate the token:

```javascript
const token = jwt.sign(
    {
        userId: "123"
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m"
    }
);
```

### Important Security Rules

1. Never commit `.env` to GitHub.
2. Add `.env` to `.gitignore`.
3. Use a long, randomly generated secret.
4. Use different secrets for development and production.
5. Rotate compromised secrets.

Example `.gitignore`:

```text
node_modules/
.env
```

---

# 9.4 Validate Incoming Request Data

## What is Input Validation?

Input validation means checking whether the data received from the client follows the expected rules.

Imagine our registration endpoint expects:

```json
{
    "name": "Ali",
    "email": "ali@example.com",
    "password": "Password123"
}
```

But someone sends:

```json
{
    "name": "",
    "email": "not-an-email",
    "password": "123"
}
```

We should reject this request.

### Why Is Validation Important?

Without validation:

- Invalid data enters the database.
- Application errors become more common.
- Attackers may exploit unexpected inputs.
- Business rules can be bypassed.

## Using Zod for Validation

Install:

```bash
npm install zod
```

Create:

`validators/authValidator.js`

```javascript
const { z } = require("zod");

const registerSchema = z.object({

    name: z.string()
        .min(2, "Name must contain at least 2 characters"),

    email: z.string()
        .email("Invalid email address"),

    password: z.string()
        .min(8, "Password must contain at least 8 characters")

});

module.exports = {
    registerSchema
};
```

Use the schema:

```javascript
const { registerSchema } = require("../validators/authValidator");

const result = registerSchema.safeParse(req.body);

if (!result.success) {

    return res.status(400).json({
        success: false,
        errors: result.error.issues
    });

}
```

### What does safeParse() do?

It validates the provided data without throwing a validation exception.

It returns an object containing:

- `success: true` and validated data.
- `success: false` and validation errors.

### Validation vs Sanitization

These are related but different concepts.

**Validation:** Checks whether data is acceptable.

**Sanitization:** Transforms or removes unwanted data according to application rules.

For example:

```text
Input:
"  Ali  "

After trimming:
"Ali"
```

Do not assume that validation alone prevents SQL injection, NoSQL injection, XSS, or other attacks. Use appropriate protections for each context.

---

# 9.5 Verify JWT Signatures and Expiration

## Why Do We Verify JWTs?

A client sends a token with a protected request.

But we cannot simply trust the token because the client supplied it.

An attacker could modify the token payload.

For example, suppose the original payload is:

```json
{
    "userId": "123",
    "role": "user"
}
```

An attacker might attempt to change it to:

```json
{
    "userId": "123",
    "role": "admin"
}
```

JWT signature verification detects unauthorized modifications.

## Understanding JWT Verification

We use:

```javascript
jwt.verify()
```

Example:

```javascript
const jwt = require("jsonwebtoken");

const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET
);
```

It checks:

1. Token signature.
2. Token expiration, if an expiration claim exists.
3. Other applicable registered claims.

If verification fails, it throws an error.

### What is Token Expiration?

JWTs can have an expiration time.

Example:

```javascript
const token = jwt.sign(
    {
        userId: "123"
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m"
    }
);
```

After 15 minutes, this token cannot be accepted as a valid access token.

### Why Is Expiration Important?

Suppose a token gets stolen.

Without expiration, it could remain usable indefinitely unless we implement another revocation mechanism.

Short-lived access tokens reduce this exposure.

---

# 9.6 Protect Administrative Routes

## What is Authentication Middleware?

Authentication middleware checks whether a request contains a valid authentication token.

Example:

```http
GET /api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

Our middleware:

1. Extracts the token.
2. Verifies the JWT.
3. Identifies the authenticated user.
4. Attaches user information to the request.
5. Passes control to the next handler.

Example:

```javascript
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });

    }

};

module.exports = protect;
```

### Understanding req.user

After verification:

```javascript
req.user = decoded;
```

We attach the verified token claims to the request.

Other middleware and controllers can now access:

```javascript
req.user.userId
```

This is how our backend knows which user is making the request.

For sensitive operations, we will also load the current user from the database rather than relying exclusively on role claims inside an access token.

---

# 9.7 Role-Based Access Control

Authentication alone does not guarantee that a user has permission to access every endpoint.

For example:

```text
Authenticated User
       |
       v
GET /api/admin/users
```

A user might have a valid JWT but still should not access administrative functionality.

This is where authorization comes in.

## Creating Role Middleware

Create:

`middleware/roleMiddleware.js`

```javascript
const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Access forbidden"
            });
        }

        next();

    };

};

module.exports = authorizeRoles;
```

### Understanding the Code

Consider:

```javascript
authorizeRoles("admin")
```

This creates middleware that permits only admins.

We can also write:

```javascript
authorizeRoles("admin", "moderator")
```

This allows either role.

### Using Middleware

```javascript
const protect = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
    "/admin/users",
    protect,
    authorizeRoles("admin"),
    getAllUsers
);
```

Request flow:

```text
Incoming Request
       |
       v
Authentication Middleware
       |
       v
Valid JWT?
       |
       v
Role Authorization
       |
       v
Is User Admin?
       |
       v
Controller
```

If the user is authenticated but lacks the required role, return `403 Forbidden`.

---

# 9.8 Prevent Users from Changing Their Own Roles

This is a very important security consideration.

Imagine a normal user sends:

```http
PATCH /api/users/profile
```

With this request body:

```json
{
    "name": "Ali",
    "role": "admin"
}
```

If our controller blindly updates every field from `req.body`, the user might promote themselves to admin.

This is called **Privilege Escalation**.

## Incorrect Approach

```javascript
await User.findByIdAndUpdate(
    req.user.userId,
    req.body
);
```

Why is this dangerous?

Because the client controls `req.body`.

We must never blindly trust client-supplied fields for sensitive operations.

## Correct Approach

Explicitly allow only permitted fields:

```javascript
const { name, email } = req.body;

const updatedUser = await User.findByIdAndUpdate(
    req.user.userId,
    {
        name,
        email
    },
    {
        new: true,
        runValidators: true
    }
);
```

Now the user cannot change their role through this profile endpoint.

Role changes should be handled through a separate admin-protected endpoint.

---

# 9.9 Never Return Password Hashes

Even though passwords are hashed, we should not expose password hashes through API responses.

Incorrect:

```javascript
res.json({
    user
});
```

This might expose the password hash and other internal fields.

Correct approach:

```javascript
const user = await User.findById(userId)
    .select("-password");

res.json({
    success: true,
    data: user
});
```

Alternatively, explicitly construct the response:

```javascript
res.json({
    success: true,
    data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});
```

The second approach gives us more control over what information is exposed.

---

# 9.10 Use HTTPS in Production

## What is HTTPS?

HTTPS stands for Hypertext Transfer Protocol Secure.

It uses TLS to protect communication between the client and server.

Consider a login request:

```json
{
    "email": "ali@example.com",
    "password": "Password123"
}
```

Without transport encryption, an attacker who can intercept network traffic may be able to read sensitive information.

HTTPS protects data in transit.

### What Does HTTPS Protect?

- Login credentials.
- JWTs.
- API request bodies.
- API responses.
- Other transmitted sensitive information.

### Important

HTTPS does not automatically protect your database, application logic, or compromised client devices.

It is one essential layer of application security.

---

# 9.11 Implement Rate Limiting

## What is a Brute-Force Attack?

A brute-force attack involves repeatedly attempting different passwords or credentials until the attacker finds a valid combination.

For example:

```text
Attempt 1: password123
Attempt 2: admin123
Attempt 3: qwerty123
Attempt 4: correct-password
```

An attacker might automate thousands of login attempts.

## What is Rate Limiting?

Rate limiting restricts how many requests a client can make within a given time window.

For example:

```text
Maximum: 5 login attempts
Window: 15 minutes
```

Requests exceeding the limit receive an error response.

## Installing express-rate-limit

```bash
npm install express-rate-limit
```

Example:

```javascript
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    limit: 5,

    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }

});
```

Apply it to login:

```javascript
router.post(
    "/login",
    loginLimiter,
    login
);
```

### Why Apply It to Login?

Login endpoints are common targets for automated credential attacks.

Rate limiting makes repeated attempts more difficult.

For production applications, also consider account-based throttling, monitoring, and appropriate reverse-proxy configuration.

---

# 9.12 Secure Token Storage

After login, our backend returns a JWT.

But where should the frontend store it?

Two common approaches are:

## Option A: Browser Storage

For example:

```javascript
localStorage.setItem("token", token);
```

Later:

```javascript
const token = localStorage.getItem("token");
```

Advantages:

- Easy to implement.
- Convenient for frontend applications.

Disadvantages:

- JavaScript can access localStorage.
- If an attacker executes malicious JavaScript through XSS, they may steal the token.

## Option B: HttpOnly Cookies

An HttpOnly cookie cannot be accessed through JavaScript.

Example:

```javascript
res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
});
```

### Understanding Cookie Options

| Option | Purpose |
|---|---|
| `httpOnly` | Prevents JavaScript access |
| `secure` | Sends cookie only over HTTPS |
| `sameSite` | Controls cross-site cookie sending |

Important considerations:

- Cookie-based authentication requires appropriate CSRF protection.
- Configure `sameSite` based on your frontend/backend deployment.
- Configure cookie expiration and clearing.
- Never assume HttpOnly cookies prevent every XSS-related risk.

For our learning project, we'll implement a secure token strategy and understand both approaches.

---

# 9.13 Refresh Tokens, Rotation and Revocation

## What is an Access Token?

An access token is a short-lived token used to access protected API endpoints.

Example:

```text
Access Token Lifetime: 15 minutes
```

## What is a Refresh Token?

A refresh token is a longer-lived credential used to obtain a new access token without requiring the user to log in again.

Example:

```text
Refresh Token Lifetime: 7 days
```

### Why Do We Need Refresh Tokens?

Imagine a user logs in.

The backend generates an access token that expires after 15 minutes.

After 15 minutes, the user wants to make another API request.

Without a refresh mechanism, the user would need to log in again.

With refresh tokens:

```text
User Logs In
     |
     v
Access Token + Refresh Token
     |
     v
Access Token Expires
     |
     v
Client Sends Refresh Token
     |
     v
Backend Validates Refresh Token
     |
     v
New Access Token
```

## What is Refresh Token Rotation?

Refresh token rotation means issuing a new refresh token whenever an existing refresh token is successfully used.

The previous refresh token is invalidated.

Example:

```text
Refresh Token A
       |
       v
Used to obtain new tokens
       |
       v
Refresh Token B
       |
       v
Token A becomes invalid
```

This helps detect certain token-reuse attacks.

## What is Token Revocation?

Revocation means invalidating a token before its normal expiration.

For example:

- User logs out.
- User changes their password.
- Account is compromised.
- Administrator disables an account.

A robust implementation can maintain hashed refresh-token records or token-family/session records in the database.

For refresh-token reuse detection, the server should revoke the affected token family.

---

# 9.14 Security Checklist

Before deploying our REST API, verify these practices:

- [ ] Passwords are hashed using bcrypt.
- [ ] JWT secrets are stored in environment variables.
- [ ] `.env` is excluded from Git.
- [ ] Request data is validated.
- [ ] JWT signatures are verified.
- [ ] Access tokens have expiration times.
- [ ] Protected routes require authentication.
- [ ] Admin routes require authorization.
- [ ] Users cannot assign themselves privileged roles.
- [ ] Password hashes are excluded from API responses.
- [ ] Production traffic uses HTTPS.
- [ ] Authentication endpoints have rate limiting.
- [ ] Tokens are stored and transmitted securely.
- [ ] Refresh tokens have rotation and revocation mechanisms.

---

# Chapter 10 — Security Knowledge Check

Answer these questions to test your understanding.

1. Why should we never store plain-text passwords?
2. What is password hashing?
3. What is the difference between hashing and encryption?
4. Why does bcrypt use a salt?
5. Why do we use bcrypt.compare() instead of decrypting a password?
6. What is a JWT signing secret?
7. Why should JWT secrets be stored in environment variables?
8. What is the difference between JWT decoding and verification?
9. Why should access tokens have expiration times?
10. What is authentication middleware?
11. What is the difference between 401 and 403?
12. What is privilege escalation?
13. Why is blindly updating a user using req.body dangerous?
14. Why should password hashes never be returned in API responses?
15. What does HTTPS protect?
16. What is a brute-force attack?
17. How does rate limiting help?
18. What is the difference between localStorage and HttpOnly cookies?
19. What is a refresh token?
20. What is refresh token rotation?

---

# Chapter 11 — Practical Security Assignment

Implement the following features in our REST API:

## Task 1: Password Security

- Install bcrypt.
- Hash passwords during registration.
- Verify passwords during login.
- Never return password hashes.

## Task 2: Environment Variables

- Install dotenv.
- Move JWT secret into `.env`.
- Add `.env` to `.gitignore`.

## Task 3: JWT Security

- Generate JWT after successful login.
- Set token expiration.
- Verify token in authentication middleware.
- Reject invalid and expired tokens.

## Task 4: RBAC

Implement three roles:

- user
- moderator
- admin

Create protected endpoints for each role.

## Task 5: Input Validation

Use Zod to validate:

- Registration.
- Login.
- Profile updates.

## Task 6: Rate Limiting

Apply rate limiting to login and registration endpoints.

---

