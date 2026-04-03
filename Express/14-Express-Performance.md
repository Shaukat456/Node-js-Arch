# ⚡ Part 1 — Express.js Performance Optimization

Performance in Express is about minimizing:

- **Latency** (response time)
- **Blocking operations**
- **Redundant DB hits**
- **Unnecessary middlewares**

---

## 🧠 1. Use Compression Middleware

HTTP compression (gzip or brotli) reduces response payload size by 70–80%.

```bash
npm install compression
```

```js
const compression = require("compression");
app.use(compression());
```

✅ **Why it matters:**
Your API responses (especially JSON data) become smaller → faster over the network.
**Typical gain:** 2–3x speedup for API-heavy apps.

---

## ⚙️ 2. Cache Responses (Memory, Redis, or CDN)

For data that doesn’t change frequently (e.g., product lists, dashboard stats).

### Example: Simple in-memory cache

```js
const cache = {};

app.get("/api/products", async (req, res) => {
  if (cache.products) return res.json(cache.products);

  const products = await Product.find();
  cache.products = products;
  res.json(products);
});
```

### Example: Redis cache (real-world)

Use Redis for multi-instance caching:

```js
const redis = require("redis");
const client = redis.createClient();

app.get("/api/posts", async (req, res) => {
  const cacheData = await client.get("posts");
  if (cacheData) return res.json(JSON.parse(cacheData));

  const posts = await Post.find();
  await client.setEx("posts", 3600, JSON.stringify(posts));
  res.json(posts);
});
```

✅ **Why it matters:**
Reduces DB load and improves response time by 10x for read-heavy APIs.

---

## 🧵 3. Avoid Blocking Code

Node.js runs on a **single thread**, so avoid blocking operations like:

```js
fs.readFileSync();
bcrypt.hashSync();
JSON.parse(hugeString);
```

Instead, use **asynchronous versions**:

```js
await fs.promises.readFile();
await bcrypt.hash();
```

✅ **Why it matters:**
Blocking functions freeze the event loop → all requests stall.

---

## 🔁 4. Use Pagination and Query Limits

Never send thousands of records in one response.

Example:

```js
app.get("/api/users", async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json(users);
});
```

✅ **Why:** Protects memory and response size — critical for scalability.

---

## 🚀 5. Use Clustering (Leverage Multi-core CPUs)

Node.js runs on **a single CPU core**.
To use all cores, use the **cluster module** or **PM2 process manager**.

### Example:

```js
const cluster = require("cluster");
const os = require("os");
const express = require("express");

if (cluster.isPrimary) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) cluster.fork();
} else {
  const app = express();
  app.get("/", (req, res) => res.send(`Handled by ${process.pid}`));
  app.listen(3000);
}
```

✅ **Why it matters:**
Boosts throughput by parallelizing requests across all CPU cores.

---

## 🧰 6. Use `helmet`, `cors`, and `morgan` Properly (for both performance and security)

We’ll cover security-specific configurations next, but here’s a summary setup:

```bash
npm install helmet morgan cors
```

```js
app.use(helmet());
app.use(morgan("combined"));
app.use(cors({ origin: "https://yourfrontend.com" }));
```

---

# 🔒 Part 2 — Express.js Security Best Practices

Now, let’s harden your APIs against real-world attacks.

---

## 🧱 1. Secure HTTP Headers (Helmet)

```bash
npm install helmet
```

```js
const helmet = require("helmet");
app.use(helmet());
```

Helmet automatically sets headers like:

- `X-Frame-Options` — Prevent clickjacking
- `Strict-Transport-Security` — Enforce HTTPS
- `X-Content-Type-Options` — Prevent MIME type sniffing
- `X-XSS-Protection` — Prevent reflected XSS

✅ **Why:** These are your **first line of defense** against browser-based attacks.

---

## 🔑 2. Authentication with JWT

We’ll integrate JWT in full detail later, but here’s a conceptual snippet:

```js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.status(400).json({ message: "Invalid token" });
  }
};
```

✅ **Why:** JWT tokens allow **stateless authentication**, perfect for microservices and distributed systems.

---

## 🧂 3. Hash Passwords using bcrypt

Never store plain-text passwords.

```bash
npm install bcrypt
```

```js
const bcrypt = require("bcrypt");
const hashed = await bcrypt.hash(password, 10);
```

✅ **Why:** Even if your DB leaks, attackers can’t retrieve actual passwords.

---

## ⛔ 4. Prevent Rate-based Attacks (Rate Limiting)

Stops bots and brute-force attempts.

```bash
npm install express-rate-limit
```

```js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  limit: 100, // limit per IP
  message: "Too many requests, please try again later",
});

app.use("/api", limiter);
```

✅ **Why:** Prevents **DDoS** and **brute-force** attacks.

---

## 🌐 5. Harden CORS Policy

Default `app.use(cors())` = open to everyone.
Always **restrict** origins and methods in production.

```js
app.use(
  cors({
    origin: ["https://trusted-app.com"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
```

✅ **Why:** Prevents unauthorized websites from calling your APIs.

---

## 🧰 6. Validate All Inputs (SQL/NoSQL Injection)

Never trust client data.
If you’re using Mongoose:

```js
const user = await User.findOne({ email: req.body.email });
```

Never do:

```js
User.find({ $where: req.body.anything });
```

✅ **Why:** Prevents MongoDB query injection.

---

## 🧹 7. Sanitize Inputs

```bash
npm install express-mongo-sanitize xss-clean
```

```js
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

app.use(mongoSanitize());
app.use(xss());
```

✅ **Why:** Removes malicious inputs before processing.

---

## 🔐 8. Use HTTPS and Secure Cookies

Use `helmet.hsts()` to enforce HTTPS:

```js
app.use(helmet.hsts({ maxAge: 31536000 }));
```

For cookies:

```js
res.cookie("token", jwt, { httpOnly: true, secure: true });
```

✅ **Why:** Prevents session hijacking and MITM attacks.

---

## 🧭 Real-World Use Case: Secure E-commerce API Architecture

Example pipeline for `/api/checkout`:

1. **Helmet** → Secure headers
2. **Rate limiter** → Prevent spam
3. **Auth middleware** → Verify JWT
4. **Validation middleware** → Validate input
5. **Controller** → Business logic
6. **Error handler** → Unified error response

```js
app.post(
  "/api/checkout",
  limiter,
  auth,
  validateCheckoutData,
  asyncHandler(checkoutController)
);
```

✅ This layered security ensures:

- No anonymous access
- No spam requests
- No data corruption
- Unified logging & error tracking

---

## 🧩 Summary Table

| Layer            | Tool                          | Purpose                  |
| ---------------- | ----------------------------- | ------------------------ |
| Compression      | `compression`                 | Reduce payload size      |
| Caching          | Redis                         | Faster repeated requests |
| Helmet           | `helmet`                      | Secure headers           |
| Rate Limiting    | `express-rate-limit`          | DDoS protection          |
| Auth             | JWT + bcrypt                  | Authentication           |
| Input Validation | `express-validator`           | Prevent bad data         |
| Sanitization     | `xss-clean`, `mongo-sanitize` | Remove injections        |
| HTTPS            | Helmet HSTS                   | Secure traffic           |

---
