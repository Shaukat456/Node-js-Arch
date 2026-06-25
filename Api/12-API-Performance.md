## ===

## ⚙️ 1. What Do We Mean by API Performance?

API performance means **how fast, efficient, and scalable** your server responds to client requests.

You can think of it like a restaurant:

- The **waiter** = Node.js server
- The **chef** = your database
- The **menu items** = endpoints (APIs)

If the waiter (Node) gets too many orders (requests), but doesn’t manage them well (poor async, blocking code), the restaurant slows down — that’s **bad performance**.

---

## 🚀 2. Key Factors That Impact API Performance

| Factor                     | Description                                                                                            | Example                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **I/O Blocking**           | Node.js is single-threaded; blocking I/O (like long DB queries, loops, file reads) delays all requests | Using `sync` functions like `fs.readFileSync`      |
| **Database Bottlenecks**   | Slow queries, unindexed collections, or high latency                                                   | MongoDB query without indexes                      |
| **Network Overhead**       | Large payloads, excessive round-trips                                                                  | Returning 10,000 records to frontend               |
| **Unoptimized Middleware** | Every request passes through all middleware; heavy middleware slows down everything                    | Logging middleware writing to file on each request |
| **Improper Caching**       | Recomputing same data repeatedly                                                                       | Fetching user roles from DB every request          |

---

## ⚡ 3. Techniques for Boosting Node.js API Performance

### 🧩 3.1 Use Asynchronous (Non-blocking) Code

Avoid blocking the event loop.
✅ Use:

```js
await fs.promises.readFile("data.json");
```

❌ Avoid:

```js
fs.readFileSync("data.json");
```

**Real-world analogy:**
You’re a waiter — while the chef cooks, you can take another order (async).
If you just stand waiting for the chef (sync), no other customers get served.

---

### 🧠 3.2 Caching — Save Results, Avoid Rework

Use in-memory cache (Redis, Node cache) for frequently accessed data.

**Example:**

```js
const cache = new Map();

app.get("/users", async (req, res) => {
  if (cache.has("users")) {
    return res.json(cache.get("users"));
  }

  const users = await User.find();
  cache.set("users", users);
  res.json(users);
});
```

**Result:**
Repeated `/users` calls are 10x faster — no DB hits.

---

### 🧮 3.3 Pagination & Data Limits

Never return the full dataset.

**Example:**

```js
app.get("/posts", async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const posts = await Post.find()
    .skip((page - 1) * limit)
    .limit(limit);
  res.json(posts);
});
```

✅ Avoids memory spikes
✅ Reduces response time
✅ Client-side scrolling becomes smooth

---

### 🧵 3.4 Connection Pooling (Database)

Re-use DB connections instead of opening one per request.

**Example (Mongoose):**

```js
mongoose.connect(MONGO_URI, {
  maxPoolSize: 10,
});
```

**Analogy:**
Instead of hiring a new chef for every order, reuse 10 chefs efficiently.

---

### 🧠 3.5 Compression and GZIP

Use compression middleware to send smaller payloads.

```js
import compression from "compression";
app.use(compression());
```

✅ Shrinks JSON payloads
✅ Saves bandwidth
✅ Faster over slow networks

---

### 🔄 3.6 Use Cluster Mode (Multi-core Scaling)

Node.js runs single-threaded by default — one CPU core.
Use **Cluster** or **PM2** to use all cores.

```js
import cluster from "cluster";
import os from "os";

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
} else {
  app.listen(3000);
}
```

✅ Spreads load across cores
✅ Increases throughput

---

### 🧰 3.7 Optimize Middleware Chain

Each middleware adds latency.
✅ Use only what’s needed.
✅ Mount selectively:

```js
app.use("/admin", adminMiddleware); // Only for admin routes
```

---

### 🌐 3.8 HTTP/2 and Keep-Alive Connections

Enable persistent connections and multiplexing for better latency.

```js
import https from "https";
import fs from "fs";

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

https.createServer(options, app).listen(3000);
```

✅ Faster connections
✅ Less TCP overhead

---

### 🛡️ 3.9 Use CDN and Reverse Proxy

Use **Nginx** or **Cloudflare** in front of Node:

- Cache static responses
- Handle SSL
- Rate-limit
- Serve static assets faster

---

## 🧩 4. Monitoring and Performance Tools

| Tool                    | Use                             |
| ----------------------- | ------------------------------- |
| **PM2**                 | Process manager, load balancing |
| **New Relic / Datadog** | Performance analytics           |
| **Node.js Profiler**    | Measure CPU/memory usage        |
| **MongoDB Compass**     | Query performance, index usage  |
| **Postman / K6**        | API load testing                |

**Example (load test with K6):**

```bash
k6 run --vus 50 --duration 30s test.js
```

---

## 🧱 5. Architecture-Level Optimizations

1. **Microservices:** Split large apps into small APIs.
2. **Event-driven architecture:** Use message queues (RabbitMQ, Kafka).
3. **Lazy loading:** Fetch data only when required.
4. **Data replication:** Put frequently accessed DBs near users.

---

## 💡 6. Interview Questions (API Performance)

| Question                                        | Short Answer                       |
| ----------------------------------------------- | ---------------------------------- |
| What causes event loop blocking?                | CPU-intensive or synchronous tasks |
| How do you scale Node.js on multi-core systems? | Cluster or PM2                     |
| How can you cache data in Node.js?              | Redis, in-memory, CDN              |
| What’s the purpose of pagination?               | Limit payload size and DB strain   |
| How do you reduce network latency?              | Compression, HTTP/2, CDN           |

---
