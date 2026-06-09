# 🚀 Node.js API Development: Zero to Job-Ready

> **Who is this for?** Complete beginners to experienced developers who want to master Node.js for backend/API development. Every concept includes real-world context, working code, and interview-ready explanations.

---

## 📋 Table of Contents

1. [What is Node.js & Why It Matters](#1-what-is-nodejs--why-it-matters)
2. [Environment Setup & Your First Server](#2-environment-setup--your-first-server)
3. [Core Modules Deep Dive](#3-core-modules-deep-dive)
4. [Asynchronous JavaScript Mastery](#4-asynchronous-javascript-mastery)
5. [Express.js — The Industry Standard](#5-expressjs--the-industry-standard)
6. [RESTful API Design & Best Practices](#6-restful-api-design--best-practices)
7. [Middleware — The Backbone of Express](#7-middleware--the-backbone-of-express)
8. [Database Integration](#8-database-integration)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Error Handling & Logging](#10-error-handling--logging)
11. [File Uploads & Static Files](#11-file-uploads--static-files)
12. [Real-Time APIs with WebSockets](#12-real-time-apis-with-websockets)
13. [Caching Strategies](#13-caching-strategies)
14. [API Security](#14-api-security)
15. [Testing Your APIs](#15-testing-your-apis)
16. [Performance & Scalability](#16-performance--scalability)
17. [Deployment & DevOps](#17-deployment--devops)
18. [Advanced Patterns](#18-advanced-patterns)
19. [Top Interview Questions & Answers](#19-top-interview-questions--answers)
20. [Complete Project: Production-Ready REST API](#20-complete-project-production-ready-rest-api)

---

## 1. What is Node.js & Why It Matters

### The Big Picture

Node.js is a **JavaScript runtime** built on Chrome's V8 engine that lets you run JavaScript _outside_ the browser — on a server. Before Node.js, JavaScript was browser-only. Now one language runs everywhere.

```
Browser (JavaScript) → Chrome V8 Engine → Renders UI
Server  (JavaScript) → Node.js + V8     → Handles HTTP, Files, DB
```

### Why Companies Love Node.js

| Feature                    | What It Means                                 |
| -------------------------- | --------------------------------------------- |
| **Non-blocking I/O**       | Handles thousands of requests without waiting |
| **Single Language**        | Frontend + Backend = same JS team             |
| **NPM Ecosystem**          | 2M+ packages available instantly              |
| **Microservices-friendly** | Lightweight, fast startup                     |
| **Real-time capable**      | WebSockets, SSE built naturally               |

### Real-World Companies Using Node.js

- **Netflix** — Reduced startup time by 70% after switching to Node.js
- **LinkedIn** — Mobile backend reduced from 30 servers to 3
- **Uber** — Handles millions of concurrent connections
- **PayPal** — Built APIs 2x faster, 35% faster response times

### The Event Loop — Heart of Node.js

This is the most important concept. Node.js is **single-threaded** but handles concurrency through an event loop.

```
┌─────────────────────────────────┐
│           Your Code             │
│         (Call Stack)            │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│          Node.js APIs           │
│  (fs, http, setTimeout, etc.)   │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│         Event Queue             │
│  [callback1, callback2, ...]    │
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│          Event Loop             │
│  "Is call stack empty? Run next"│
└─────────────────────────────────┘
```

```javascript
// This demonstrates the event loop behavior
console.log("1 - Start"); // Runs immediately (call stack)

setTimeout(() => {
  console.log("3 - Timeout"); // Runs after call stack is empty
}, 0);

console.log("2 - End"); // Runs immediately (call stack)

// Output:
// 1 - Start
// 2 - End
// 3 - Timeout  ← Even with 0ms delay!
```

> 💡 **Interview Insight**: "Node.js is single-threaded but achieves concurrency through its event-driven, non-blocking I/O model. The event loop continuously checks if the call stack is empty and picks up callbacks from the queue."

---

## 2. Environment Setup & Your First Server

### Installation

```bash
# Option 1: Direct download
# Visit https://nodejs.org → Download LTS version

# Option 2: NVM (Recommended for developers)
# NVM lets you switch Node.js versions easily
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

nvm install 20          # Install Node 20 LTS
nvm use 20              # Use it
nvm alias default 20    # Set as default

# Verify installation
node --version   # v20.x.x
npm --version    # 10.x.x
```

### Project Setup

```bash
mkdir my-api && cd my-api

npm init -y     # Creates package.json with defaults

# package.json controls your entire project
cat package.json
```

```json
{
  "name": "my-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js", // Auto-restart on file change
    "test": "jest"
  },
  "dependencies": {},
  "devDependencies": {}
}
```

```bash
# Install essential dev tools
npm install nodemon --save-dev     # Auto-restart server
npm install express                # Web framework
npm install dotenv                 # Environment variables
```

### Your First HTTP Server (Raw Node.js)

```javascript
// server.js — Understanding the fundamentals before Express
const http = require("http");

const server = http.createServer((req, res) => {
  // req = incoming request data
  // res = what we send back

  console.log(`${req.method} ${req.url}`);

  // Route handling
  if (req.url === "/api/hello" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        success: true,
        message: "Hello, World!",
        timestamp: new Date().toISOString(),
      }),
    );
  } else if (req.url === "/api/users" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const user = JSON.parse(body);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, user }));
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Not Found" }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

```bash
# Test it
node server.js
curl http://localhost:3000/api/hello
```

> 💡 **Why learn raw http before Express?** Because Express is built on top of this. Understanding the foundation makes you a better developer and helps in debugging.

---

## 3. Core Modules Deep Dive

Node.js ships with built-in modules — no installation needed.

### 3.1 `fs` Module — File System

```javascript
const fs = require("fs");
const fsPromises = require("fs/promises"); // Modern Promise-based

// ─────────────────────────────────────────
// READING FILES
// ─────────────────────────────────────────

// ❌ Synchronous (BLOCKS the event loop — never in production!)
const data = fs.readFileSync("./config.json", "utf8");

// ✅ Callback style (older but still used)
fs.readFile("./config.json", "utf8", (err, data) => {
  if (err) throw err;
  console.log(JSON.parse(data));
});

// ✅ Promise style (modern, preferred)
async function readConfig() {
  try {
    const data = await fsPromises.readFile("./config.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read config:", error.message);
  }
}

// ─────────────────────────────────────────
// WRITING FILES
// ─────────────────────────────────────────

async function writeLog(message) {
  const log = {
    timestamp: new Date().toISOString(),
    message,
  };
  await fsPromises.appendFile("./app.log", JSON.stringify(log) + "\n");
}

// ─────────────────────────────────────────
// WATCHING FILES (Real-world: hot reload, config changes)
// ─────────────────────────────────────────

fs.watch("./config.json", (eventType, filename) => {
  console.log(`Config changed! Event: ${eventType}`);
  // Reload configuration here
});
```

**Real-world use case**: Reading environment-specific config files, writing application logs, serving static files.

### 3.2 `path` Module — File Paths

```javascript
const path = require("path");

// ─────────────────────────────────────────
// CRITICAL: Always use path.join() for cross-platform compatibility
// ─────────────────────────────────────────

// ❌ BAD: Platform-specific (breaks on Windows)
const badPath = __dirname + "/uploads/" + filename;

// ✅ GOOD: Works on Windows, Mac, Linux
const goodPath = path.join(__dirname, "uploads", filename);

// Common patterns
const uploadsDir = path.join(__dirname, "..", "uploads");
const ext = path.extname("photo.jpg"); // '.jpg'
const name = path.basename("photo.jpg"); // 'photo.jpg'
const dir = path.dirname("/home/user/file"); // '/home/user'

// Resolving paths (makes absolute)
const absPath = path.resolve("uploads", "images"); // /full/path/uploads/images

// Real-world: serving files
app.get("/download/:file", (req, res) => {
  const filePath = path.join(__dirname, "downloads", req.params.file);
  res.sendFile(filePath);
});
```

### 3.3 `os` Module — Operating System Info

```javascript
const os = require("os");

// Useful for monitoring and health checks
function getSystemHealth() {
  return {
    platform: os.platform(), // 'linux', 'darwin', 'win32'
    arch: os.arch(), // 'x64', 'arm64'
    cpus: os.cpus().length, // Number of CPU cores
    totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    uptime: `${(os.uptime() / 3600).toFixed(2)} hours`,
    hostname: os.hostname(),
  };
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    system: getSystemHealth(),
    nodeVersion: process.version,
  });
});
```

### 3.4 `events` Module — Event Emitter Pattern

```javascript
const EventEmitter = require("events");

// Real-world: Building a notification system
class NotificationService extends EventEmitter {
  sendEmail(user, message) {
    // Simulate email sending
    console.log(`Sending email to ${user.email}: ${message}`);
    this.emit("email:sent", { user, message, timestamp: new Date() });
  }

  sendSMS(user, message) {
    console.log(`Sending SMS to ${user.phone}: ${message}`);
    this.emit("sms:sent", { user, message, timestamp: new Date() });
  }
}

const notifier = new NotificationService();

// Listen for events
notifier.on("email:sent", (data) => {
  console.log("Log: Email sent to", data.user.email);
  // Save to database, analytics, etc.
});

notifier.on("email:sent", (data) => {
  // Multiple listeners for same event
  updateUserNotificationHistory(data);
});

// Usage
notifier.sendEmail({ email: "john@example.com" }, "Welcome to our platform!");
```

### 3.5 `stream` Module — Handling Large Data

```javascript
const fs = require("fs");
const zlib = require("zlib");
const { pipeline } = require("stream/promises");

// ─────────────────────────────────────────
// WHY STREAMS?
// Without streams: Read entire file into memory → Crash on large files
// With streams: Read chunk by chunk → Handle files of any size
// ─────────────────────────────────────────

// Real-world: Compress and serve large files
app.get("/download/large-file", async (req, res) => {
  const readStream = fs.createReadStream("./large-dataset.csv");
  const gzip = zlib.createGzip();

  res.setHeader("Content-Encoding", "gzip");
  res.setHeader("Content-Type", "text/csv");

  // Pipeline handles errors and cleanup automatically
  await pipeline(readStream, gzip, res);
});

// Real-world: Process large CSV uploads
app.post("/import/users", async (req, res) => {
  const results = [];

  req
    .pipe(csv())
    .on("data", (row) => results.push(row))
    .on("end", async () => {
      await User.insertMany(results);
      res.json({ imported: results.length });
    });
});
```

---

## 4. Asynchronous JavaScript Mastery

This is where many developers struggle. Master this, and you'll stand out.

### 4.1 Callbacks (The Foundation)

```javascript
// Callbacks — the original async pattern
function fetchUserFromDB(userId, callback) {
  // Simulating database call
  setTimeout(() => {
    const user = { id: userId, name: "John" };
    callback(null, user); // Convention: (error, result)
  }, 100);
}

// Usage
fetchUserFromDB(1, (error, user) => {
  if (error) {
    console.error("Failed:", error);
    return;
  }
  console.log("Got user:", user);
});

// ─────────────────────────────────────────
// CALLBACK HELL — The Problem
// ─────────────────────────────────────────
fetchUser(userId, (err, user) => {
  if (err) return handleError(err);
  fetchOrders(user.id, (err, orders) => {
    // Nested!
    if (err) return handleError(err);
    fetchPayments(orders[0].id, (err, payments) => {
      // More nesting!
      if (err) return handleError(err);
      // Can you even read this? 😵
      processPayments(payments, (err, result) => {
        if (err) return handleError(err);
        res.json(result);
      });
    });
  });
});
```

### 4.2 Promises — Solving Callback Hell

```javascript
// Promises chain instead of nest
function fetchUserFromDB(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error("userId is required"));
        return;
      }
      resolve({ id: userId, name: "John" });
    }, 100);
  });
}

// Promise chaining — reads top to bottom
fetchUser(userId)
  .then((user) => fetchOrders(user.id))
  .then((orders) => fetchPayments(orders[0].id))
  .then((payments) => processPayments(payments))
  .then((result) => res.json(result))
  .catch((error) => res.status(500).json({ error: error.message }));

// ─────────────────────────────────────────
// PROMISE COMBINATORS — Powerful tools
// ─────────────────────────────────────────

// Promise.all — Run in parallel, wait for ALL
const [user, products, cart] = await Promise.all([
  fetchUser(userId),
  fetchProducts(),
  fetchCart(userId),
]);
// All 3 run simultaneously! 3x faster than sequential.

// Promise.allSettled — Get results even if some fail
const results = await Promise.allSettled([
  fetchUser(1),
  fetchUser(2),
  fetchUser(99999), // This might fail
]);

results.forEach((result) => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failed:", result.reason.message);
  }
});

// Promise.race — First one to finish wins (timeouts!)
const data = await Promise.race([
  fetchFromDB(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000),
  ),
]);

// Promise.any — First SUCCESS wins (fallback APIs)
const data = await Promise.any([
  fetchFromPrimaryAPI(),
  fetchFromBackupAPI(),
  fetchFromCacheAPI(),
]);
```

### 4.3 Async/Await — The Modern Standard

```javascript
// Async/Await makes async code look synchronous
async function getUserDashboard(userId) {
  try {
    // Sequential (when order matters)
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Parallel (when order doesn't matter)
    const [orders, notifications, preferences] = await Promise.all([
      Order.findByUser(userId),
      Notification.findUnread(userId),
      Preferences.findByUser(userId),
    ]);

    return {
      user,
      orders,
      notifications,
      preferences,
    };
  } catch (error) {
    // Clean error handling
    throw new ApiError(500, "Failed to load dashboard", error);
  }
}

// ─────────────────────────────────────────
// COMMON MISTAKES TO AVOID
// ─────────────────────────────────────────

// ❌ MISTAKE 1: await inside forEach (doesn't work!)
const userIds = [1, 2, 3];
userIds.forEach(async (id) => {
  const user = await fetchUser(id); // This doesn't wait!
  console.log(user);
});

// ✅ FIX: Use for...of or Promise.all
for (const id of userIds) {
  const user = await fetchUser(id); // Sequential
  console.log(user);
}

// Or parallel:
const users = await Promise.all(userIds.map((id) => fetchUser(id)));

// ❌ MISTAKE 2: Forgetting error handling
async function riskyOperation() {
  const data = await fetch("https://api.example.com"); // Can throw!
  return data.json();
}

// ✅ FIX: Always wrap in try/catch
async function safeOperation() {
  try {
    const response = await fetch("https://api.example.com");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    logger.error("API call failed:", error);
    throw error; // Re-throw or handle appropriately
  }
}

// ❌ MISTAKE 3: Sequential when parallel is possible
async function slowDashboard(userId) {
  const user = await fetchUser(userId); // 100ms
  const orders = await fetchOrders(userId); // 100ms
  const posts = await fetchPosts(userId); // 100ms
  // Total: 300ms 😢
}

// ✅ FIX: Parallel execution
async function fastDashboard(userId) {
  const [user, orders, posts] = await Promise.all([
    fetchUser(userId), // ┐
    fetchOrders(userId), // ├── All run at the same time!
    fetchPosts(userId), // ┘
  ]);
  // Total: ~100ms 🚀
}
```

### 4.4 Error Handling Patterns for Async

```javascript
// Pattern 1: Wrapper utility (eliminates try/catch repetition)
async function to(promise) {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}

// Usage — cleaner than try/catch everywhere
const [error, user] = await to(User.findById(userId));
if (error) return res.status(500).json({ error: error.message });

const [orderError, orders] = await to(Order.findByUser(user.id));
if (orderError) return res.status(500).json({ error: orderError.message });

// Pattern 2: Async route wrapper (Express-specific)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes
router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    // Any error automatically goes to error middleware!
    res.json(user);
  }),
);
```

---

## 5. Express.js — The Industry Standard

Express is used by 99% of Node.js APIs. It's minimal but incredibly powerful with middleware.

### 5.1 Basic Express Setup

```javascript
// app.js — Well-structured Express application
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// ─────────────────────────────────────────
// ESSENTIAL MIDDLEWARE
// ─────────────────────────────────────────
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(morgan("combined")); // HTTP logging

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/products", require("./routes/products"));
app.use("/api/v1/orders", require("./routes/orders"));

// Health check (no version — stays stable)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler (must have 4 params)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
```

```javascript
// index.js — Server entry point (separate from app for testing)
require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});
```

### 5.2 Express Router — Organizing Routes

```javascript
// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");
const { validateUser } = require("../middleware/validators");

// Public routes
router.post("/register", validateUser, userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);

// Protected routes (require authentication)
router.use(authenticate); // All routes below need auth

router.get("/me", userController.getProfile);
router.put("/me", validateUser, userController.updateProfile);
router.delete("/me", userController.deleteAccount);

// Admin routes
router.get("/", authorize("admin"), userController.getAllUsers);
router.get("/:id", authorize("admin"), userController.getUserById);
router.delete("/:id", authorize("admin"), userController.deleteUser);

module.exports = router;
```

### 5.3 Express Request Object — Everything Available

```javascript
app.post("/api/example/:id", (req, res) => {
  // URL parameters  → /api/example/123
  console.log(req.params.id); // "123"

  // Query string    → ?page=2&limit=10&sort=name
  console.log(req.query.page); // "2"
  console.log(req.query.limit); // "10"
  console.log(req.query.sort); // "name"

  // Request body    → JSON or form data
  console.log(req.body.name); // From JSON body

  // Headers
  console.log(req.headers.authorization); // "Bearer token123"
  console.log(req.get("Content-Type")); // "application/json"

  // IP Address
  console.log(req.ip); // "192.168.1.1"
  console.log(req.ips); // ["proxy-ip", "client-ip"] (if behind proxy)

  // Route info
  console.log(req.path); // "/api/example/123"
  console.log(req.method); // "POST"
  console.log(req.hostname); // "api.example.com"
  console.log(req.protocol); // "https"
  console.log(req.secure); // true/false

  // Custom data from middleware
  console.log(req.user); // Set by auth middleware

  res.json({ received: true });
});
```

---

## 6. RESTful API Design & Best Practices

### 6.1 REST Principles

```
REST = Representational State Transfer

Resources are NOUNS, HTTP Methods are VERBS

Bad:  GET /getUsers
      POST /createUser
      GET /deleteUser/1

Good: GET    /users           → List all users
      POST   /users           → Create a user
      GET    /users/:id       → Get one user
      PUT    /users/:id       → Replace user completely
      PATCH  /users/:id       → Update user partially
      DELETE /users/:id       → Delete user
```

### 6.2 Resource Naming Conventions

```
✅ Plural nouns:    /users, /products, /orders
✅ Lowercase:       /user-profiles  (not /userProfiles)
✅ Nested:          /users/:id/orders   (user's orders)
✅ Versioned:       /api/v1/users

❌ Verbs:           /getUsers, /createProduct
❌ Mixed case:      /userProfiles
❌ Deep nesting:    /users/1/orders/2/items/3/reviews  (keep to 2-3 levels)
```

### 6.3 HTTP Status Codes — Know These Cold

```javascript
// Success codes
200; // OK — GET, PUT, PATCH success
201; // Created — POST success (resource created)
204; // No Content — DELETE success (nothing to return)

// Client error codes
400; // Bad Request — Invalid input, malformed JSON
401; // Unauthorized — Not logged in
403; // Forbidden — Logged in but no permission
404; // Not Found — Resource doesn't exist
409; // Conflict — Duplicate email, username taken
422; // Unprocessable Entity — Validation failed
429; // Too Many Requests — Rate limit exceeded

// Server error codes
500; // Internal Server Error — Bug in your code
502; // Bad Gateway — Upstream service failed
503; // Service Unavailable — Server overloaded/maintenance
```

### 6.4 Consistent API Response Format

```javascript
// Always use consistent response structure — every API in your company
// should look the same. This makes frontend development much easier.

// ─────────────────────────────────────────
// SUCCESS RESPONSE
// ─────────────────────────────────────────
{
  "success": true,
  "data": {
    "user": {
      "id": "64abc123",
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}

// ─────────────────────────────────────────
// PAGINATED LIST RESPONSE
// ─────────────────────────────────────────
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}

// ─────────────────────────────────────────
// ERROR RESPONSE
// ─────────────────────────────────────────
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Must be a valid email address" },
      { "field": "password", "message": "Must be at least 8 characters" }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

```javascript
// utils/response.js — Response helper
class ApiResponse {
  static success(res, data, statusCode = 200, message = "Success") {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    });
  }

  static error(res, message, statusCode = 500, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    });
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination,
      meta: { timestamp: new Date().toISOString() },
    });
  }
}

// Usage in controller
const getUsers = async (req, res) => {
  const users = await User.findAll();
  return ApiResponse.success(res, { users });
};
```

### 6.5 Pagination, Filtering & Sorting

```javascript
// controllers/productController.js
const getProducts = async (req, res) => {
  // ─────────────────────────────────────────
  // PAGINATION
  // ─────────────────────────────────────────
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Cap at 100
  const skip = (page - 1) * limit;

  // ─────────────────────────────────────────
  // FILTERING
  // /products?category=electronics&minPrice=100&maxPrice=1000&inStock=true
  // ─────────────────────────────────────────
  const filter = {};

  if (req.query.category) filter.category = req.query.category;
  if (req.query.inStock === "true") filter.stock = { $gt: 0 };
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }
  if (req.query.search) {
    filter.$text = { $search: req.query.search }; // Full-text search
  }

  // ─────────────────────────────────────────
  // SORTING
  // /products?sort=-price,name  (- = descending)
  // ─────────────────────────────────────────
  let sort = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(",");
    sortFields.forEach((field) => {
      if (field.startsWith("-")) {
        sort[field.substring(1)] = -1; // Descending
      } else {
        sort[field] = 1; // Ascending
      }
    });
  } else {
    sort = { createdAt: -1 }; // Default: newest first
  }

  // ─────────────────────────────────────────
  // FIELD SELECTION
  // /products?fields=name,price,category
  // ─────────────────────────────────────────
  let select = "";
  if (req.query.fields) {
    select = req.query.fields.split(",").join(" ");
  }

  // Execute query
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // .lean() returns plain JS objects, not Mongoose docs (faster)
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return ApiResponse.paginated(
    res,
    { products },
    {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  );
};
```

---

## 7. Middleware — The Backbone of Express

Middleware functions are functions that have access to `req`, `res`, and `next`. They form a pipeline.

```
Request → Middleware1 → Middleware2 → Middleware3 → Route Handler → Response
```

### 7.1 Understanding Middleware

```javascript
// A middleware is just a function with (req, res, next)
function myMiddleware(req, res, next) {
  // Do something with request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  // MUST call next() or send a response
  // Without next() → request hangs forever!
  next();

  // OR send response
  // res.json({ error: 'Not authorized' });
}

// Apply globally
app.use(myMiddleware);

// Apply to specific routes
app.get("/protected", myMiddleware, routeHandler);

// Apply to router
router.use(myMiddleware);
```

### 7.2 Essential Middleware You'll Build

```javascript
// ─────────────────────────────────────────
// 1. REQUEST LOGGER
// ─────────────────────────────────────────
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Intercept response to log status code
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 400) {
      console.error(JSON.stringify(logData));
    } else {
      console.log(JSON.stringify(logData));
    }
  });

  next();
};

// ─────────────────────────────────────────
// 2. REQUEST ID (for tracing requests)
// ─────────────────────────────────────────
const { v4: uuidv4 } = require("uuid");

const requestId = (req, res, next) => {
  req.id = req.headers["x-request-id"] || uuidv4();
  res.setHeader("X-Request-ID", req.id);
  res.locals.requestId = req.id;
  next();
};

// ─────────────────────────────────────────
// 3. RATE LIMITING
// ─────────────────────────────────────────
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again in 15 minutes.",
    },
  },
  standardHeaders: true, // Send rate limit info in headers
  legacyHeaders: false,

  // Custom key generator (rate limit by user ID if authenticated)
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
});

// Strict limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Only 10 login attempts per hour
  message: {
    success: false,
    error: { message: "Too many login attempts. Account temporarily locked." },
  },
});

app.use("/api/", apiLimiter);
app.use("/api/v1/auth/login", authLimiter);

// ─────────────────────────────────────────
// 4. RESPONSE TIME HEADER
// ─────────────────────────────────────────
const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    res.setHeader("X-Response-Time", `${durationMs.toFixed(2)}ms`);
  });

  next();
};

// ─────────────────────────────────────────
// 5. CORS MIDDLEWARE (manual implementation)
// ─────────────────────────────────────────
const corsMiddleware = (req, res, next) => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Request-ID",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours preflight cache

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
};
```

### 7.3 Validation Middleware

```javascript
// middleware/validators.js — Using express-validator
const { body, param, query, validationResult } = require("express-validator");

// ─────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error("Email already registered");
    }),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and number"),

  body("phone").optional().isMobilePhone().withMessage("Invalid phone number"),

  // Handle validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input data",
          details: errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
          })),
        },
      });
    }
    next();
  },
];

const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be 1-100"),
  handleValidationErrors,
];

// Reusable error handler
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        details: errors.array(),
      },
    });
  }
  next();
}

module.exports = { validateRegister, validatePagination };
```

---

## 8. Database Integration

### 8.1 MongoDB with Mongoose

```bash
npm install mongoose
```

```javascript
// config/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options optimize connection pooling
      maxPoolSize: 10, // Max 10 connections in pool
      serverSelectionTimeoutMS: 5000, // 5s to find server
      socketTimeoutMS: 45000, // 45s timeout
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Reconnecting...");
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Exit — app can't run without DB
  }
};

module.exports = connectDB;
```

```javascript
// models/User.js — Mongoose Schema
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default!
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: String,
    isEmailVerified: { type: Boolean, default: false },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: Date,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: {
      virtuals: true, // Include virtual properties
      transform: (doc, ret) => {
        delete ret.password; // Never send password in JSON
        delete ret.__v; // Remove Mongoose version key
        return ret;
      },
    },
  },
);

// ─────────────────────────────────────────
// INDEXES — Critical for performance
// ─────────────────────────────────────────
userSchema.index({ email: 1 }); // Unique email lookup
userSchema.index({ role: 1, isActive: 1 }); // Admin queries
userSchema.index({ createdAt: -1 }); // Recent users

// ─────────────────────────────────────────
// VIRTUAL PROPERTIES
// ─────────────────────────────────────────
userSchema.virtual("profileUrl").get(function () {
  return `/users/${this._id}`;
});

// ─────────────────────────────────────────
// MIDDLEWARE (hooks)
// ─────────────────────────────────────────

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Update lastLogin on find (simulate)
userSchema.pre(/^find/, function (next) {
  this.find({ isActive: { $ne: false } }); // Exclude inactive users
  next();
});

// ─────────────────────────────────────────
// INSTANCE METHODS
// ─────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken; // Return unhashed (send to email)
};

// ─────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() }).select("+password");
};

const User = mongoose.model("User", userSchema);
module.exports = User;
```

### 8.2 PostgreSQL with Prisma (Modern ORM)

```bash
npm install prisma @prisma/client
npx prisma init
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(USER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orders        Order[]
  profile       Profile?

  @@index([email])
  @@index([role, isActive])
}

model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Decimal     @db.Decimal(10, 2)
  stock       Int         @default(0)
  category    Category    @relation(fields: [categoryId], references: [id])
  categoryId  String
  orderItems  OrderItem[]
  createdAt   DateTime    @default(now())

  @@index([categoryId])
}

model Order {
  id        String      @id @default(cuid())
  user      User        @relation(fields: [userId], references: [id])
  userId    String
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)
  items     OrderItem[]
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

enum Role {
  USER
  ADMIN
  MODERATOR
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

```javascript
// config/prisma.js — Singleton pattern for Prisma
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  errorFormat: "pretty",
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
```

```javascript
// Usage in controllers — Prisma examples
const prisma = require("../config/prisma");

// Complex query with Prisma
const getOrdersWithDetails = async (userId) => {
  return prisma.order.findMany({
    where: {
      userId,
      status: { not: "CANCELLED" },
    },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    skip: 0,
  });
};

// Transaction example
const createOrderWithItems = async (userId, cartItems) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create the order
    const order = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        total: 0,
      },
    });

    // 2. Create order items
    const items = await Promise.all(
      cartItems.map((item) =>
        tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        }),
      ),
    );

    // 3. Update stock (decrement)
    await Promise.all(
      cartItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        }),
      ),
    );

    // 4. Calculate and update total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return tx.order.update({
      where: { id: order.id },
      data: { total },
    });
  });
};
```

---

## 9. Authentication & Authorization

### 9.1 JWT Authentication — Complete Implementation

```bash
npm install jsonwebtoken bcryptjs
```

```javascript
// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: "Email already registered" },
      });
    }

    // Create user (password hashed in pre-save hook)
    const user = await User.create({ name, email, password });

    // Generate token
    const token = user.generateAuthToken();

    // Send verification email (async, don't wait)
    emailService.sendVerification(user).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: "Email and password are required" },
      });
    }

    // Get user WITH password (select: false hides it normally)
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      // Same error for both cases — don't reveal which is wrong
      return res.status(401).json({
        success: false,
        error: { message: "Invalid email or password" },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: { message: "Account has been deactivated. Contact support." },
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.generateAuthToken();

    // Set HTTP-only cookie (more secure than localStorage)
    res.cookie("token", token, {
      httpOnly: true, // Can't be accessed by JavaScript
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "strict", // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        token, // Also send in body for mobile apps
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
};

// ─────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────
const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) throw new Error("User not found");

    const newAccessToken = user.generateAuthToken();
    res.json({ success: true, data: { token: newAccessToken } });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, error: { message: "Invalid refresh token" } });
  }
};

