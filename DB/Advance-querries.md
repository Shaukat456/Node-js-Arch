Perfect! 🚀 Now we’ll dive into **MongoDB + Node.js Integration**, complete with **real-world examples, Mongoose schemas, CRUD operations, and best practices**. This is the backbone of modern Node.js apps.

We’ll go step by step from **setup → schema → CRUD → real-world API use case → best practices**.

---

# 🧩 MongoDB + Node.js Integration (with Real-World Examples)

---

## 1. Why MongoDB?

MongoDB is a **NoSQL document database** that stores data as JSON-like documents.

**Benefits:**

- Flexible schema → easy to adapt as app evolves
- Scales horizontally → great for apps with growing data
- Perfect for **Node.js** because JSON-like objects = natural fit

**Real-world Example:**

- Social media posts, comments
- E-commerce products and orders
- Real-time analytics logs

---

## 2. Setting Up Node.js + MongoDB

### Install dependencies:

```bash
npm init -y
npm install express mongoose dotenv
```

### Folder structure:

```
project/
│
├── server.js
├── .env
├── models/
│   └── product.js
├── routes/
│   └── productRoutes.js
└── controllers/
    └── productController.js
```

---

## 3. Connect to MongoDB

Create **.env**:

```
MONGO_URI=mongodb://localhost:27017/myapp
PORT=5000
```

**server.js**

```js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Routes
const productRoutes = require("./routes/productRoutes");
app.use("/api/products", productRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
);
```

---

## 4. Create Mongoose Schema & Model

**models/product.js**

```js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
```

**Real-world analogy:**

- Each **document** = a product in e-commerce
- Schema ensures **required fields** like name & price

---

## 5. CRUD Operations

### A. Create Product

**controllers/productController.js**

```js
const Product = require("../models/product");

exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};
```

**routes/productRoutes.js**

```js
const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
```

---

### B. Read Products

```js
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};
```

---

### C. Update Product

```js
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
};
```

---

### D. Delete Product

```js
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
```

---

## 6. Real-World Example: E-Commerce API Flow

| API Endpoint               | Action             |
| -------------------------- | ------------------ |
| POST `/api/products`       | Add new product    |
| GET `/api/products`        | Get all products   |
| GET `/api/products/:id`    | Get single product |
| PUT `/api/products/:id`    | Update product     |
| DELETE `/api/products/:id` | Remove product     |

**Example Request to Add Product:**

```json
POST /api/products
{
  "name": "Laptop",
  "description": "Gaming Laptop",
  "price": 1200
}
```

**Example Response:**

```json
{
  "_id": "64f34c7f2c3b3c0012345678",
  "name": "Laptop",
  "description": "Gaming Laptop",
  "price": 1200,
  "inStock": true,
  "createdAt": "2025-10-25T05:00:00.000Z"
}
```

---

## 7. Advanced Queries & Features

### A. Filtering & Sorting

```js
const products = await Product.find({ inStock: true }).sort({ price: -1 });
```

### B. Pagination

```js
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const products = await Product.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### C. Aggregation Example

```js
const result = await Product.aggregate([
  { $match: { inStock: true } },
  { $group: { _id: null, avgPrice: { $avg: "$price" } } },
]);
```

---

## 8. Best Practices

1. **Use Mongoose Schemas** → enforce data structure
2. **Validation & Defaults** → ensure clean data
3. **Error handling** → central error middleware
4. **Indexes** → for fields used in search or filters
5. **Lean queries** → `.lean()` to improve read performance
6. **Environment variables** → secure DB connection
7. **Connection pooling** → optimize performance

---

## 9. Interview Questions

| Question                           | Answer Summary                                            |
| ---------------------------------- | --------------------------------------------------------- |
| Why use MongoDB with Node.js?      | JSON-like storage, flexible schema, scalable, natural fit |
| What is Mongoose?                  | ODM for MongoDB to map JS objects to documents            |
| How to validate schema in MongoDB? | Use Mongoose `type`, `required`, `min`, `max` etc.        |
| Difference `find` vs `findOne`?    | `find` returns array, `findOne` returns single document   |
| How to handle pagination?          | `.skip()` + `.limit()` or `mongoose-paginate`             |
| How to improve query performance?  | Indexing, lean queries, aggregation pipelines             |
| How to delete a document safely?   | Use `findByIdAndDelete` or soft-delete pattern            |
| How to connect Node.js to MongoDB? | Using `mongoose.connect(uri)` or native driver            |

---

## ✅ Summary

- **MongoDB + Node.js** is ideal for modern web apps
- **Mongoose ODM** makes CRUD, validation, and relations easy
- Real-world apps like **e-commerce, social media, analytics** use this stack
- Advanced queries include **filtering, sorting, pagination, aggregation**
- Always follow **security, validation, and performance best practices**

---
