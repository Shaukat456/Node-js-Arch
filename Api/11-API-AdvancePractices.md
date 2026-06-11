===

# ⚡ **Advanced Node.js API Concepts**

---

## 🧩 1. Async/Await in Node.js APIs

---

### 🔹 Problem with Callbacks / Promises

In real APIs, you often make database or external API calls — both are **asynchronous**.
Earlier, developers used **callbacks** or `.then()` chains, which became messy (callback hell).

Example:

```js
getUser()
  .then((user) => getPosts(user.id))
  .then((posts) => getComments(posts[0].id))
  .catch((err) => console.error(err));
```

That’s hard to read and debug.

---

### ✅ Solution: `async/await`

Introduced in ES2017, `async/await` allows you to **write async code like synchronous code**, with built-in error handling using `try/catch`.

```js
app.get("/users/:id", async (req, res) => {
  try {
    const user = await db.findUser(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

🧠 Under the hood:
`await` pauses execution _inside that function_ until the Promise resolves or rejects.
It doesn’t block the Node event loop — the function is paused, not the entire server.

---

### 🔹 Best Practice

Always wrap your async route handlers in `try/catch`, or use a **global async error handler** (shown later).

---

## ⚙️ 2. Middleware Chains — The Backbone of Express APIs

---

### 🔹 What is Middleware?

A middleware is a function that executes **between** the request and response — like checkpoints in a pipeline.

```js
app.use((req, res, next) => {
  console.log("Middleware 1");
  next(); // pass control to next middleware
});
```

### 🔹 Middleware Chain Flow

Request → Middleware 1 → Middleware 2 → Route Handler → Response

Each middleware either:

- Calls `next()` to continue, or
- Ends the request with a response.

---

### 💡 Analogy

Think of middleware like **airport security**:

- Bag scan → ID check → boarding pass → boarding gate
  Each step checks something and passes you forward.

---

### 🔹 Example Middleware Chain

```js
const express = require("express");
const app = express();

app.use(express.json());

// 1. Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 2. Auth middleware
app.use((req, res, next) => {
  if (req.headers.token !== "abc123") {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
});

// 3. Route handler
app.get("/data", (req, res) => {
  res.json({ message: "Secure data" });
});

app.listen(3000, () => console.log("Server running..."));
```

🧩 Output:

```
GET /data
→ { "message": "Secure data" }
```

---

## 🌐 3. Understanding CORS (Cross-Origin Resource Sharing)

---

### 🔹 The Problem

If your frontend runs at `http://localhost:3000`
and backend API at `http://localhost:5000`,
the browser blocks requests (for security) because of **same-origin policy**.

---

### 🔹 The Solution — CORS

CORS allows a server to specify **who can access its resources**.

Server sends headers like:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

### ⚙️ Enable CORS in Express

```js
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000", // or '*'
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
```

---

### 🔹 Preflight Requests (OPTIONS)

Browsers send a `OPTIONS` request before `POST/PUT/DELETE` to check if the server allows it.

Express handles this automatically when `cors()` middleware is used.

---

### 🔒 Best Practice

Never use `origin: '*'` in production.
Instead, whitelist domains dynamically:

```js
const allowed = ["https://myapp.com", "https://admin.myapp.com"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowed.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  }),
);
```

---

## 🧠 4. Centralized Error Handling Architecture

---

### 🔹 Problem:

If you use `try/catch` in every route → your code becomes messy and repetitive.

---

### ✅ Solution: Centralized Error Middleware

You can create a **global error handler** to catch all exceptions in one place.

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});
```

Then, in your route:

```js
app.get("/user/:id", async (req, res, next) => {
  try {
    const user = await getUser(req.params.id);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    res.json(user);
  } catch (err) {
    next(err); // pass to global error handler
  }
});
```

Now all errors go to the same place — clean and maintainable.

---

### 💡 Helper Wrapper for Async Routes

To avoid writing `try/catch` in every route:

```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Use like this:
app.get(
  "/api/data",
  asyncHandler(async (req, res) => {
    const data = await fetchData();
    res.json(data);
  }),
);
```

---

## ⚙️ 5. Error Types and Handling Strategy

| Error Type           | Example                   | HTTP Status |
| -------------------- | ------------------------- | ----------- |
| Validation Error     | Missing required fields   | 400         |
| Authentication Error | Invalid token             | 401         |
| Authorization Error  | User not allowed          | 403         |
| Not Found            | Invalid route or resource | 404         |
| Server Error         | Database failure          | 500         |

Use **consistent response format**:

```js
res.status(400).json({
  success: false,
  error: "Validation failed",
  details: { field: "email" },
});
```

---

## ⚡ 6. Global Middleware Flow Recap

📦 **Flow for each request:**

```
Request
 ↓
CORS Middleware
 ↓
Logging Middleware
 ↓
Auth Middleware
 ↓
Validation Middleware
 ↓
Route Handler (Async/Await)
 ↓
Response OR Error → Error Handler Middleware
 ↓
Client
```

This is the architecture every **enterprise-grade Express API** follows.

---

## 🧠 7. Bonus: Async Error Propagation Flow

Let’s simulate an async DB error:

```js
app.get(
  "/db",
  asyncHandler(async (req, res) => {
    const user = await db.findUser(); // Suppose this throws
    res.json(user);
  }),
);
```

If `db.findUser()` rejects →
`asyncHandler` catches it → calls `next(err)` →
→ goes to the global error middleware →
→ returns `{ "message": "Database error" }`

This keeps your API stable under any failure.

---

## 💡 8. Example: Complete Advanced API Flow

```js
const express = require("express");
const cors = require("cors");
const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Async Handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Routes
app.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await fakeDB.find((u) => u.id == req.params.id);
    if (!user) throw { status: 404, message: "User not found" };
    res.json(user);
  }),
);

// Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(3000, () => console.log("Advanced API running on port 3000"));
```

---

## 🧠 9. Interview Questions (Advanced)

| Question                                                     | Short Answer                                                                                   |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| What is the purpose of middleware in Express?                | To process requests before reaching the route handler.                                         |
| What is the difference between middleware and route handler? | Middleware modifies request/response or controls flow; route handler sends the final response. |
| How do you handle errors globally?                           | Create an error-handling middleware and use `next(err)` in routes.                             |
| How does async/await prevent callback hell?                  | It allows writing asynchronous code that looks synchronous.                                    |
| What is the role of `next()`?                                | It passes control to the next middleware in the stack.                                         |
| What is CORS?                                                | Mechanism to control which origins can access API resources.                                   |
| What happens if you forget `next()` in middleware?           | The request hangs and never reaches the route.                                                 |
| How can you handle async errors automatically?               | Wrap route handlers in a reusable async wrapper (like `asyncHandler`).                         |

---

## ⚡ Summary

✅ Use **async/await** for clean asynchronous flow
✅ Use **middleware chains** for modularity
✅ Always enable **CORS** correctly for cross-origin access
✅ Implement **centralized error handling** for cleaner code
✅ Structure your flow → `middlewares → routes → error handler`

---
