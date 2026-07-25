Perfect. Since you've already covered Node.js, Express, joins, transactions, sockets, and Kafka, let's move to one of the most important topics for backend development:

# Express Middleware & Security (From Scratch)

We'll build a small API throughout the lesson.

```
Client
   │
   ▼
Request
   │
   ▼
Logging Middleware
   │
   ▼
Authentication Middleware
   │
   ▼
Validation Middleware
   │
   ▼
Route Handler
   │
   ▼
Response
```

---

# Part 1: What is Middleware?

## Real Life Analogy

Imagine you're entering an airport.

Before boarding the plane, you pass through several checkpoints.

```
Entrance
    │
Security Check
    │
Passport Check
    │
Ticket Verification
    │
Boarding Gate
```

Each checkpoint performs one task.

In Express, middleware works exactly the same.

A request passes through multiple checkpoints before reaching the route.

---

## Express Flow

```
Client

GET /profile

      │

Logging Middleware

      │

Authentication Middleware

      │

Validation Middleware

      │

Controller

      │

Response
```

Each middleware can

* continue
* stop
* modify request
* modify response

---

# Basic Middleware

```javascript
const express = require("express");
const app = express();

function logger(req, res, next) {

    console.log("Someone visited:", req.url);

    next();

}

app.use(logger);

app.get("/", (req, res)=>{

    res.send("Home");

});

app.listen(3000);
```

---

## What happens?

User visits

```
localhost:3000
```

Flow

```
Request

↓

logger()

↓

Route

↓

Response
```

Console

```
Someone visited: /
```

Browser

```
Home
```

---

# Key Concept → next()

This is one of the most important concepts.

Middleware receives

```javascript
(req,res,next)
```

### req

Contains request information

```
URL

Headers

Body

Query

Params
```

Example

```javascript
console.log(req.url);
console.log(req.method);
console.log(req.body);
```

---

### res

Used to send response

```javascript
res.send("Hello");
```

---

### next()

Moves request to next middleware.

Without it...

```
Request

↓

Middleware

(STOP)
```

The request hangs forever.

Example

```javascript
function logger(req,res,next){

    console.log("Visited");

}
```

Browser

```
Loading...
Loading...
Loading...
```

because Express is waiting.

Always call

```javascript
next();
```

unless you send a response.

---

# Multiple Middleware

```javascript
app.use((req,res,next)=>{

    console.log("Middleware 1");

    next();

});

app.use((req,res,next)=>{

    console.log("Middleware 2");

    next();

});

app.get("/",(req,res)=>{

    res.send("Done");

});
```

Console

```
Middleware 1

Middleware 2
```

Flow

```
Request

↓

Middleware 1

↓

Middleware 2

↓

Route

↓

Response
```

---

# Why Middleware Exists

Instead of writing this:

```javascript
app.get("/users",(req,res)=>{

    console.log("Visited");

});
```

and again

```javascript
app.get("/products",(req,res)=>{

    console.log("Visited");

});
```

and again...

We write one middleware.

```
All Requests

↓

Logger

↓

Routes
```

One place.

Cleaner.

---

# Custom Middleware #1 Logging

Suppose you want to know

* who visited
* when
* which endpoint
* GET or POST

---

```javascript
function logger(req,res,next){

    console.log("Time:",new Date());

    console.log("Method:",req.method);

    console.log("URL:",req.url);

    next();

}

app.use(logger);
```

Output

```
Time:
2026-07-25

Method:
GET

URL:
/users
```

---

## Why Companies Use It

If production crashes

you can inspect logs.

Example

```
10:35

POST /login

500 Error
```

Now developers know what happened.

---

# Custom Middleware #2 Authentication

Imagine

```
GET /profile
```

Only logged-in users should access it.

Without middleware

```
Anyone

↓

Profile
```

Bad.

Instead

```
Request

↓

Authentication

↓

Profile
```

---

Let's assume client sends

```
Authorization: secret123
```

Middleware

```javascript
function auth(req,res,next){

    const token=req.headers.authorization;

    if(token==="secret123"){

        next();

    }else{

        res.status(401).send("Unauthorized");

    }

}
```

Protected route

```javascript
app.get("/profile",auth,(req,res)=>{

    res.send("Private Profile");

});
```

Notice

```javascript
app.get("/profile", auth, handler)
```

Middleware can be attached to one route only.

---

## Successful Request

Header

```
Authorization

secret123
```

Flow

```
Request

↓

Auth

↓

Profile

↓

Response
```

Output

```
Private Profile
```

---

## Failed Request

Header

```
wrongtoken
```

Flow

```
Request

↓

Auth

↓

401

END
```

Response

```
Unauthorized
```

Notice

No

```
next()
```

because request stops.

---

# Custom Middleware #3 Validation

Suppose

POST

```
/register
```

expects

```json
{
"name":"Ali",
"age":22
}
```

User sends

```json
{
"name":"Ali"
}
```

Age missing.

Without validation

Database gets bad data.

---

Middleware

```javascript
function validateUser(req,res,next){

    const {name,age}=req.body;

    if(!name || !age){

        return res.status(400).send("Missing Fields");

    }

    next();

}
```

Route

```javascript
app.post("/register",validateUser,(req,res)=>{

    res.send("User Created");

});
```

Flow

```
Request

↓

Validation

↓

Route

↓

Database
```

---

# Combining Multiple Middleware

