
# Chapter 14 — Database Relationships and Advanced MongoDB with Mongoose

## Learning Objectives

By the end of this chapter, you will understand:

1. MongoDB documents, collections, and ObjectIds.
2. One-to-one relationships.
3. One-to-many relationships.
4. Many-to-many relationships.
5. Mongoose `populate()`.
6. Embedding vs referencing.
7. Aggregation pipelines.
8. MongoDB indexes.
9. Database transactions.
10. Database performance optimization.

---

# 1. Understanding MongoDB's Data Structure

Before creating relationships, we need to understand how MongoDB stores information.

MongoDB is a NoSQL document database.

Unlike relational databases such as MySQL, MongoDB does not store information in rows and columns in the traditional way.

It stores information in documents.

### Database

A database contains multiple collections.

Example:

```text
secure_api
│
├── users
├── posts
├── courses
├── enrollments
└── attachments
```

### Collection

A collection is a group of documents.

For example, the `users` collection contains user documents.

### Document

A document represents one record.

Example:

```json
{
  "_id": "673a12345678901234567890",
  "name": "Ali",
  "email": "ali@example.com",
  "role": "user"
}
```

MongoDB automatically assigns an `_id` to each document if you don't provide one.

By default, this ID is an ObjectId.

## What is ObjectId?

ObjectId is MongoDB's default unique identifier for documents.

In Mongoose:

```js
const mongoose = require("mongoose");

const id = new mongoose.Types.ObjectId();

console.log(id);
```

Example output:

```text
673a12345678901234567890
```

We use ObjectIds to connect documents from different collections.

For example:

A post belongs to a user.

Instead of copying the complete user document into every post, we can store the user's ObjectId.

---

# 2. One-to-One Relationships

A one-to-one relationship means:

One document is associated with exactly one other document.

Example:

- One user has one profile.
- One user has one settings document.
- One employee has one employee record.

Let's implement a User and Profile relationship.

## Step 1: Create Profile Model

File:

`src/models/Profile.js`

```js
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    bio: {
      type: String,
      maxlength: 500
    },

    location: {
      type: String
    },

    website: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Profile", profileSchema);
```

Important concept:

```js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

This tells Mongoose:

- Store an ObjectId.
- The ObjectId refers to a document in the `User` collection.
- The model name is `User`.

The `unique: true` constraint creates a unique index, ensuring that one user cannot have multiple profile documents.

## Step 2: Create a Profile

Example:

```js
const Profile = require("../models/Profile");

const profile = await Profile.create({
  user: req.user.id,
  bio: "Physics student and developer",
  location: "Pakistan"
});
```

The `user` field contains the user's ID, not the entire user object.

## When should you use one-to-one relationships?

Use separate documents when:

- The related information is optional.
- The information is accessed independently.
- The document is large.
- Different permissions are required.

If profile information is always accessed with the user and remains small, embedding it inside the User document may be simpler.

---

# 3. One-to-Many Relationships

A one-to-many relationship means:

One document can be associated with multiple documents.

Examples:

- One user can create many posts.
- One customer can place many orders.
- One course can contain many lessons.

Let's implement:

**One User → Many Posts**

## Step 1: Create Post Model

File:

`src/models/Post.js`

```js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);
```

Notice this field:

```js
author: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"
}
```

Each post stores the ID of its author.

## Step 2: Create a Post

```js
const Post = require("../models/Post");

const post = await Post.create({
  title: "Introduction to Quantum Mechanics",
  content: "Quantum mechanics describes physical systems...",
  author: req.user.id
});
```

If the logged-in user creates this post, `req.user.id` identifies its author.

## Step 3: Retrieve Posts

```js
const posts = await Post.find();

