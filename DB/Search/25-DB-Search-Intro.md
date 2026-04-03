We’ll break this into:

1. Conceptual explanation
2. Syntax + examples
3. Real-world use cases
4. Performance & interview questions

---

# ⚙️ 1. Advanced Querying Overview

MongoDB’s query system is not just about filters (`find({ age: 25 })`).
It can perform **semantic searches**, **location-based lookups**, and **relevance scoring**, all directly within the database — no need for external search engines like Elasticsearch for moderate use cases.

---

# 🧠 2. Text Search in MongoDB

---

## 📘 What is Text Search?

MongoDB provides a **built-in full-text search engine** that allows you to search **words, phrases, or combinations** of words across string fields.

It’s like Google Search inside your database.

---

## 🧩 Step 1: Create a Text Index

```js
db.articles.createIndex({ content: "text" });
```

You can also create on multiple fields:

```js
db.articles.createIndex({ title: "text", body: "text" });
```

---

## 🔍 Step 2: Perform Text Search

```js
db.articles.find({ $text: { $search: "quantum mechanics" } });
```

This query:

- Finds documents where _quantum_ or _mechanics_ appear in the indexed fields.
- Automatically ignores case and common words (“the”, “is”, etc.)

---

## 💡 Step 3: Phrase and Negation Search

### Exact Phrase:

```js
db.articles.find({ $text: { $search: '"quantum entanglement"' } });
```

### Excluding Words:

```js
db.articles.find({ $text: { $search: "physics -optics" } });
```

→ finds documents that mention “physics” but **not** “optics”.

---

## 🧮 Step 4: Relevance Scoring

Each match is given a **text score** based on relevance.

```js
db.articles
  .find({ $text: { $search: "quantum" } }, { score: { $meta: "textScore" } })
  .sort({ score: { $meta: "textScore" } });
```

Output shows documents ranked by how relevant they are.

---

## ⚙️ Step 5: Language Handling

You can define a language to control stop words and stemming:

```js
db.articles.createIndex({ content: "text" }, { default_language: "english" });
```

---

## 🚀 Real-World Example

In a **blog platform (like Medium clone)**:

- Users search for “AI ethics”
- MongoDB text index on `{ title: "text", content: "text" }`
- Query returns posts with relevance scores, sorted by match quality

---

## ⚡ Optimization Tips

- Text indexes can be **created only once per collection** (but can cover multiple fields).
- Combine with other filters using `$and`.
  Example:

  ```js
  db.articles.find({
    $text: { $search: "quantum" },
    category: "physics",
  });
  ```

- Project only necessary fields to reduce payload.

---

## 🗣 Interview Questions (Text Search)

1. How does MongoDB full-text search work internally?
2. Can you create multiple text indexes on one collection?
3. How do you get a document’s relevance score?
4. How do you search for an exact phrase?
5. How do you combine text search with filters?

---

# 🌍 3. Geospatial Queries in MongoDB

---

## 🧭 What Are Geospatial Queries?

These allow MongoDB to store and query **location data** (coordinates, areas, distances).
Used in apps like Uber, Google Maps, or food delivery systems.

---

## 🧩 Step 1: Store Coordinates

MongoDB uses **GeoJSON** format for geographic data.

### Example Document:

```js
db.places.insertOne({
  name: "Pizza House",
  location: {
    type: "Point",
    coordinates: [74.3587, 31.5204], // [longitude, latitude]
  },
});
```

---

## 🧩 Step 2: Create a Geospatial Index

```js
db.places.createIndex({ location: "2dsphere" });
```

This allows complex Earth-based distance calculations.

---

## 🔍 Step 3: Query Nearby Locations

### `$near` Query:

```js
db.places.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [74.3587, 31.5204], // Lahore
      },
      $maxDistance: 2000, // meters
    },
  },
});
```

👉 Returns places **within 2 km** of Lahore’s coordinates.

---

## 🔹 `$geoWithin` Query

Find documents **inside a defined area**.

Example: find all places **inside a polygon** (e.g., a delivery zone):

```js
db.places.find({
  location: {
    $geoWithin: {
      $geometry: {
        type: "Polygon",
        coordinates: [
          [
            [74.34, 31.52],
            [74.36, 31.52],
            [74.36, 31.54],
            [74.34, 31.54],
            [74.34, 31.52],
          ],
        ],
      },
    },
  },
});
```

---

## 🔹 `$geoIntersects` Query

Finds locations that **intersect** a given geometry (used for routes, zones, etc.)

```js
db.routes.find({
  path: {
    $geoIntersects: {
      $geometry: {
        type: "LineString",
        coordinates: [
          [74.34, 31.52],
          [74.36, 31.54],
        ],
      },
    },
  },
});
```

---

## ⚡ Real-World Examples

### 🚗 Food Delivery App

- **Query:** All restaurants within 5 km of user’s location.
- **Implementation:** `$near` query on `location` with a `2dsphere` index.

### 🏠 Real Estate Website

- **Query:** All listings inside a city boundary.
- **Implementation:** `$geoWithin` with polygon coordinates.

### 🚓 Ride-hailing App (Uber)

- **Query:** Find nearest available drivers to rider.
- **Implementation:** `$near` sorted by proximity.

---

## 💡 Performance Tips

- Always index geospatial fields (`2dsphere` index).
- Combine geospatial with other filters using `$and`.
  Example:

  ```js
  db.places.find({
    $and: [
      { type: "restaurant" },
      {
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [74.35, 31.52] },
            $maxDistance: 1000,
          },
        },
      },
    ],
  });
  ```

- Avoid storing invalid coordinate formats — always `[longitude, latitude]`.

---

## 🗣 Interview Questions (Geospatial Queries)

1. What is the difference between `2d` and `2dsphere` indexes?
2. How does `$near` differ from `$geoWithin`?
3. What data format does MongoDB use for geolocation?
4. How would you find all drivers within 3 km of a user’s location?
5. Can we combine geospatial queries with filters?

---

## 🚀 Summary

| Concept                | What it Does                                  | Real Use Case                          |
| ---------------------- | --------------------------------------------- | -------------------------------------- |
| **Text Index**         | Full-text search on string fields             | Blog search, e-commerce product search |
| **Relevance Score**    | Rank results by match strength                | Search engines, content ranking        |
| **2dsphere Index**     | Enables geographic queries on Earth’s surface | Food delivery, Uber, real estate       |
| **$near / $geoWithin** | Proximity and region-based queries            | Maps, delivery zones                   |

---
