Perfect 👍
Now we’re entering the **core of backend development** with Node.js —
understanding **APIs (Application Programming Interfaces)** — how they work, how Node.js handles them, and how you build them efficiently.

We’ll go step by step from **concept → architecture → code → interview-level understanding**.

---

# ⚡ **Node.js APIs — In Depth (Concept, Working, and Implementation)**

---

## 🧩 1. What is an API?

**API** = _Application Programming Interface_
It allows two systems (or components) to **communicate** with each other.

In web development, an **API** usually means a **set of HTTP endpoints** that allow clients (like browsers or mobile apps) to:

- Send requests
- Get responses
- Exchange data

---

### 💡 Analogy

Think of an API like a **restaurant waiter** 🍽️

| You     | API Client (frontend, app) |
| ------- | -------------------------- |
| Waiter  | API                        |
| Kitchen | Backend/server logic       |
| Food    | Data/response              |

You (client) give an order → waiter (API) takes it to the kitchen → brings back food (response).

---

## ⚙️ 2. Types of APIs

| Type              | Description                                                            | Example                  |
| ----------------- | ---------------------------------------------------------------------- | ------------------------ |
| **REST API**      | Uses HTTP verbs (GET, POST, PUT, DELETE) and URLs to access resources. | JSON-based API           |
| **GraphQL API**   | Query language for flexible data fetching.                             | Facebook’s GraphQL       |
| **SOAP API**      | XML-based protocol (older).                                            | Enterprise systems       |
| **WebSocket API** | Real-time, two-way communication.                                      | Chat apps, live tracking |
| **gRPC API**      | Binary protocol (high-performance).                                    | Microservices            |

In Node.js, the most common API type = **REST API**.

---

## 🧠 3. How a REST API Works

A REST API revolves around **resources** (like `users`, `orders`, `posts`).

| HTTP Method | Purpose             | Example URL  |
| ----------- | ------------------- | ------------ |
| GET         | Read data           | `/users`     |
| POST        | Create data         | `/users`     |
| PUT         | Update entire data  | `/users/123` |
| PATCH       | Update part of data | `/users/123` |
| DELETE      | Delete data         | `/users/123` |

Each method performs a **CRUD** operation:

> C - Create
> R - Read
> U - Update
> D - Delete

---

## 🧩 4. Anatomy of an API Request

Example:
`GET /users/123?active=true`

**Parts:**

- `/users/123` → **Route/path**
- `GET` → **HTTP method**
- `active=true` → **Query parameter**
- **Headers** → Metadata (auth, content type)
- **Body** → Data (in POST/PUT)

---

## ⚙️ 5. Building APIs in Node.js (Without Frameworks)

You can create APIs directly with Node’s built-in `http` module.

### Example: Basic REST API

```js
const http = require("http");

const server = http.createServer((req, res) => {
  if (req.url === "/api" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Hello from Node API!" }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(3000, () => console.log("Server running on port 3000"));
```

🌀 Output:

```
GET http://localhost:3000/api
→ { "message": "Hello from Node API!" }
```

---

## ⚙️ 6. Problem: Manual Parsing Is Painful

With raw Node.js, you must:

- Parse JSON manually
- Handle routing manually
- Handle CORS, errors, etc.

That’s why we use frameworks like **Express.js**.

---

## 🚀 7. Express.js — The API Framework for Node.js

Express makes API creation extremely simple and structured.

```js
const express = require("express");
const app = express();

app.use(express.json()); // for parsing JSON

app.get("/api", (req, res) => {
  res.json({ message: "GET request successful" });
});

app.post("/api", (req, res) => {
  res.json({ message: "POST received", data: req.body });
});

app.listen(3000, () => console.log("API running on port 3000"));
```

✅ Automatic JSON parsing
✅ Simpler routing
✅ Built-in middleware system

---

## 🧩 8. REST API Folder Structure

```bash
project/
│
├── server.js
├── routes/
│   └── userRoutes.js
├── controllers/
│   └── userController.js
└── models/
    └── userModel.js
```