res.json({
  success: true,
  data: posts
});
```

Example result:

```json
[
  {
    "_id": "post123",
    "title": "Introduction to Quantum Mechanics",
    "content": "Quantum mechanics describes...",
    "author": "user123"
  }
]
```

The author field contains only the ObjectId.

But what if we want the author's name and email?

This is where `populate()` becomes useful.

---

# 4. Mongoose Populate

`populate()` retrieves related documents using references.

Think of it this way:

Your Post document contains the author's ID.

`populate()` uses that ID to retrieve the corresponding User document.

## Basic Populate

```js
const posts = await Post.find().populate("author");
```

Now the result will contain the actual author document:

```json
[
  {
    "_id": "post123",
    "title": "Introduction to Quantum Mechanics",
    "content": "Quantum mechanics describes...",
    "author": {
      "_id": "user123",
      "name": "Ali",
      "email": "ali@example.com",
      "role": "user"
    }
  }
]
```

## Select Specific Fields

We usually don't want to expose every field.

For example, we don't need the user's password, reset token, or other private information.

Use field selection:

```js
const posts = await Post.find()
  .populate("author", "name email");
```

Now the author object contains only the selected fields.

Important:

Never expose sensitive user fields through populate.

## Populate with Match

Suppose we only want posts whose author has the role `admin`.

```js
const posts = await Post.find().populate({
  path: "author",
  match: {
    role: "admin"
  },
  select: "name email role"
});
```

Important detail:

`match` filters the populated author, not the original Post query.

Posts whose authors don't match may still appear, but their populated `author` field will be `null`.

## Populate Multiple Relationships

Imagine a post has an author and a category.

```js
const posts = await Post.find()
  .populate("author", "name")
  .populate("category", "name");
```

Mongoose retrieves both relationships.

## Nested Populate

Suppose a Post has comments, and every comment has an author.

You can populate nested relationships:

```js
const posts = await Post.find().populate({
  path: "comments",
  populate: {
    path: "author",
    select: "name"
  }
});
```

Nested population can be useful, but avoid retrieving unnecessarily deep or large relationships.

## Important: Populate is Not a SQL JOIN

MongoDB and Mongoose handle relationships differently from relational databases.

`populate()` retrieves referenced documents and replaces their IDs in the returned result.

It is convenient, but extensive population can become expensive.

For large datasets:

- Select only required fields.
- Limit returned documents.
- Create appropriate indexes.
- Consider aggregation with `$lookup`.
- Avoid unnecessarily deep population.

---

# 5. Many-to-Many Relationships

A many-to-many relationship means:

One document can be associated with multiple documents, and those documents can also be associated with multiple documents.

Example:

- One student can enroll in many courses.
- One course can have many students.

Let's implement this relationship.

## Option 1: Array of References

A Course model can store student IDs.

```js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

module.exports = mongoose.model("Course", courseSchema);
```

Now one course can have multiple students.

To retrieve them:

```js
const course = await Course.findById(courseId)
  .populate("students", "name email");
```

This is suitable when the relationship is relatively small and simple.

However, imagine a course has 100,000 students.

Keeping all those IDs in one Course document is not a good design.

## Option 2: Separate Enrollment Collection

For larger relationships, create a separate Enrollment model.

File:

`src/models/Enrollment.js`

```js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    enrolledAt: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