module.exports = { register, login, logout, refreshToken };
```

### 9.2 Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { promisify } = require("util");

// ─────────────────────────────────────────
// AUTHENTICATION — Who are you?
// ─────────────────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated. Please log in." },
      });
    }

    // Verify token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: "User no longer exists" },
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: "Account has been deactivated" },
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, error: { message: "Invalid token" } });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Token expired. Please log in again." },
        });
    }
    next(error);
  }
};

// ─────────────────────────────────────────
// AUTHORIZATION — Do you have permission?
// ─────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Role '${req.user.role}' is not authorized for this action`,
        },
      });
    }
    next();
  };
};

// ─────────────────────────────────────────
// OPTIONAL AUTH — Enhances response if logged in
// ─────────────────────────────────────────
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch {} // Silently ignore errors
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
```

---

## 10. Error Handling & Logging

### 10.1 Custom Error Classes

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = []) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Not authenticated") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Not authorized") {
    super(message, 403, "FORBIDDEN");
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, "CONFLICT");
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
```

### 10.2 Global Error Handler

```javascript
// middleware/errorHandler.js
const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");

const handleMongoError = (err) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(`${field} already exists`, 409, "CONFLICT");
  }
  return err;
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Token expired. Please log in again.", 401);

const handleValidationError = (err) => {
  const details = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError("Validation failed", 422, "VALIDATION_ERROR", details);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Transform known error types
  if (err.name === "MongoServerError") error = handleMongoError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (err.name === "ValidationError") error = handleValidationError(err);

  // Log error
  if (!error.isOperational) {
    logger.error({
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.user?.id,
    });
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.isOperational ? error.message : "Something went wrong",
      ...(error.details && { details: error.details }),
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
      }),
    },
    meta: {
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = errorHandler;
```