This separation keeps your API modular and scalable.

---

## 🧠 9. How Node.js Handles API Requests (Under the Hood)

Let’s see what happens internally when an API request hits your Node server:

1. **Client sends HTTP request**
2. Node.js receives it in the **event loop**
3. If it’s an I/O operation (like DB access), it’s sent to **libuv thread pool**
4. While waiting, Node handles other requests
5. Once the response is ready, the event loop picks it up and sends it back

👉 That’s how Node.js handles **thousands of concurrent requests** efficiently — non-blocking I/O.

---

## ⚙️ 10. Middleware (Core of Express APIs)

Middleware functions are **functions that run before the main route handler**.

Example:

```js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next(); // move to next middleware or route
});
```

You can use middleware for:

- Logging
- Authentication
- Validation
- Error handling
- CORS

---

## 🧠 11. Example API with CRUD Operations

```js
const express = require("express");
const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Shaukat" },
  { id: 2, name: "Ali" },
];

// READ all
app.get("/users", (req, res) => res.json(users));

// READ one
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  user ? res.json(user) : res.status(404).json({ error: "User not found" });
});

// CREATE
app.post("/users", (req, res) => {
  const user = { id: Date.now(), name: req.body.name };
  users.push(user);
  res.status(201).json(user);
});

// UPDATE
app.put("/users/:id", (req, res) => {
  const user = users.find((u) => u.id == req.params.id);
  if (user) {
    user.name = req.body.name;
    res.json(user);
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// DELETE
app.delete("/users/:id", (req, res) => {
  users = users.filter((u) => u.id != req.params.id);
  res.status(204).send();
});

app.listen(3000, () => console.log("CRUD API running on 3000"));
```

---

## 🔒 12. Adding Authentication (JWT Example)

```js
const jwt = require("jsonwebtoken");
const SECRET = "mysecret";

// Login route
app.post("/login", (req, res) => {
  const token = jwt.sign({ user: req.body.username }, SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Protected route
app.get("/dashboard", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.user}` });
});

function verifyToken(req, res, next) {
  const bearer = req.headers.authorization;
  if (!bearer) return res.status(403).send("No token");
  const token = bearer.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}
```

---

## ⚙️ 13. Error Handling Best Practice

```js
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});
```

This **global error handler** catches unhandled errors.

---

## 🧠 14. Performance and Security Tips

✅ Use **`express.json()`** to parse requests safely
✅ Handle **CORS** properly using `cors` package
✅ Use **helmet** for setting secure headers
✅ Use **rate limiting** (prevent brute force attacks)
✅ Don’t block the event loop with long synchronous code
✅ Use **async/await** for async database calls

---

## 🧠 15. Interview Questions (and ideal answers)

| Question                                   | Short Answer                                                     |
| ------------------------------------------ | ---------------------------------------------------------------- |
| What is a REST API?                        | A stateless API that uses HTTP methods to access resources.      |
| What are CRUD operations?                  | Create, Read, Update, Delete.                                    |
| How does Node handle concurrent API calls? | Through the event loop and non-blocking I/O model.               |
| Difference between `PUT` and `PATCH`?      | PUT replaces the entire resource; PATCH updates partially.       |
| What is middleware?                        | A function that runs before a request reaches the route handler. |
| How to secure APIs?                        | JWT, Helmet, CORS, rate limiting, validation.                    |
| Difference between REST and GraphQL?       | REST has fixed endpoints; GraphQL allows flexible queries.       |
| What is status code 201 vs 204?            | 201 = Created, 204 = No Content.                                 |
| How to handle async errors?                | Use `try/catch` or a global error middleware.                    |
| What is CORS?                              | Mechanism to allow/disallow cross-origin requests.               |

---

## ⚡ Summary

✅ Node.js APIs are event-driven, non-blocking, and scalable.
✅ Express.js simplifies API creation and routing.
✅ Use middleware for cross-cutting concerns (auth, logs, etc.).
✅ Secure with JWT, Helmet, CORS.
✅ Handle errors gracefully.
✅ Organize routes, controllers, models.

---