enrollmentSchema.index(
  {
    student: 1,
    course: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "Enrollment",
  enrollmentSchema
);
```

Why do we need this collection?

Because the relationship itself contains information:

- When did the student enroll?
- Is the enrollment active?
- Has the student completed the course?

These fields belong to the relationship, not necessarily to the User or Course.

Example:

```js
await Enrollment.create({
  student: userId,
  course: courseId,
  status: "active"
});
```

To retrieve a student's courses:

```js
const enrollments = await Enrollment.find({
  student: userId
})
  .populate("course", "title")
  .lean();
```

To retrieve all students enrolled in a course:

```js
const enrollments = await Enrollment.find({
  course: courseId,
  status: "active"
})
  .populate("student", "name email")
  .lean();
```

The `lean()` method returns plain JavaScript objects instead of full Mongoose documents.

It is useful for read-only operations where you don't need Mongoose document methods or change tracking.

---

# 6. Embedding vs Referencing

This is one of the most important MongoDB design decisions.

There are two common ways to represent related information.

## Embedding

Embedding means storing related data inside the same document.

Example:

```json
{
  "_id": "user123",
  "name": "Ali",
  "email": "ali@example.com",
  "address": {
    "city": "Karachi",
    "country": "Pakistan"
  }
}
```

The address is embedded inside the User document.

Mongoose schema:

```js
const addressSchema = new mongoose.Schema(
  {
    city: String,
    country: String
  },
  {
    _id: false
  }
);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  address: addressSchema
});
```

## Referencing

Referencing means storing the ID of another document.

Example:

```json
{
  "_id": "post123",
  "title": "My First Post",
  "author": "user123"
}
```

The author is stored in a separate collection.

## Comparison

| Embedding | Referencing |
|---|---|
| Related data is inside one document | Related data is stored separately |
| Fast access for commonly read-together data | Useful for independently accessed data |
| Updates may duplicate data | Updates happen in the referenced document |
| Document can grow significantly | Documents remain more independent |
| Single-document atomic updates | Multi-document changes may need transactions |

## When Should You Use Embedding?

Use embedding when:

- Related data is small.
- Related data is usually retrieved together.
- The child data does not need independent management.
- The data has a bounded size.

Examples:

- User address.
- Small application settings.
- A few contact details.

## When Should You Use Referencing?

Use referencing when:

- Related documents are large.
- Data is accessed independently.
- The relationship is one-to-many with potentially many children.
- The same document is referenced by many others.
- You need separate permissions or lifecycle management.

Examples:

- User and Posts.
- Student and Courses.
- Customer and Orders.

Remember:

MongoDB has a maximum BSON document size of 16 MB.

Avoid unbounded arrays inside documents.

---

# 7. MongoDB Aggregation Pipeline

So far, we've retrieved documents using:

```js
User.find()
Post.find()
```

But what if we want to calculate something?

For example:

- How many posts has each user created?
- How many orders does each customer have?
- What is the total revenue?
- How many users belong to each role?

This is where aggregation becomes useful.

An aggregation pipeline processes documents through multiple stages.

Think of it as a data-processing assembly line.

Each stage receives documents, performs an operation, and passes the result to the next stage.

## Common Aggregation Stages

### $match

Filters documents.

```js
{
  $match: {
    role: "user"
  }
}
```

Similar to a database query condition.

### $group

Groups documents and calculates values.

```js
{
  $group: {
    _id: "$role",
    totalUsers: {
      $sum: 1
    }
  }
}
```

### $project

Selects or transforms output fields.

```js
{
  $project: {
    totalUsers: 1
  }
}
```

### $sort

Sorts documents.

```js
{
  $sort: {
    totalUsers: -1
  }
}
```

`1` means ascending and `-1` means descending.

### $limit

Limits the number of results.

```js
{
  $limit: 10
}
```

### $count

Counts documents passing through the pipeline.

```js
{
  $count: "total"
}
```

---

# 8. Practical Aggregation: Posts Per User

Let's calculate how many posts each user has created.

File:

`src/controllers/analyticsController.js`

```js
const Post = require("../models/Post");