### 10.3 Structured Logging with Winston

```javascript
// utils/logger.js
const winston = require("winston");

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const developmentFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...metadata }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) log += `\n${stack}`;
    if (Object.keys(metadata).length)
      log += `\n${JSON.stringify(metadata, null, 2)}`;
    return log;
  }),
);

const productionFormat = combine(timestamp(), errors({ stack: true }), json());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format:
    process.env.NODE_ENV === "production"
      ? productionFormat
      : developmentFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
  ],
});

// Add request context
logger.request = (req, message, meta = {}) => {
  logger.info(message, {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    ...meta,
  });
};

module.exports = logger;
```

---

## 11. File Uploads & Static Files

```javascript
// middleware/upload.js
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");

// ─────────────────────────────────────────
// LOCAL STORAGE
// ─────────────────────────────────────────
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(
      __dirname,
      "..",
      "uploads",
      file.mimetype.split("/")[0],
    );
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ─────────────────────────────────────────
// MEMORY STORAGE (for cloud upload or processing)
// ─────────────────────────────────────────
const memoryStorage = multer.memoryStorage();

// File filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new AppError("Only JPEG, PNG, and WebP images are allowed", 400),
      false,
    );
  }
  cb(null, true);
};

const documentFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "application/msword"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new AppError("Only PDF and Word documents are allowed", 400),
      false,
    );
  }
  cb(null, true);
};

// Upload configurations
const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

const uploadDocument = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter,
});

// ─────────────────────────────────────────
// CLOUDINARY UPLOAD WITH IMAGE PROCESSING
// ─────────────────────────────────────────
const processAndUploadImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Process image with sharp before upload
    const processedBuffer = await sharp(req.file.buffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "avatars",
          public_id: `user_${req.user.id}`,
          overwrite: true,
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(processedBuffer);
    });

    req.uploadedFile = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      size: result.bytes,
    };

    next();
  } catch (error) {
    next(new AppError("File upload failed", 500));
  }
};

// Routes
router.post(
  "/profile/avatar",
  authenticate,
  uploadImage.single("avatar"),
  processAndUploadImage,
  async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.uploadedFile.url },
      { new: true },
    );
    res.json({ success: true, data: { avatarUrl: user.avatar } });
  },
);
```

