Perfect! Let’s dive deep into **Indexing and Query Optimization in MongoDB**, which is a **crucial skill for building fast and scalable Node.js apps**. I’ll break this down **step by step**, with **real-world examples, concepts, and best practices**.

---

# 🧠 **Indexing and Query Optimization in MongoDB**

---

## 1. Why Indexes Matter

**Problem without Indexes:**

- MongoDB scans the **entire collection** to find documents → **slow** for large datasets.
- Example: Searching 1 million products without an index → full scan every query.

**Solution:** Use **indexes**, which are like a **table of contents in a book**.

**Analogy:**

- Without index: Read every page to find “Laptop”
- With index: Go directly to the page number

---

## 2. What is an Index?

An **index** is a data structure that stores **field values and pointers to documents**.

- Speeds up read queries
- Can also enforce **uniqueness**

**Example:**

```js
db.products.createIndex({ name: 1 }); // ascending index on 'name'
```

- `1` → ascending
- `-1` → descending

---

## 3. Types of Indexes

### A. Single Field Index

- Most basic index type
- Supports equality and range queries

```js
db.products.createIndex({ price: 1 });
```

### B. Compound Index

- Index on **multiple fields**
- Useful when queries filter on **more than one field**

```js
db.products.createIndex({ category: 1, price: -1 });
```

- Query: `find({ category: 'Laptop' }).sort({ price: -1 })` → uses this index

### C. Unique Index

- Prevent duplicate values in a field

```js
db.users.createIndex({ email: 1 }, { unique: true });
```

### D. Sparse Index

- Index only documents that have the indexed field

```js
db.products.createIndex({ discount: 1 }, { sparse: true });
```

### E. TTL (Time-To-Live) Index

- Auto-delete documents after a specific time

```js
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

- Useful for **session management or temporary data**

---

## 4. Indexing Strategies

1. **Analyze Query Patterns**

   - Which fields are queried frequently? → Index those
   - Example: Searching products by `category` or `price`

2. **Compound Indexes for Multi-field Queries**

   - `find({ category: 'Laptop', inStock: true })` → create compound index `{ category: 1, inStock: 1 }`

3. **Sort Optimization**

   - Index can satisfy sorting too
   - Example: `{ category: 1, price: -1 }` → allows sorting by price within category

4. **Unique Index for Data Integrity**

   - Example: Emails, usernames, SKU codes

5. **Avoid Over-indexing**

   - Each index consumes memory → slows writes (insert/update/delete)

---

## 5. Query Optimization Basics

### A. Use Covered Queries

- A query that **only accesses indexed fields** can be satisfied **without fetching documents**

```js
db.products.find({ category: "Laptop" }, { category: 1, price: 1, _id: 0 });
```

- If `category` + `price` is indexed → **no document fetch needed**

### B. Avoid Regex or Leading Wildcards

```js
// Bad: leading wildcard
db.products.find({ name: /top$/ }); // full scan

// Better: anchored search
db.products.find({ name: /^Laptop/ }); // can use index
```

### C. Use `$in` / `$eq` over `$ne` / `$nin`

- Negative operators (`$ne`, `$nin`) **cannot use indexes efficiently**

---

## 6. Explain Plans

MongoDB provides **query execution stats** using `.explain()`

```js
db.products.find({ category: "Laptop" }).explain("executionStats");
```

Key metrics:

- `stage` → which part of query plan is used
- `totalDocsExamined` → number of documents scanned
- `totalKeysExamined` → number of index entries scanned
- `executionTimeMillis` → time in milliseconds

✅ Goal: `totalKeysExamined` ≈ `n` (number of results) → indicates **index usage**

---

## 7. Real-World Examples

### A. E-commerce Product Search

```js
db.products.createIndex({ category: 1, price: -1 });

// Query:
db.products.find({ category: "Laptop" }).sort({ price: -1 });
```

- Uses compound index for filtering and sorting → **fast results**

### B. User Authentication

```js
db.users.createIndex({ email: 1 }, { unique: true });
db.users.find({ email: "user@example.com" });
```

- Ensures uniqueness + fast login lookup

### C. Session Expiry

```js
db.sessions.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
```

- Auto-delete expired sessions → no manual cleanup needed

---

## 8. Advanced Indexing Techniques

### A. Partial Index

- Index only documents that match a filter

```js
db.products.createIndex(
  { price: 1 },
  { partialFilterExpression: { inStock: true } }
);
```

### B. Text Index

- Full-text search for string fields

```js
db.articles.createIndex({ title: "text", content: "text" });
db.articles.find({ $text: { $search: "MongoDB Node.js" } });
```

### C. Geospatial Index

- For location-based queries

```js
db.places.createIndex({ location: "2dsphere" });
db.places.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 5000,
    },
  },
});
```

---

## 9. Best Practices

1. **Index only frequently queried fields** → too many indexes = slow writes
2. **Use compound indexes for multiple filter fields**
3. **Analyze queries using `.explain()`** → find bottlenecks
4. **Use TTL indexes for ephemeral data**
5. **Use text indexes for search**
6. **Monitor index usage** → `db.collection.getIndexes()`
7. **Keep indexes small** → include only necessary fields
8. **Avoid large `$regex` and `$ne` queries on unindexed fields**

---

## 10. Interview Questions

| Question                                     | Answer Summary                                                    |
| -------------------------------------------- | ----------------------------------------------------------------- |
| What is an index in MongoDB?                 | Data structure that speeds up queries                             |
| What is a compound index?                    | Index on multiple fields for multi-field queries                  |
| When would you use a TTL index?              | Expiring sessions, temp data                                      |
| Difference between partial and sparse index? | Partial = filter condition; Sparse = indexes only docs with field |
| What is a covered query?                     | Query satisfied entirely by index, no document fetch              |
| How to check if a query uses an index?       | `.explain("executionStats")`                                      |
| What are best practices for indexing?        | Only index necessary fields, use compound indexes, monitor usage  |
| How do indexes affect write performance?     | More indexes = slower writes                                      |

---

## ✅ Summary

- **Indexes are essential** for fast MongoDB queries
- **Single-field, compound, unique, TTL, partial, text, geospatial** → use as per need
- **Query optimization**: covered queries, explain plan, avoid full scans
- Real-world applications:

  - Product search → compound index
  - User login → unique index on email
  - Sessions → TTL index

---