exports.getUserPostCounts = async (req, res) => {
  const results = await Post.aggregate([
    {
      $group: {
        _id: "$author",
        totalPosts: {
          $sum: 1
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $unwind: "$author"
    },
    {
      $project: {
        _id: 0,
        authorId: "$author._id",
        name: "$author.name",
        totalPosts: 1
      }
    },
    {
      $sort: {
        totalPosts: -1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: results
  });
};
```

Let's understand the important stages.

### Stage 1: $group

```js
{
  $group: {
    _id: "$author",
    totalPosts: {
      $sum: 1
    }
  }
}
```

Groups all posts by their author ID.

Example intermediate result:

```json
[
  {
    "_id": "user123",
    "totalPosts": 5
  },
  {
    "_id": "user456",
    "totalPosts": 3
  }
]
```

### Stage 2: $lookup

```js
{
  $lookup: {
    from: "users",
    localField: "_id",
    foreignField: "_id",
    as: "author"
  }
}
```

This retrieves matching user documents from the `users` collection.

### Stage 3: $unwind

`$lookup` returns an array.

`$unwind` converts each array element into an individual document.

### Stage 4: $project

We choose which fields should appear in the final output.

### Stage 5: $sort

Users with more posts appear first.

Example output:

```json
[
  {
    "authorId": "user123",
    "name": "Ali",
    "totalPosts": 5
  },
  {
    "authorId": "user456",
    "name": "Ahmed",
    "totalPosts": 3
  }
]
```

This is a practical example of an admin analytics endpoint.

Aggregation pipelines can perform much more complex calculations than ordinary `find()` queries.

---

# 9. MongoDB Indexes

Imagine your users collection contains 1 million documents.

You execute:

```js
const user = await User.findOne({
  email: "ali@example.com"
});
```

Without a suitable index, MongoDB may need to inspect many documents to find the matching email.

This is called a collection scan.

An index helps MongoDB locate matching documents more efficiently.

Think of an index like the index at the end of a textbook.

Instead of reading every page, you find the relevant page directly.

## Create a Single-Field Index

```js
userSchema.index({
  email: 1
});
```

`1` means ascending index order.

`-1` means descending index order.

## Unique Index

```js
userSchema.index(
  {
    email: 1
  },
  {
    unique: true
  }
);
```

This prevents duplicate email values at the database index level.

Important:

`unique: true` is not a normal Mongoose validator.

MongoDB enforces uniqueness through an index.

You must still handle duplicate-key errors, especially error code `11000`.

## Compound Index

Suppose you frequently query posts by author and sort them by creation date.

```js
postSchema.index({
  author: 1,
  createdAt: -1
});
```

This is a compound index.

It indexes multiple fields together.

It is useful for queries such as:

```js
const posts = await Post.find({
  author: userId
})
  .sort({
    createdAt: -1
  });
```

The order of fields in compound indexes matters.

## Text Index

If you want basic text searching:

```js
postSchema.index({
  title: "text",
  content: "text"
});
```

Then:

```js
const posts = await Post.find({
  $text: {
    $search: "quantum mechanics"
  }
});
```

For advanced search requirements, consider a dedicated search solution.

## TTL Index

TTL means Time To Live.

MongoDB can automatically delete documents after a specified time.

Example: temporary password reset records.

```js
resetTokenSchema.index(
  {
    expiresAt: 1
  },
  {
    expireAfterSeconds: 0
  }
);
```

MongoDB periodically removes expired documents.

TTL deletion is not guaranteed to happen at the exact expiry second.

Your application must still check expiry before accepting a reset token.

## Explain Query Performance

Use:

```js
const result = await User.find({
  email: "ali@example.com"
}).explain("executionStats");

console.log(result);
```

Important fields include:

- `executionTimeMillis`
- `totalDocsExamined`
- `totalKeysExamined`
- `nReturned`

A useful sign is that an indexed query examines relatively few documents compared with the number returned.

## Important Indexing Rule

Indexes improve reads but have costs:

- They consume storage.
- They require memory.
- Inserts and updates must maintain indexes.
- Too many indexes can reduce write performance.

Do not create indexes randomly.

Create them according to your application's actual query patterns.

---

# 10. Database Transactions

Suppose a user transfers money to another user.

The operation requires:

1. Deducting money from Account A.
2. Adding money to Account B.

What happens if the first operation succeeds but the second fails?

The database could end up with inconsistent data.

A transaction allows multiple database operations to succeed or fail together.

## What is a Transaction?

A transaction is a group of database operations treated as one logical unit.

The important properties are commonly described using ACID:

- Atomicity: all operations succeed or none do.
- Consistency: database rules remain satisfied.
- Isolation: concurrent transactions are handled according to the database's isolation guarantees.
- Durability: committed changes persist.

MongoDB provides atomicity for individual document writes.

Multi-document transactions are available when you need atomic operations across multiple documents or collections.

Important:

MongoDB multi-document transactions require a replica set or a sharded cluster.

A standalone MongoDB server does not support multi-document transactions.

## Example: Transfer Between Accounts

Imagine an Account model:

```js
const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  balance: {
    type: Number,
    required: true,
    min: 0
  }
});

module.exports = mongoose.model(
  "Account",
  accountSchema
);
```

Now implement a transfer.

```js
const mongoose = require("mongoose");
const Account = require("../models/Account");

async function transferMoney(fromId, toId, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid transfer amount");
  }

  if (fromId.toString() === toId.toString()) {
    throw new Error("Cannot transfer to the same account");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const sender = await Account.findById(fromId)
        .session(session);

      const receiver = await Account.findById(toId)
        .session(session);

      if (!sender || !receiver) {
        throw new Error("Account not found");
      }

      if (sender.balance < amount) {
        throw new Error("Insufficient balance");
      }

      sender.balance -= amount;
      receiver.balance += amount;

      await sender.save({ session });
      await receiver.save({ session });
    });
  } finally {
    await session.endSession();
  }
}
```

## Understanding the Transaction

### Start Session

```js
const session = await mongoose.startSession();
```

Creates a session for database operations.

### Start Transaction

```js
await session.withTransaction(async () => {
  // Database operations
});
```

All operations in this callback use the transaction session.

### Attach Session

```js
await sender.save({ session });
await receiver.save({ session });
```

This makes both writes part of the same transaction.

### End Session

```js
await session.endSession();
```

Always end the session.

If an error occurs inside the transaction, the transaction is aborted instead of committing only part of the transfer.

Production financial systems also need careful handling of concurrent requests, idempotency, audit records, and currency precision. Never use ordinary floating-point arithmetic for real financial balances; use integer minor units or a suitable decimal representation.

---

# 11. Database Performance Best Practices

Here are important techniques for building efficient APIs.

## 1. Use .lean() for Read-Only Queries

Instead of:

```js
const users = await User.find();
```

Use:

```js
const users = await User.find().lean();
```

When you only need plain data, `lean()` avoids creating full Mongoose documents.

## 2. Select Required Fields

Avoid retrieving unnecessary data.

```js
const users = await User.find()
  .select("name email role")
  .lean();