---

## 12. Real-Time APIs with WebSockets

### 12.1 Socket.io — Complete Chat Application

```bash
npm install socket.io
```

```javascript
// realtime/socketServer.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ─────────────────────────────────────────
  // AUTHENTICATION MIDDLEWARE
  // ─────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) throw new Error("No token provided");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("name email avatar");

      if (!user) throw new Error("User not found");

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  // Online users map
  const onlineUsers = new Map();

  io.on("connection", async (socket) => {
    console.log(`User ${socket.user.name} connected [${socket.id}]`);

    // Track online users
    onlineUsers.set(socket.user._id.toString(), {
      socketId: socket.id,
      user: socket.user,
      lastSeen: new Date(),
    });

    // Notify others that user is online
    socket.broadcast.emit("user:online", {
      userId: socket.user._id,
      name: socket.user.name,
    });

    // Send online users list to new connection
    socket.emit("users:online", Array.from(onlineUsers.values()));

    // ─────────────────────────────────────────
    // JOIN ROOM
    // ─────────────────────────────────────────
    socket.on("room:join", async (roomId) => {
      socket.join(roomId);

      // Send last 50 messages
      const messages = await Message.find({ roomId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("sender", "name avatar")
        .lean();

      socket.emit("room:history", messages.reverse());
      socket.to(roomId).emit("room:userJoined", {
        user: socket.user,
        roomId,
      });
    });

    // ─────────────────────────────────────────
    // SEND MESSAGE
    // ─────────────────────────────────────────
    socket.on("message:send", async (data) => {
      try {
        const { roomId, content, type = "text" } = data;

        // Save to database
        const message = await Message.create({
          roomId,
          sender: socket.user._id,
          content,
          type,
        });

        const populatedMessage = await message.populate(
          "sender",
          "name avatar",
        );

        // Broadcast to room
        io.to(roomId).emit("message:new", populatedMessage);

        // Delivery confirmation
        socket.emit("message:delivered", {
          tempId: data.tempId, // Client-side temp ID
          messageId: message._id,
        });
      } catch (error) {
        socket.emit("message:error", { message: "Failed to send message" });
      }
    });

    // ─────────────────────────────────────────
    // TYPING INDICATOR
    // ─────────────────────────────────────────
    socket.on("typing:start", ({ roomId }) => {
      socket.to(roomId).emit("typing:user", {
        userId: socket.user._id,
        name: socket.user.name,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ roomId }) => {
      socket.to(roomId).emit("typing:user", {
        userId: socket.user._id,
        isTyping: false,
      });
    });

    // ─────────────────────────────────────────
    // READ RECEIPTS
    // ─────────────────────────────────────────
    socket.on("message:read", async ({ messageId, roomId }) => {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { readBy: socket.user._id },
      });

      io.to(roomId).emit("message:readReceipt", {
        messageId,
        userId: socket.user._id,
      });
    });

    // ─────────────────────────────────────────
    // DISCONNECT
    // ─────────────────────────────────────────
    socket.on("disconnect", () => {
      onlineUsers.delete(socket.user._id.toString());
      io.emit("user:offline", {
        userId: socket.user._id,
        lastSeen: new Date(),
      });
      console.log(`User ${socket.user.name} disconnected`);
    });
  });

  return io;
};

module.exports = initializeSocket;
```

