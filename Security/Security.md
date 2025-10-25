Perfect — this is one of the **most crucial topics** in professional Node.js backend development and interviews:
🔒 **API Security & Authentication**.

We’ll go deep into:

1. Security concepts
2. Authentication & authorization
3. JWT (JSON Web Tokens)
4. Password hashing (bcrypt)
5. Helmet middleware
6. Rate limiting
7. Advanced CORS hardening

---

# 🧠 Node.js API Security & Authentication — In Depth

---

## ⚔️ 1. Security in Node.js — What Are We Protecting?

When you build an API, you must protect it against:

| Threat                                | Description                               |
| ------------------------------------- | ----------------------------------------- |
| **Unauthorized access**               | Hackers calling APIs without credentials  |
| **Brute-force / credential stuffing** | Repeated password attempts                |
| **Token theft / session hijacking**   | Stolen JWTs or cookies                    |
| **Injection attacks**                 | SQL/NoSQL or command injection            |
| **XSS / CSRF / CORS misuse**          | Cross-site attacks                        |
| **DOS / DDOS**                        | Overwhelming requests to crash the server |

So our security approach should include:
✅ Authentication
✅ Authorization
✅ Rate Limiting
✅ Encryption (Hashing)
✅ Secure Headers
✅ Input Validation
✅ Logging and Auditing

---

## 🔑 2. Authentication vs Authorization

| Concept            | Description                  | Example                                 |
| ------------------ | ---------------------------- | --------------------------------------- |
| **Authentication** | Verifying _who_ the user is  | Login with email/password               |
| **Authorization**  | Verifying _what_ user can do | “Admin” can delete users, “User” cannot |

---

## 🧬 3. JWT (JSON Web Token) — Core of Modern Authentication

### 🔹 What is JWT?

JWT is a **compact token** format used to securely transmit user data between the client and server.

**Structure:**

```
Header.Payload.Signature
```

Example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VySWQiOjEsIm5hbWUiOiJKb2huIERvZSJ9.
hgs7adfhsd8f79as7f98as7fas9f
```

### 🔹 How JWT Works (Flow):

1. User logs in → Server validates credentials.
2. Server generates a JWT and sends it back.
3. Client stores it (usually in localStorage).
4. For every request → Client sends token in headers:

   ```
   Authorization: Bearer <token>
   ```

5. Server verifies token signature → if valid → grants access.

---

### 🔹 Example Implementation (Express + JWT)

```js
const jwt = require("jsonwebtoken");

// Generate token
function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
}

// Middleware to verify
function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}
```

---

## 🔒 4. Password Security with bcrypt

Never store plain passwords in the database.

### 🔹 Hashing Flow:

1. User enters password → server hashes it using `bcrypt`.
2. Hash stored in DB.
3. During login, bcrypt compares entered password with stored hash.

### 🔹 Example:

```js
const bcrypt = require("bcrypt");

// Hash password before saving
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare on login
const isMatch = await bcrypt.compare(enteredPassword, user.passwordHash);
```

**Why bcrypt?**

- Uses _salting_ (adds randomness → prevents rainbow table attacks).
- Slow by design → mitigates brute-force.

---

## 🧱 5. Helmet — Securing HTTP Headers

Helmet helps secure Express apps by setting various HTTP headers that prevent:

- XSS
- MIME sniffing
- Clickjacking
- Cache poisoning

### 🔹 Example:

```js
const helmet = require("helmet");
app.use(helmet());
```

Helmet automatically adds headers like:

- `X-Frame-Options: DENY`
- `X-XSS-Protection`
- `Strict-Transport-Security`
- `Content-Security-Policy`

---

## ⚡ 6. Rate Limiting — Prevent DOS & Brute Force

To stop attackers from flooding your API or guessing passwords.

### 🔹 Using `express-rate-limit`

```js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100, // limit each IP to 100 requests
  message: "Too many requests, try again later.",
});

app.use(limiter);
```

You can even use it per route (e.g., stricter on login routes).

---

## 🌐 7. CORS Hardening

CORS controls **which domains** can make API requests.

### 🔹 Basic setup:

```js
const cors = require("cors");
app.use(cors());
```

### 🔹 Hardened CORS (recommended for production):

```js
const corsOptions = {
  origin: ["https://your-frontend.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
```

---

## 🧰 8. Best Practices Summary

| Area                      | Best Practice                               |
| ------------------------- | ------------------------------------------- |
| **Passwords**             | Use bcrypt with at least 10 salt rounds     |
| **Tokens**                | Use JWTs with short expiry + refresh tokens |
| **Rate limiting**         | Apply global & per-route limits             |
| **Helmet**                | Always enable in production                 |
| **CORS**                  | Restrict origins & headers                  |
| **HTTPS**                 | Always use SSL/TLS                          |
| **Environment variables** | Store secrets in `.env`                     |
| **Logging**               | Log failed login attempts                   |
| **Validation**            | Use Joi/Zod to validate all input           |
| **Error Handling**        | Centralized middleware for all errors       |

---

## 🧠 9. Common Interview Questions

| Question                               | Answer (Summary)                                                        |
| -------------------------------------- | ----------------------------------------------------------------------- |
| What is JWT and why is it used?        | Token-based authentication, stateless, avoids session storage.          |
| Difference between JWT and sessions?   | JWT = stateless, scalable; Session = stored server-side, less scalable. |
| Why hash passwords?                    | Prevent plain-text leaks; bcrypt adds salt and slows brute-force.       |
| How to prevent brute-force?            | Rate limiting, Captchas, account lockouts.                              |
| Helmet vs CORS?                        | Helmet = security headers, CORS = domain access control.                |
| What if JWT is stolen?                 | Revoke token (maintain blacklist), shorten expiry, use refresh tokens.  |
| How to securely store JWT on frontend? | HttpOnly cookies (not localStorage).                                    |
| How to protect API from DOS?           | Rate limiting, caching, load balancing.                                 |

---

## 🧩 10. Real-World Architecture Example

**Auth Flow Example:**

1. User signs up → bcrypt hashes password → saved to DB.
2. User logs in → password verified → JWT created.
3. Client stores JWT → sends it in Authorization header.
4. Server verifies JWT for each API call.
5. Rate limiter + Helmet + CORS ensure API safety.
6. Admin routes double-check `req.user.role`.

---