```

## 3. Use Pagination

Avoid returning thousands of documents in one request.

```js
const page = 1;
const limit = 20;

const users = await User.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .lean();
```

For very large collections, cursor-based pagination can be more efficient than large `skip()` values.

## 4. Avoid Unnecessary Populate

Instead of populating every field, retrieve only the fields required by the client.

```js
const posts = await Post.find()
  .populate("author", "name")
  .lean();
```

## 5. Create Indexes for Common Queries

If your API frequently searches by `author` and sorts by `createdAt`, consider a compound index:

```js
postSchema.index({
  author: 1,
  createdAt: -1
});
```

## 6. Validate Client Input

Never pass arbitrary client-provided objects directly into MongoDB queries.

Avoid:

```js
User.find(req.query);
```

Instead, validate and whitelist allowed fields.

Example:

```js
const filters = {};

if (typeof req.query.role === "string") {
  const allowedRoles = ["user", "moderator", "admin"];

  if (allowedRoles.includes(req.query.role)) {
    filters.role = req.query.role;
  }
}

const users = await User.find(filters);
```

Also whitelist sort fields rather than directly trusting client-provided sort objects.

---

# 12. Integrating These Concepts into Our REST API

Our application now has these models:

```text
src/
│
├── models/
│   ├── User.js
│   ├── Profile.js
│   ├── Post.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── Account.js
│
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── postController.js
│   └── analyticsController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── postRoutes.js
│   └── analyticsRoutes.js
│
└── middleware/
    ├── authMiddleware.js
    ├── authorize.js
    └── validate.js
```

## Example: Get Posts with Author Information

Controller:

```js
const Post = require("../models/Post");