---

## 13. Caching Strategies

### 13.1 Redis Caching

```bash
npm install ioredis
```

```javascript
// config/redis.js
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

module.exports = redis;
```

```javascript
// middleware/cache.js
const redis = require("../config/redis");

// ─────────────────────────────────────────
// CACHE MIDDLEWARE — Cache entire responses
// ─────────────────────────────────────────
const cache =
  (ttlSeconds = 300) =>
  async (req, res, next) => {
    // Don't cache authenticated requests
    if (req.headers.authorization) return next();
    if (req.method !== "GET") return next();

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedResponse = await redis.get(key);

      if (cachedResponse) {
        const parsed = JSON.parse(cachedResponse);
        return res.json({ ...parsed, _cached: true });
      }

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return originalJson(data);
      };

      next();
    } catch (error) {
      // If Redis fails, continue without caching
      console.error("Cache error:", error);
      next();
    }
  };

// ─────────────────────────────────────────
// CACHE SERVICE — Fine-grained control
// ─────────────────────────────────────────
class CacheService {
  static async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  static async set(key, data, ttlSeconds = 300) {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  }

  static async del(key) {
    await redis.del(key);
  }

  static async delPattern(pattern) {
    // Delete all keys matching pattern
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  }

  // Cache-aside pattern
  static async getOrSet(key, fetchFn, ttlSeconds = 300) {
    let data = await this.get(key);

    if (!data) {
      data = await fetchFn();
      await this.set(key, data, ttlSeconds);
    }

    return data;
  }
}

// Usage in controllers
const getProducts = async (req, res) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  const products = await CacheService.getOrSet(
    cacheKey,
    () => Product.find().lean(), // Only called on cache miss
    600, // Cache for 10 minutes
  );

  res.json({ success: true, data: { products } });
};

// Invalidate cache when data changes
const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  // Invalidate all product caches
  await CacheService.delPattern("products:*");
  await CacheService.del(`product:${req.params.id}`);

  res.json({ success: true, data: { product } });
};
```

---

## 14. API Security

### 14.1 Security Checklist & Implementation

```bash
npm install helmet express-rate-limit express-mongo-sanitize xss-clean hpp
```

```javascript
// middleware/security.js — All security in one place
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const applySecurityMiddleware = (app) => {
  // ─────────────────────────────────────────
  // 1. HELMET — Sets security headers
  // ─────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "https:"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // ─────────────────────────────────────────
  // 2. DATA SANITIZATION — Prevent injection
  // ─────────────────────────────────────────

  // Prevent MongoDB injection: { "$gt": "" } → stripped
  app.use(mongoSanitize());

  // Prevent XSS: <script>alert(1)</script> → escaped
  app.use(xss());

  // Prevent HTTP Parameter Pollution: ?sort=price&sort=name → uses last
  app.use(
    hpp({
      whitelist: ["sort", "fields", "category"], // Allow multiple values for these
    }),
  );

  // ─────────────────────────────────────────
  // 3. REQUEST SIZE LIMIT — Prevent DoS
  // ─────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
};

// ─────────────────────────────────────────
// 4. ENVIRONMENT SECURITY
// ─────────────────────────────────────────
// .env file (NEVER commit this!)
/*
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=use-a-very-long-random-string-here-min-32-chars
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
BCRYPT_ROUNDS=12
*/

// Validate environment variables at startup
const requiredEnvVars = ["NODE_ENV", "MONGODB_URI", "JWT_SECRET"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length) {
  console.error("Missing required environment variables:", missingEnvVars);
  process.exit(1);
}
```

### 14.2 Input Validation & Sanitization Patterns

```javascript
// Preventing common vulnerabilities

// ─────────────────────────────────────────
// SQL Injection (if using SQL — use parameterized queries)
// ─────────────────────────────────────────

// ❌ BAD — SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ GOOD — Parameterized query
const query = "SELECT * FROM users WHERE email = $1";
const result = await db.query(query, [email]);

// ─────────────────────────────────────────
// Path Traversal Prevention
// ─────────────────────────────────────────
const path = require("path");

app.get("/files/:filename", (req, res) => {
  const filename = req.params.filename;

  // ❌ BAD — path traversal: ../../etc/passwd
  const badPath = `./uploads/${filename}`;

  // ✅ GOOD — Sanitize and validate
  const safeName = path.basename(filename); // Strips directory components
  const fullPath = path.join(__dirname, "uploads", safeName);
  const uploadsDir = path.join(__dirname, "uploads");

  // Ensure path is within uploads directory
  if (!fullPath.startsWith(uploadsDir)) {
    return res.status(403).json({ error: "Access denied" });
  }

  res.sendFile(fullPath);
});

// ─────────────────────────────────────────
// Mass Assignment Protection
// ─────────────────────────────────────────

// ❌ BAD — User can set any field including 'role'
const user = await User.create(req.body);

// ✅ GOOD — Whitelist allowed fields
const { name, email, password } = req.body;
const user = await User.create({ name, email, password });

// Or use a utility
function pick(obj, keys) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});
}

const allowedFields = pick(req.body, ["name", "email", "password", "phone"]);
const user = await User.create(allowedFields);
```

---

## 15. Testing Your APIs

### 15.1 Unit Testing with Jest

```bash
npm install jest supertest --save-dev
```

```javascript
// tests/unit/userService.test.js
const UserService = require("../../services/userService");
const User = require("../../models/User");

// Mock the database model
jest.mock("../../models/User");

describe("UserService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserById", () => {
    it("should return user when found", async () => {
      const mockUser = { _id: "123", name: "John", email: "john@test.com" };
      User.findById.mockResolvedValue(mockUser);

      const result = await UserService.getUserById("123");

      expect(User.findById).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundError when user not found", async () => {
      User.findById.mockResolvedValue(null);

      await expect(UserService.getUserById("999")).rejects.toThrow(
        "User not found",
      );
    });

    it("should throw error on database failure", async () => {
      User.findById.mockRejectedValue(new Error("DB connection failed"));

      await expect(UserService.getUserById("123")).rejects.toThrow(
        "DB connection failed",
      );
    });
  });

  describe("createUser", () => {
    it("should create and return new user", async () => {
      const userData = {
        name: "Jane",
        email: "jane@test.com",
        password: "Pass123!",
      };
      const savedUser = { _id: "456", ...userData };

      User.create.mockResolvedValue(savedUser);

      const result = await UserService.createUser(userData);
      expect(result).toMatchObject({ name: "Jane", email: "jane@test.com" });
    });

    it("should throw ConflictError on duplicate email", async () => {
      const error = { code: 11000, keyValue: { email: "test@test.com" } };
      User.create.mockRejectedValue(error);

      await expect(
        UserService.createUser({ email: "test@test.com" }),
      ).rejects.toHaveProperty("statusCode", 409);
    });
  });
});
```

### 15.2 Integration Testing with Supertest