```javascript
app.post(

"/register",

logger,

auth,

validateUser,

(req,res)=>{

res.send("Registered");

}

);
```

Flow

```
Request

↓

Logger

↓

Authentication

↓

Validation

↓

Route

↓

Response
```

This is exactly how enterprise APIs work.

---

# Middleware Order Matters

Suppose

```javascript
app.use(auth);

app.use(logger);
```

Flow

```
Request

↓

Authentication

↓

Logger
```

If authentication fails,

logger never runs.

Usually

```
Logger

↓

Rate Limiter

↓

Helmet

↓

CORS

↓

Authentication

↓

Validation

↓

Controller
```

---

# Part 2: Security in Express

A public API faces threats like:

* Unknown websites making requests
* Brute-force login attempts
* Malicious HTTP headers
* Cross-site scripting (XSS)
* SQL/NoSQL injection attempts

We'll cover common defenses.

---

# 1. CORS

## What is CORS?

**CORS = Cross-Origin Resource Sharing**

### Key Concept: Origin

An **origin** is made up of:

```
Protocol + Domain + Port
```

Example:

| URL                                              | Origin                                         |
| ------------------------------------------------ | ---------------------------------------------- |
| [http://localhost:3000](http://localhost:3000)   | [http://localhost:3000](http://localhost:3000) |
| [http://localhost:5000](http://localhost:5000)   | Different (port changed)                       |
| [https://localhost:3000](https://localhost:3000) | Different (protocol changed)                   |
| [https://myapp.com](https://myapp.com)           | Different (domain changed)                     |

Even changing **one** part creates a different origin.

---

## Real-world Analogy

Imagine your office only allows employees with company ID cards.

Your backend is the office.

The browser checks:

> "Is this website allowed to talk to this server?"

---

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:3000
```

Different origins.

Browser blocks by default unless backend allows it.

---

Install

```bash
npm install cors
```

Use

```javascript
const cors = require("cors");

app.use(cors());
```

This allows all origins (fine for development, not for most production apps).

Better:

```javascript
app.use(cors({
    origin: "http://localhost:5173"
}));
```

Now only that frontend can make browser-based requests.

> **Note:** CORS is enforced by browsers. It is **not** an authentication mechanism.

---

# 2. Helmet

## What is Helmet?

Helmet adds security-related HTTP headers automatically.

Think of it as installing stronger locks on your house.

Install

```bash
npm install helmet
```

Use

```javascript
const helmet = require("helmet");

app.use(helmet());
```

Helmet sets headers such as:

```
X-Content-Type-Options
Content-Security-Policy
Cross-Origin-Resource-Policy
```

These headers help reduce risks like clickjacking, MIME-type sniffing, and some XSS scenarios.

---

# 3. Rate Limiting

## Problem

Attacker tries:

```
POST /login

1000 requests per minute
```

Trying many passwords.

This is called a **brute-force attack**.

---

## Solution

Allow only a limited number of requests.

Install

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 100

});

app.use(limiter);
```

Meaning:

```
100 requests

every

15 minutes

per client IP
```

The 101st request receives a `429 Too Many Requests` response.

For login endpoints, you might use an even stricter limit.

---

# 4. Input Sanitization

## Why?

Suppose a user submits:

```text
<script>alert("Hacked")</script>
```

If your application later renders that as HTML without escaping, it could execute in a browser (an XSS attack).

Or someone sends unexpected operators to try to manipulate a database query.

---

## First Line of Defense

Validate inputs:

```javascript
if (typeof name !== "string") {
    return res.status(400).send("Invalid name");
}
```

Trim input:

```javascript
const name = req.body.name.trim();
```

Limit length:

```javascript
if (name.length > 100) {
    return res.status(400).send("Name too long");
}
```

Prefer **parameterized queries** (SQL) or safe query construction (NoSQL) instead of building queries from raw user input.

Libraries such as `express-validator` can validate and sanitize many common input types.

---

# Putting It All Together

A common Express application setup might look like:

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(express.json());

app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(logger);

app.post(
    "/register",
    auth,
    validateUser,
    (req, res) => {
        res.send("User Registered");
    }
);
```

Flow:

```
Client
   │
   ▼
Helmet
   │
   ▼
CORS
   │
   ▼
Rate Limiter
   │
   ▼
Logger
   │
   ▼
Authentication
   │
   ▼
Validation
   │
   ▼
Controller
   │
   ▼
Response
```

# Interview Questions

1. What is middleware in Express, and why is it useful?
2. What are the roles of `req`, `res`, and `next`?
3. What happens if `next()` is never called?
4. What's the difference between application-level middleware (`app.use`) and route-level middleware?
5. Is CORS a security feature or an access-control policy enforced by browsers?
6. Why is Helmet recommended in production?
7. How does rate limiting help protect APIs?
8. Why should input validation happen before business logic?
9. Why is middleware order important?
10. Can one request pass through multiple middleware functions before reaching a route handler?

---

### Next lesson (recommended)

The natural next topic is **JWT Authentication (JSON Web Tokens)**, where you'll learn:

* Sessions vs JWT
* What a token actually contains
* Signing vs encryption
* Login flow
* Refresh tokens
* Protecting routes with JWT middleware
* Role-based authorization (Admin, Teacher, Student)
* Best security practices used in production APIs

This builds directly on the authentication middleware you've just learned.