exports.getPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
};
```

Route:

```js
const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, postController.getPosts);

module.exports = router;
```

## Example: Admin Analytics Route

Route:

```js
const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

router.get(
  "/user-post-counts",
  authMiddleware,
  authorize("admin"),
  analyticsController.getUserPostCounts
);

module.exports = router;
```

Mount it in `app.js`:

```js
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/admin/analytics", analyticsRoutes);
```

Endpoint:

```http
GET /api/admin/analytics/user-post-counts
```

Only authenticated administrators can access this endpoint.

For production, also apply pagination or limits where appropriate, and make sure analytics queries are designed for your actual data volume.

---

# 13. Chapter Summary

| Concept | Purpose |
|---|---|
| ObjectId | Identifies MongoDB documents |
| One-to-one | Connects one document to another |
| One-to-many | Connects one document to multiple documents |
| Many-to-many | Connects multiple documents on both sides |
| Populate | Retrieves referenced documents |
| Embedding | Stores related data inside a document |
| Referencing | Stores IDs of related documents |
| Aggregation | Processes and calculates data |
| Index | Improves query efficiency |
| Transaction | Makes multiple database writes atomic |

---

# 14. Practical Exercises

Complete these exercises in your existing project.

## Exercise 1 — Profile Relationship

1. Create a Profile model.
2. Connect it to the User model using ObjectId.
3. Ensure each user can have only one profile.
4. Create `GET /api/users/profile-details`.
5. Return the user's profile information.

## Exercise 2 — Posts

1. Create a Post model.
2. Connect each post to its author.
3. Implement `POST /api/posts`.
4. Implement `GET /api/posts`.
5. Populate the author's name.
6. Implement `GET /api/posts/:id`.

Security requirement:

Only authenticated users can create posts.

Only the post owner or an administrator should be allowed to update or delete a post.

## Exercise 3 — Course Enrollment

1. Create a Course model.
2. Create an Enrollment model.
3. Implement an enrollment endpoint.
4. Prevent duplicate enrollments.
5. Retrieve all courses belonging to a student.
6. Retrieve all active students in a course.

## Exercise 4 — Analytics

Create:

```http
GET /api/admin/analytics/user-post-counts
```

Requirements:

- Admin-only access.
- Use aggregation.
- Group posts by author.
- Calculate post counts.
- Include the author's name.
- Sort by the highest number of posts.

## Exercise 5 — Indexing

1. Create an index on User.email.
2. Create a compound index on Post.author and Post.createdAt.
3. Run `.explain("executionStats")`.
4. Compare query execution statistics.

## Exercise 6 — Transactions

Implement a transaction that transfers an amount between two accounts.

Requirements:

- Check account existence.
- Reject invalid amounts.
- Reject insufficient balance.
- Update both balances atomically.
- End the session correctly.

---

# 15. Knowledge Check

Answer these questions before moving to the next chapter.

1. What is the difference between embedding and referencing?
2. Why do we use `mongoose.Schema.Types.ObjectId`?
3. What does `ref: "User"` mean?
4. What problem does `populate()` solve?
5. Does `populate()` behave exactly like a SQL JOIN?
6. Why might an Enrollment collection be better than storing thousands of student IDs inside a Course document?
7. What is the purpose of `$group` in aggregation?
8. What does `$lookup` do?
9. Why do indexes improve query performance?
10. What is the disadvantage of creating too many indexes?
11. What is the difference between single-document atomicity and a multi-document transaction?
12. Why does MongoDB require a replica set or sharded cluster for multi-document transactions?

---

# Next Chapter — API Testing with Jest and Supertest

In the next chapter, we will learn how to test our REST API professionally:

1. Unit testing vs integration testing.
2. Jest fundamentals.
3. Supertest.
4. Testing registration and login.
5. Testing JWT authentication.
6. Testing role-based access control.
7. Testing protected routes.
8. Testing MongoDB operations.
9. Test databases and cleanup.
10. Writing reliable API test suites.