```javascript
// tests/integration/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const User = require("../../models/User");

describe("Auth API", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGODB_URI);
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/v1/auth/register", () => {
    const validUser = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPass123!",
    };

    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(validUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // Never returned
    });

    it("should return 422 for invalid email", async () => {
      const response = await request(app)
        .post("/api/v1/auth/register")
        .send({ ...validUser, email: "not-an-email" })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 409 for duplicate email", async () => {
      await User.create(validUser);

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(validUser)
        .expect(409);

      expect(response.body.error.message).toContain("already registered");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      await User.create({
        name: "Existing User",
        email: "exist@example.com",
        password: "Pass123!",
      });
    });

    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "exist@example.com", password: "Pass123!" })
        .expect(200);

      expect(response.body.data.token).toBeDefined();
    });

    it("should return 401 for wrong password", async () => {
      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "exist@example.com", password: "WrongPassword" })
        .expect(401);
    });
  });

  describe("Protected Routes", () => {
    let token;

    beforeEach(async () => {
      const user = await User.create({
        name: "Auth User",
        email: "auth@example.com",
        password: "Pass123!",
      });
      token = user.generateAuthToken();
    });

    it("should access protected route with valid token", async () => {
      await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should return 401 without token", async () => {
      await request(app).get("/api/v1/users/me").expect(401);
    });
  });
});
```

---

## 16. Performance & Scalability

### 16.1 Clustering — Using All CPU Cores

```javascript
// cluster.js — Node.js Cluster Mode
const cluster = require("cluster");
const os = require("os");
const process = require("process");

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Handle worker crashes
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork(); // Replace crashed worker
  });

  // Zero-downtime reload (for production deployments)
  process.on("SIGUSR2", () => {
    const workers = Object.values(cluster.workers);
    const restartWorker = (index) => {
      const worker = workers[index];
      if (!worker) return;

      worker.disconnect(() => {
        cluster.fork().on("listening", () => {
          restartWorker(index + 1);
        });
      });
    };
    restartWorker(0);
  });
} else {
  // Worker process — start Express
  require("./app");
  console.log(`Worker ${process.pid} started`);
}
```

### 16.2 Performance Optimization Patterns

```javascript
// ─────────────────────────────────────────
// 1. DATABASE QUERY OPTIMIZATION
// ─────────────────────────────────────────

// ❌ N+1 Query Problem
const orders = await Order.find({ userId });
for (const order of orders) {
  order.user = await User.findById(order.userId); // N queries!
}

// ✅ Use populate/join
const orders = await Order.find({ userId })
  .populate("userId", "name email") // 1 query!
  .lean(); // Returns plain object (faster)

// ✅ Aggregation for complex queries
const userStats = await Order.aggregate([
  { $match: { status: "completed" } },
  {
    $group: {
      _id: "$userId",
      totalOrders: { $sum: 1 },
      totalRevenue: { $sum: "$total" },
      avgOrderValue: { $avg: "$total" },
    },
  },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },
]);

// ─────────────────────────────────────────
// 2. COMPRESSION
// ─────────────────────────────────────────
const compression = require("compression");

app.use(
  compression({
    level: 6, // Compression level (1-9)
    threshold: 10240, // Only compress responses > 10KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  }),
);

// ─────────────────────────────────────────
// 3. CONNECTION POOLING
// ─────────────────────────────────────────
// MongoDB (Mongoose)
mongoose.connect(uri, {
  maxPoolSize: 10, // Maintain up to 10 connections
  minPoolSize: 2, // At least 2 connections ready
  maxIdleTimeMS: 10000, // Close idle connections after 10s
});

// PostgreSQL (pg)
const { Pool } = require("pg");
const pool = new Pool({
  max: 20,
  min: 4,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ─────────────────────────────────────────
// 4. LAZY LOADING & PAGINATION
// ─────────────────────────────────────────

// Cursor-based pagination (better than offset for large datasets)
const getProductsCursor = async (req, res) => {
  const { cursor, limit = 20 } = req.query;

  const query = cursor
    ? { _id: { $gt: cursor } } // Get records after cursor
    : {};

  const products = await Product.find(query)
    .limit(parseInt(limit) + 1) // Fetch one extra to check hasNext
    .sort({ _id: 1 })
    .lean();

  const hasNext = products.length > limit;
  if (hasNext) products.pop(); // Remove the extra

  res.json({
    success: true,
    data: { products },
    pagination: {
      cursor: products.at(-1)?._id,
      hasNext,
    },
  });
};
```

---

## 17. Deployment & DevOps

### 17.1 Environment Configuration

```bash
# .env.development
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp_dev
JWT_SECRET=dev-secret-not-for-production
LOG_LEVEL=debug

# .env.production
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-long-random-secret-here
LOG_LEVEL=warn
REDIS_URL=redis://...
```

### 17.2 Docker Setup

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Production image
FROM node:20-alpine

WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node healthcheck.js

CMD ["node", "index.js"]
```

```yaml
# docker-compose.yml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api

volumes:
  mongo_data:
```

### 17.3 PM2 — Process Manager for Production

```bash
npm install pm2 -g

# ecosystem.config.js
```

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "my-api",
      script: "./index.js",
      instances: "max", // Use all CPU cores
      exec_mode: "cluster", // Enable cluster mode
      watch: false, // Don't watch in production
      max_memory_restart: "500M",

      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 8080,
      },

      // Logs
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",

      // Restart policy
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
```

```bash
# Commands
pm2 start ecosystem.config.js --env production
pm2 status
pm2 logs my-api
pm2 reload my-api   # Zero-downtime reload
pm2 monit           # Monitor dashboard
pm2 save            # Save current process list
pm2 startup         # Generate startup script
```

---

## 18. Advanced Patterns

### 18.1 Repository Pattern — Clean Architecture

```javascript
// patterns/repository.js

// ─────────────────────────────────────────
// Base Repository — Generic CRUD
// ─────────────────────────────────────────
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, options = {}) {
    const { select, populate } = options;
    let query = this.model.findById(id);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.lean();
  }

  async findAll(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = { createdAt: -1 },
      select,
      populate,
    } = options;
    const skip = (page - 1) * limit;

    let query = this.model.find(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);

    const [data, total] = await Promise.all([
      query.sort(sort).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data) {
    const doc = new this.model(data);
    return doc.save();
  }

  async update(id, data, options = { new: true, runValidators: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async exists(filter) {
    return this.model.exists(filter);
  }
}

// ─────────────────────────────────────────
// User Repository — Domain-specific queries
// ─────────────────────────────────────────
class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model
      .findOne({ email: email.toLowerCase() })
      .select("+password");
  }

  async findActiveAdmins() {
    return this.model.find({ role: "admin", isActive: true }).lean();
  }

  async updateLastLogin(userId) {
    return this.model.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }
}

// Usage in controllers — controllers know nothing about DB
const userRepo = new UserRepository();

const getUserProfile = async (req, res) => {
  const user = await userRepo.findById(req.params.id, {
    select: "-password",
    populate: "orders",
  });

  if (!user) throw new NotFoundError("User");
  res.json({ success: true, data: { user } });
};
```

### 18.2 Service Layer Pattern

```javascript
// services/orderService.js — Business logic lives here
class OrderService {
  constructor(orderRepo, productRepo, userRepo, paymentService, emailService) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
    this.userRepo = userRepo;
    this.paymentService = paymentService;
    this.emailService = emailService;
  }

  async createOrder(userId, cartItems) {
    // 1. Validate stock availability
    const stockCheck = await Promise.all(
      cartItems.map(async (item) => {
        const product = await this.productRepo.findById(item.productId);
        if (!product) throw new NotFoundError(`Product ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }
        return { product, quantity: item.quantity };
      }),
    );

    // 2. Calculate total
    const total = stockCheck.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0,
    );

    // 3. Process payment
    const payment = await this.paymentService.charge(userId, total);
    if (!payment.success) throw new AppError("Payment failed", 402);

    // 4. Create order (atomic with transaction)
    const order = await this.orderRepo.createWithTransaction(
      async (session) => {
        const order = await Order.create(
          [
            {
              userId,
              items: stockCheck.map(({ product, quantity }) => ({
                productId: product._id,
                price: product.price,
                quantity,
              })),
              total,
              paymentId: payment.id,
            },
          ],
          { session },
        );

        // Decrement stock
        await Promise.all(
          stockCheck.map(({ product, quantity }) =>
            Product.findByIdAndUpdate(
              product._id,
              { $inc: { stock: -quantity } },
              { session },
            ),
          ),
        );

        return order[0];
      },
    );

    // 5. Send confirmation email (async, non-blocking)
    const user = await this.userRepo.findById(userId);
    this.emailService.sendOrderConfirmation(user, order).catch(console.error);

    return order;
  }
}
```

### 18.3 Observer Pattern (Event-Driven Architecture)

```javascript
// events/eventBus.js
const EventEmitter = require("events");

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Increase from default 10
  }

  // Type-safe emit with logging
  publish(event, data) {
    console.log(`Event published: ${event}`);
    this.emit(event, data);
  }

  // Subscribe with error handling
  subscribe(event, handler) {
    this.on(event, async (data) => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Event handler failed for ${event}:`, error);
      }
    });
  }
}

const eventBus = new EventBus();

// Register listeners
eventBus.subscribe("user:registered", async ({ user }) => {
  await emailService.sendWelcomeEmail(user);
});

eventBus.subscribe("user:registered", async ({ user }) => {
  await analyticsService.trackRegistration(user);
});

eventBus.subscribe("order:completed", async ({ order }) => {
  await inventoryService.updateStock(order.items);
  await loyaltyService.addPoints(order.userId, order.total);
  await emailService.sendOrderReceipt(order);
});

// Publish events from controllers
const register = async (req, res) => {
  const user = await User.create(req.body);
  eventBus.publish("user:registered", { user });
  res.status(201).json({ success: true, data: { user } });
};

module.exports = eventBus;
```

---

## 19. Top Interview Questions & Answers

### Section A: Conceptual Questions

---

**Q1: What is the event loop in Node.js?**

> **Answer**: The event loop is what allows Node.js to perform non-blocking I/O operations despite being single-threaded. It continuously checks if the call stack is empty and picks up callbacks from the event queue. Node.js delegates heavy operations (file I/O, network requests) to the system kernel or libuv thread pool, registers a callback, and continues executing. When the operation completes, the callback is queued and the event loop picks it up when the call stack is free.

---

**Q2: What is the difference between `process.nextTick()`, `setImmediate()`, and `setTimeout()`?**

```javascript
setTimeout(() => console.log("setTimeout"), 0);
setImmediate(() => console.log("setImmediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("Promise"));

// Output:
// nextTick        ← Runs before I/O callbacks, before event loop
// Promise         ← Microtask queue, after nextTick
// setTimeout      ← Timer phase of event loop
// setImmediate    ← Check phase of event loop
```

> **Key insight**: `process.nextTick()` fires before the event loop continues. `setImmediate()` fires in the next iteration of the event loop (after I/O). `setTimeout(fn, 0)` fires at minimum after ~1ms.

---

**Q3: What is the difference between `require()` and `import`?**

```javascript
// CommonJS (require) — synchronous, dynamic
const express = require("express");
const { Router } = require("express");

// Can be conditional
if (condition) {
  const module = require("./optional");
}

// ES Modules (import) — async, static
import express from "express";
import { Router } from "express";
// Must be at top level, can't be conditional
```

> **Interview tip**: Node.js uses CommonJS by default. Add `"type": "module"` to package.json for ES Modules. ES Modules enable static analysis and tree-shaking but require `.mjs` extension or `"type": "module"`.

---

**Q4: How does Node.js handle multiple requests if it's single-threaded?**

> **Answer**: Node.js uses an event-driven, non-blocking I/O model. When a request comes in that requires I/O (database query, file read), Node.js:
>
> 1. Starts the I/O operation (delegated to OS/libuv)
> 2. Registers a callback
> 3. **Immediately continues** handling other requests
> 4. When I/O completes, the callback is added to the event queue
> 5. The event loop picks it up and executes it
>
> This is why Node.js can handle thousands of concurrent connections — it doesn't sit idle waiting for I/O.

---

**Q5: What is middleware in Express?**

```javascript
// Middleware is a function with (req, res, next) signature
// It can: execute code, modify req/res, end request, call next()

// 3 types:
// 1. Application-level
app.use((req, res, next) => next());

// 2. Router-level
router.use((req, res, next) => next());

// 3. Error-handling (4 parameters — Express identifies this!)
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});
```

---

**Q6: Explain Promises vs Async/Await**

> **Answer**: Promises represent a future value. They're objects with states: pending, fulfilled, or rejected. `async/await` is syntactic sugar over Promises — it makes async code look synchronous, improving readability. Under the hood, `async` functions return Promises, and `await` pauses execution within that function until the Promise resolves. Both are equivalent, but `async/await` is preferred for readability and easier error handling with `try/catch`.

---

**Q7: What is the difference between PUT and PATCH?**

```
PUT   → Replace the ENTIRE resource
        PUT /users/1 with { name: "John" }
        → { name: "John" }  (email and other fields are removed!)

PATCH → Update PARTIAL resource
        PATCH /users/1 with { name: "John" }
        → { name: "John", email: "old@email.com", role: "user" }
        (Only name changed, rest preserved)
```

---

**Q8: How do you prevent memory leaks in Node.js?**

```javascript
// Common causes and fixes:

// 1. Unremoved event listeners
const emitter = new EventEmitter();

// ❌ BAD — listener keeps growing
setInterval(() => {
  emitter.on("data", handler);
}, 1000);

// ✅ GOOD — remove when done
emitter.once("data", handler);
// or
emitter.removeListener("data", handler);

// 2. Global variable caching without limits
const cache = {};
// ❌ BAD — grows forever
cache[key] = data;

// ✅ GOOD — use LRU cache with size limit
const LRU = require("lru-cache");
const cache = new LRU({ max: 500 });

// 3. Unclosed streams
// ❌ BAD
const stream = fs.createReadStream(file);
stream.on("data", handler);
// Never closes if error occurs!

// ✅ GOOD
const { pipeline } = require("stream/promises");
await pipeline(readStream, processStream, writeStream);
// Pipeline handles cleanup automatically
```

---

**Q9: What is CORS and how do you handle it?**

```javascript
// CORS = Cross-Origin Resource Sharing
// Browser security feature preventing requests from different origins

// Origin = protocol + domain + port
// http://localhost:3000 and http://localhost:4000 are DIFFERENT origins

const cors = require("cors");

// Simple — allow all
app.use(cors());

// Production — specific configuration
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = ["https://myapp.com", "https://www.myapp.com"];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies
    maxAge: 86400, // Cache preflight for 24 hours
  }),
);
```

---

**Q10: How do you handle uncaught exceptions?**

```javascript
// Uncaught exception — synchronous code errors
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  // Log to monitoring service (Datadog, Sentry, etc.)
  process.exit(1); // Exit — process is in undefined state!
});

// Unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION!", reason);
  // Graceful shutdown
  server.close(() => {
    process.exit(1);
  });
});

// SIGTERM — graceful shutdown signal (from Kubernetes, Docker)
process.on("SIGTERM", () => {
  console.log("SIGTERM received");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
```

---

### Section B: Code Questions

---

**Q11: Write a function to flatten a deeply nested object**

```javascript
function flattenObject(obj, prefix = "", result = {}) {
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], newKey, result);
    } else {
      result[newKey] = obj[key];
    }
  }
  return result;
}

// Test
flattenObject({ a: { b: { c: 1 } }, d: 2 });
// → { 'a.b.c': 1, d: 2 }
```

---

**Q12: Implement a simple rate limiter without any library**

```javascript
// In-memory rate limiter
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // IP → [timestamp, timestamp, ...]
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.ip;
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Get existing requests, filter out old ones
      const requestTimes = (this.requests.get(ip) || []).filter(
        (time) => time > windowStart,
      );

      if (requestTimes.length >= this.maxRequests) {
        const oldest = requestTimes[0];
        const retryAfter = Math.ceil((oldest + this.windowMs - now) / 1000);

        res.setHeader("Retry-After", retryAfter);
        res.setHeader("X-RateLimit-Limit", this.maxRequests);
        res.setHeader("X-RateLimit-Remaining", 0);

        return res.status(429).json({
          error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        });
      }

      requestTimes.push(now);
      this.requests.set(ip, requestTimes);

      res.setHeader("X-RateLimit-Limit", this.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        this.maxRequests - requestTimes.length,
      );

      next();
    };
  }
}

// Usage
const limiter = new RateLimiter(100, 15 * 60 * 1000); // 100 req/15min
app.use(limiter.middleware());
```

---

**Q13: Implement a retry mechanism for API calls**

```javascript
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2, // Exponential backoff multiplier
    shouldRetry = (err) => err.status >= 500, // Retry on server errors
  } = options;

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt - 1);
      console.log(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Usage
const data = await withRetry(() => fetch("https://api.example.com/data"), {
  maxRetries: 3,
  delay: 500,
  backoff: 2,
});
```

---

**Q14: Design a simple event queue (job queue)**

```javascript
class JobQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  add(job) {
    return new Promise((resolve, reject) => {
      this.queue.push({ job, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;

    this.running++;
    const { job, resolve, reject } = this.queue.shift();

    try {
      const result = await job();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next job
    }
  }
}

// Usage
const queue = new JobQueue(3); // Max 3 concurrent

const jobs = Array.from({ length: 10 }, (_, i) =>
  queue.add(async () => {
    await new Promise((r) => setTimeout(r, 1000));
    return `Job ${i} complete`;
  }),
);

const results = await Promise.all(jobs);
// Processes 3 at a time instead of all 10 simultaneously
```

---

### Section C: System Design Questions

---

**Q15: How would you design a URL shortener API?**

```javascript
// URL Shortener — System Design

// Requirements:
// - POST /shorten → returns short URL
// - GET /:code → redirects to original URL
// - Handle millions of requests

// Schema
const urlSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true }, // "abc123"
  originalUrl: String,
  userId: mongoose.ObjectId,
  clicks: { type: Number, default: 0 },
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
});

// Generate short code
const nanoid = require("nanoid");

const shortenUrl = async (req, res) => {
  const { url, customCode, expiresIn } = req.body;

  const code = customCode || nanoid(7); // e.g., "xKj9pQr"

  const existing = await Url.findOne({ code });
  if (existing) return res.status(409).json({ error: "Code already taken" });

  const urlDoc = await Url.create({
    code,
    originalUrl: url,
    userId: req.user?.id,
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
  });

  res.json({
    shortUrl: `https://short.ly/${code}`,
    code,
    originalUrl: url,
    expiresAt: urlDoc.expiresAt,
  });
};

// Redirect — this needs to be FAST
const redirect = async (req, res) => {
  const { code } = req.params;

  // 1. Check Redis cache first
  let originalUrl = await redis.get(`url:${code}`);

  if (!originalUrl) {
    // 2. Check database
    const urlDoc = await Url.findOne({ code });
    if (!urlDoc) return res.status(404).json({ error: "URL not found" });
    if (urlDoc.expiresAt && urlDoc.expiresAt < new Date()) {
      return res.status(410).json({ error: "URL has expired" });
    }

    originalUrl = urlDoc.originalUrl;
    // Cache for 24 hours
    await redis.setex(`url:${code}`, 86400, originalUrl);

    // Track click (async, non-blocking)
    Url.findOneAndUpdate({ code }, { $inc: { clicks: 1 } }).exec();
  }

  res.redirect(301, originalUrl); // 301 = permanent redirect (browser caches)
};
```

---

**Q16: How would you implement API versioning?**

```javascript
// Strategy 1: URL versioning (most common)
app.use("/api/v1", v1Router);
app.use("/api/v2", v2Router);

// Strategy 2: Header versioning
app.use((req, res, next) => {
  const version = req.headers["api-version"] || "1";
  req.apiVersion = version;
  next();
});

app.get("/users", (req, res) => {
  if (req.apiVersion === "2") {
    // New format
  } else {
    // Old format
  }
});

// Strategy 3: Separate files per version
// /routes/v1/users.js
// /routes/v2/users.js

// Best practice: Version only when breaking changes
// v1 stays alive for deprecation period (6-12 months)
// Add deprecation headers
res.setHeader("Deprecation", 'version="v1", date="2025-01-01"');
res.setHeader("Sunset", "Sat, 01 Jan 2026 00:00:00 GMT");
```

---

## 20. Complete Project: Production-Ready REST API

### Project: E-Commerce API

```
📁 ecommerce-api/
├── 📁 src/
│   ├── 📁 config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── cloudinary.js
│   ├── 📁 controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   └── orderController.js
│   ├── 📁 middleware/
│   │   ├── auth.js
│   │   ├── cache.js
│   │   ├── validators.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── 📁 models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   └── Order.js
│   ├── 📁 routes/
│   │   ├── index.js
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   └── orders.js
│   ├── 📁 services/
│   │   ├── emailService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── 📁 utils/
│   │   ├── errors.js
│   │   ├── logger.js
│   │   ├── response.js
│   │   └── validators.js
│   └── app.js
├── 📁 tests/
│   ├── 📁 unit/
│   └── 📁 integration/
├── 📁 docs/
│   └── api.yaml
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js
└── package.json
```

```javascript
// Final: Complete Product Controller
// controllers/productController.js

const Product = require("../models/Product");
const { NotFoundError, ForbiddenError } = require("../utils/errors");
const { ApiResponse } = require("../utils/response");
const CacheService = require("../services/cacheService");
const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  // GET /api/v1/products
  getProducts: asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      category,
      minPrice,
      maxPrice,
      search,
      inStock,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (inStock === "true") filter.stock = { $gt: 0 };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const cacheKey = `products:${JSON.stringify({ filter, page, limit, sort })}`;
    const cached = await CacheService.get(cacheKey);
    if (cached)
      return ApiResponse.paginated(res, cached.data, cached.pagination);

    const skip = (page - 1) * limit;
    const sortObj = sort.startsWith("-")
      ? { [sort.slice(1)]: -1 }
      : { [sort]: 1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };

    await CacheService.set(cacheKey, { data: { products }, pagination }, 300);
    return ApiResponse.paginated(res, { products }, pagination);
  }),

  // GET /api/v1/products/:id
  getProduct: asyncHandler(async (req, res) => {
    const cached = await CacheService.get(`product:${req.params.id}`);
    if (cached) return ApiResponse.success(res, { product: cached });

    const product = await Product.findById(req.params.id).lean();
    if (!product) throw new NotFoundError("Product");

    await CacheService.set(`product:${req.params.id}`, product, 600);
    return ApiResponse.success(res, { product });
  }),

  // POST /api/v1/products (Admin only)
  createProduct: asyncHandler(async (req, res) => {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id,
    });

    await CacheService.delPattern("products:*");
    return ApiResponse.success(res, { product }, 201, "Product created");
  }),

  // PUT /api/v1/products/:id (Admin only)
  updateProduct: asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user.id },
      { new: true, runValidators: true },
    );

    if (!product) throw new NotFoundError("Product");

    await Promise.all([
      CacheService.del(`product:${req.params.id}`),
      CacheService.delPattern("products:*"),
    ]);

    return ApiResponse.success(res, { product }, 200, "Product updated");
  }),

  // DELETE /api/v1/products/:id (Admin only)
  deleteProduct: asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false }, // Soft delete
      { new: true },
    );

    if (!product) throw new NotFoundError("Product");

    await CacheService.delPattern(`product*`);
    return ApiResponse.success(res, null, 204);
  }),
};
```

---

## 📚 Recommended Learning Path

```
Week 1-2: Foundations
  ✅ JavaScript async patterns (Promises, async/await)
  ✅ Node.js core modules (fs, path, events, stream)
  ✅ HTTP fundamentals

Week 3-4: Express & REST
  ✅ Express.js basics, routing, middleware
  ✅ REST API design
  ✅ Input validation
  ✅ Error handling

Week 5-6: Database & Auth
  ✅ MongoDB + Mongoose OR PostgreSQL + Prisma
  ✅ JWT Authentication
  ✅ Role-based authorization

Week 7-8: Production Readiness
  ✅ Testing (Jest + Supertest)
  ✅ Caching (Redis)
  ✅ Security best practices
  ✅ Logging & monitoring

Week 9-10: Advanced
  ✅ WebSockets (Socket.io)
  ✅ Performance & clustering
  ✅ Docker & deployment
  ✅ Design patterns
```

## 🔗 Essential Packages Reference

| Package              | Purpose              | Install                       |
| -------------------- | -------------------- | ----------------------------- |
| `express`            | Web framework        | `npm i express`               |
| `mongoose`           | MongoDB ODM          | `npm i mongoose`              |
| `prisma`             | SQL ORM              | `npm i prisma @prisma/client` |
| `jsonwebtoken`       | JWT                  | `npm i jsonwebtoken`          |
| `bcryptjs`           | Password hashing     | `npm i bcryptjs`              |
| `ioredis`            | Redis client         | `npm i ioredis`               |
| `multer`             | File uploads         | `npm i multer`                |
| `sharp`              | Image processing     | `npm i sharp`                 |
| `helmet`             | Security headers     | `npm i helmet`                |
| `cors`               | CORS handling        | `npm i cors`                  |
| `express-rate-limit` | Rate limiting        | `npm i express-rate-limit`    |
| `express-validator`  | Validation           | `npm i express-validator`     |
| `winston`            | Logging              | `npm i winston`               |
| `socket.io`          | WebSockets           | `npm i socket.io`             |
| `nodemailer`         | Email                | `npm i nodemailer`            |
| `jest`               | Testing              | `npm i jest --save-dev`       |
| `supertest`          | API testing          | `npm i supertest --save-dev`  |
| `dotenv`             | Env variables        | `npm i dotenv`                |
| `compression`        | Response compression | `npm i compression`           |
| `morgan`             | HTTP logging         | `npm i morgan`                |

---

> 🎯 **You've completed the Node.js API Development guide!**
>
> **Next Steps**:
>
> 1. Build the complete e-commerce project
> 2. Deploy it on Railway, Render, or AWS
> 3. Add GraphQL as an alternative API layer
> 4. Explore microservices architecture
>
> **Practice sites**: LeetCode (Node.js), HackerRank, and build real projects.
