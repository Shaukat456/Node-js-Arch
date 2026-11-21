
# Chapter 18 — Capstone: Complete Secure REST API

## 1. Project Overview

We are building a production-oriented REST API called:

**Secure API Platform**

It will support:

- User registration and login.
- JWT authentication.
- Role-based access control.
- User profile management.
- Password changes and password resets.
- User avatar uploads.
- Cloud file storage.
- Posts and comments.
- Database relationships.
- Pagination, filtering, and searching.
- Automated testing.
- Centralized error handling.
- Production deployment.

### Technology Stack

| Area | Technology |
|---|---|
| Runtime | Node.js |
| Backend framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password hashing | bcrypt |
| Validation | Zod |
| File upload | Multer |
| Cloud storage | Cloudinary / S3 |
| Testing | Jest + Supertest |
| Process manager | PM2 |
| Reverse proxy | Nginx |

---

# 2. Understand the Complete Architecture

Before writing more code, let's understand how our application is organized.

```text
                 CLIENT
                   |
                   |
              HTTP Request
                   |
                   v
                 ROUTER
                   |
                   v
               MIDDLEWARE
                   |
        +----------+----------+
        |          |          |
        v          v          v
   Authentication RBAC    Validation
        |          |          |
        +----------+----------+
                   |
                   v
               CONTROLLER
                   |
                   v
                SERVICE
                   |
                   v
                 MODEL
                   |
                   v
                DATABASE
                   |
                   v
                RESPONSE
```

We have already studied MVC, but notice that we have introduced another layer: **Services**.

Let's understand why.

## 2.1 What is the Controller responsible for?

The controller handles the HTTP request and response.

For example:

```javascript
async function getProfile(req, res) {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
}
```

Responsibilities:

- Read request information.
- Call the appropriate business operation.
- Return an HTTP response.

## 2.2 What is the Service responsible for?

A service contains business logic.

For example, suppose we want to change a user's password.

The business rules might be:

1. Verify the old password.
2. Validate the new password.
3. Hash the new password.
4. Save it.
5. Invalidate existing sessions if required.

This logic can live in a service.

```javascript
async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = newPassword;

  await user.save();

  return true;
}
```

Notice that the service does not need to know about:

- `req`
- `res`
- HTTP headers
- Express routes

It focuses on the business operation.

**Important:** This is an architectural improvement, not a requirement that every small operation must have a service.

## 2.3 What is the Model responsible for?

The model defines how data is stored and accessed.

Example:

```javascript
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

The model describes the structure and database behavior of a post.

---

# 3. Final Project Structure

Let's organize the complete application.

```text
secure-api/
│
├── server.js
├── package.json
├── .env
├── .env.example
├── .gitignore
│
├── src/
│   │
│   ├── app.js
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── cloudinary.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Comment.js
│   │   └── File.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── commentController.js
│   │   └── adminController.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── postService.js
│   │   └── fileService.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── authorize.js
│   │   ├── validate.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── rateLimitMiddleware.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── userValidator.js
│   │   └── postValidator.js
│   │
│   └── utils/
│       ├── ApiError.js
│       ├── asyncHandler.js
│       └── response.js
│
└── tests/
    ├── auth.test.js
    ├── users.test.js
    ├── posts.test.js
    └── helpers/
```

### Why separate these folders?

Imagine we put everything into one file:

```text
server.js
```

It might initially work.

But as the application grows, it becomes difficult to:

- Find code.
- Reuse business logic.
- Test individual components.
- Change database behavior.
- Maintain security rules.

Separating responsibilities makes the application easier to maintain.

---

# 4. Design the Database

Our application will have four primary collections.

## 4.1 User

A user can create many posts.

```javascript
{
  _id: ObjectId,
  name: "Ali",
  email: "ali@example.com",
  password: "hashed-password",
  role: "user",
  avatar: {
    url: "https://example.com/avatar.jpg",
    publicId: "avatars/abc123"
  },
  createdAt: Date,
  updatedAt: Date
}
```

The password must be hashed, never stored as plain text.

## 4.2 Post

A post belongs to one user.

```javascript
{
  _id: ObjectId,
  title: "Introduction to Physics",
  content: "Physics is the study of nature.",
  author: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

Here, `author` references a User document.

## 4.3 Comment

A comment belongs to a post and an author.

```javascript
{
  _id: ObjectId,
  content: "Very useful post!",
  author: ObjectId,
  post: ObjectId,
  createdAt: Date
}
```

## 4.4 File

A file record stores information about an uploaded file.

```javascript
{
  _id: ObjectId,
  owner: ObjectId,
  originalName: "profile.png",
  storageProvider: "cloudinary",
  storageKey: "avatars/abc123",
  url: "https://example.com/image.png",
  createdAt: Date
}
```

Notice that we store the storage identifier, not just the public URL.

We may need that identifier later to delete the file from Cloudinary or S3.

---

# 5. Design the API Endpoints

Before writing controllers, define the API contract.

## 5.1 Authentication endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/forgot-password` | Public |
| POST | `/api/v1/auth/reset-password` | Reset token |
| POST | `/api/v1/auth/logout` | Authenticated |
| GET | `/api/v1/auth/me` | Authenticated |

## 5.2 User endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/users/profile` | Authenticated |
| PATCH | `/api/v1/users/profile` | Authenticated |
| PATCH | `/api/v1/users/change-password` | Authenticated |
| POST | `/api/v1/users/avatar` | Authenticated |
| DELETE | `/api/v1/users/avatar` | Authenticated |

## 5.3 Admin endpoints

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/admin/users` | Admin |
| GET | `/api/v1/admin/users/:id` | Admin |
| PATCH | `/api/v1/admin/users/:id` | Admin |
| PATCH | `/api/v1/admin/users/:id/role` | Admin |
| DELETE | `/api/v1/admin/users/:id` | Admin |

## 5.4 Post endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/posts` | Authenticated |
| GET | `/api/v1/posts` | Public |
| GET | `/api/v1/posts/:id` | Public |
| PATCH | `/api/v1/posts/:id` | Author or Admin |
| DELETE | `/api/v1/posts/:id` | Author or Admin |

## 5.5 Comment endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/posts/:postId/comments` | Authenticated |
| GET | `/api/v1/posts/:postId/comments` | Public |
| PATCH | `/api/v1/comments/:id` | Author or Admin |
| DELETE | `/api/v1/comments/:id` | Author or Admin |

---

# 6. Implement the Authorization Strategy

Authentication and authorization are different.

Authentication answers:

"Who are you?"

Authorization answers:

"What are you allowed to do?"

Our application has three roles:

```text
user
moderator
admin
```

But roles alone are not sufficient.

For example:

- A user can edit their own post.
- A user cannot edit another user's post.
- An admin can edit any post.
- A moderator may be allowed to moderate posts.

This is where ownership checks become important.

## 6.1 Authentication middleware

The authentication middleware verifies the JWT.

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, "User no longer exists"));
    }

    if (user.tokenVersion !== undefined &&
        user.tokenVersion !== decoded.tokenVersion) {
      return next(new ApiError(401, "Token has been revoked"));
    }

    req.user = user;

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = authenticate;
```

This example assumes your User model includes `tokenVersion` and that your login flow puts its current value into the JWT payload.

If your current model does not include it, either add the field consistently to the model and login flow or remove that check.

## 6.2 Role authorization middleware

```javascript
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
}

module.exports = authorize;
```

Usage:

```javascript
router.get(
  "/admin/users",
  authenticate,
  authorize("admin"),
  getAllUsers
);
```

## 6.3 Ownership authorization

We need a reusable way to verify ownership.

Example service:

```javascript
async function getPostForModification(postId, user) {
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const isOwner = post.author.equals(user._id);
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You cannot modify this post");
  }

  return post;
}
```

This is an important distinction:

**Role-based authorization checks what a category of users can do. Ownership authorization checks whether a particular resource belongs to the current user.**

---

# 7. Implement the Post Creation Flow

Let's understand a complete request.

The client sends:

```http
POST /api/v1/posts
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

Body:

```json
{
  "title": "Introduction to Physics",
  "content": "Physics is the study of nature."
}
```

The request passes through:

```text
Request
  |
  v
Authentication
  |
  v
Validation
  |
  v
Controller
  |
  v
Service
  |
  v
Post Model
  |
  v
MongoDB
```

## 7.1 Post validator

```javascript
const { z } = require("zod");

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(150),
  content: z.string().trim().min(10).max(10000)
});

module.exports = {
  createPostSchema
};
```

## 7.2 Post service

```javascript
const Post = require("../models/Post");

async function createPost(data, userId) {
  return Post.create({
    title: data.title,
    content: data.content,
    author: userId
  });
}

module.exports = {
  createPost
};
```

Notice something important:

The client does not provide the author ID.

We take it from the authenticated user.

This prevents a client from creating a post on behalf of another user by changing the request body.

## 7.3 Post controller

```javascript
const postService = require("../services/postService");

async function createPost(req, res, next) {
  try {
    const post = await postService.createPost(
      req.validatedBody,
      req.user._id
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: post
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPost
};
```

If your project already uses `asyncHandler`, you can use that instead of writing `try/catch` in every controller.

## 7.4 Post route

```javascript
const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const { createPostSchema } = require("../validators/postValidator");

const { createPost } = require("../controllers/postController");

router.post(
  "/",
  authenticate,
  validate(createPostSchema),
  createPost
);

module.exports = router;
```

---

# 8. Implement Pagination and Filtering

Imagine our database contains 100,000 posts.

Should we return all 100,000 posts in one API response?

No.

This can cause:

- Large responses.
- Slow database queries.
- High memory usage.
- Poor user experience.

Instead, we use pagination.

Example:

```http
GET /api/v1/posts?page=2&limit=10
```

The database query:

```javascript
const page = Math.max(1, Number(req.query.page) || 1);

const limit = Math.min(
  100,
  Math.max(1, Number(req.query.limit) || 10)
);

const skip = (page - 1) * limit;

const posts = await Post.find()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .populate("author", "name email")
  .lean();
```

Why `lean()`?

Mongoose normally returns full Mongoose documents with additional functionality.

`lean()` returns plain JavaScript objects.

It can reduce overhead for read-only endpoints.

For very large datasets, cursor-based pagination may perform better than large skip values.

## 8.1 Filtering

Example:

```http
GET /api/v1/posts?author=USER_ID
```

Controller logic:

```javascript
const filter = {};

if (req.query.author) {
  filter.author = req.query.author;
}

const posts = await Post.find(filter);
```

In production, validate query parameters and validate that IDs have the correct format before querying.

## 8.2 Searching

Example:

```http
GET /api/v1/posts?search=physics
```

Basic search:

```javascript
const filter = {};

if (req.query.search) {
  filter.title = {
    $regex: req.query.search,
    $options: "i"
  };
}

const posts = await Post.find(filter);
```

For large datasets, consider MongoDB text indexes or a dedicated search service instead of unbounded regular-expression searches.

---

# 9. Security Review

Before considering our API complete, review common security risks.

## 9.1 Never trust client input

A client can modify:

- User IDs.
- Roles.
- Prices.
- Ownership information.
- Resource IDs.
- Request headers.
- Query parameters.

Validate and authorize every operation on the server.

## 9.2 Never store plain-text passwords

Always hash passwords using an appropriate password hashing algorithm.

For example:

```javascript
const hashedPassword = await bcrypt.hash(password, 12);
```

The exact cost factor should be selected and benchmarked for your production environment.

## 9.3 Protect JWTs

Remember:

A JWT payload is encoded, not encrypted.

Do not store sensitive information in its payload.

Use appropriate expiry times and a revocation strategy.

## 9.4 Prevent mass assignment

Suppose an update endpoint accepts:

```json
{
  "name": "Ali",
  "role": "admin",
  "email": "ali@example.com"
}
```

Never blindly pass the entire request body into a database update.

Bad:

```javascript
await User.findByIdAndUpdate(req.user._id, req.body);
```

Better:

```javascript
const updates = {
  name: req.validatedBody.name
};

await User.findByIdAndUpdate(
  req.user._id,
  updates,
  {
    new: true,
    runValidators: true
  }
);
```

Only permit fields that the user is allowed to modify.

## 9.5 Protect against IDOR

IDOR means Insecure Direct Object Reference.

Imagine a user requests:

```http
GET /api/files/123
```

Changing the ID to:

```http
GET /api/files/124
```

must not expose another user's private file.

Always check ownership or permissions before returning protected resources.

---

# 10. Testing the Complete Application

Testing individual functions is useful.

But we also need to test complete HTTP request flows.

For example:

```text
Register
   |
   v
Login
   |
   v
Receive JWT
   |
   v
Create Post
   |
   v
Fetch Post
   |
   v
Update Post
   |
   v
Delete Post
```

Our integration tests should verify:

- Correct HTTP status codes.
- Correct response bodies.
- Database changes.
- Authentication behavior.
- Authorization behavior.
- Validation failures.
- Error responses.

## 10.1 Important security tests

| Scenario | Expected result |
|---|---|
| Register with valid data | 201 |
| Register duplicate email | 409 or documented conflict response |
| Login with wrong password | 401 |
| Access protected endpoint without token | 401 |
| Access admin endpoint as user | 403 |
| Update another user's post | 403 |
| Access nonexistent resource | 404 |
| Submit invalid body | 400 |
| Upload oversized file | 413 or documented upload error |

Your actual status codes should remain consistent with your API's documented error conventions.

## 10.2 Example Supertest test

```javascript
const request = require("supertest");
const app = require("../src/app");

describe("Authentication", () => {
  test("should reject protected requests without a token", async () => {
    const response = await request(app)
      .get("/api/v1/users/profile");

    expect(response.statusCode).toBe(401);

    expect(response.body.success).toBe(false);
  });
});
```

Use a separate test database and clean up test data between tests.

Do not run destructive tests against production data.

---

# 11. Operational Readiness

A complete API is not just code that works on your computer.

It should also be maintainable.

Consider the following:

## Logging

- Log application errors.
- Record useful request information.
- Never log passwords or authorization tokens.

## Monitoring

- Track API availability.
- Track response times.
- Monitor database connection health.
- Monitor server memory and CPU.

## Backups

- Configure database backups.
- Verify restoration.
- Consider file-storage backups separately.

## Documentation

Document:

- Authentication method.
- Endpoints.
- Request bodies.
- Response formats.
- Error codes.
- Required permissions.
- Pagination parameters.

You can use OpenAPI/Swagger to describe your REST API.

---

# 12. Final Capstone Assignment

Your task is to finish the Secure API Platform.

### Phase 1 — Core API

- [ ] Registration
- [ ] Login
- [ ] JWT authentication
- [ ] RBAC
- [ ] Profile management
- [ ] Password management

### Phase 2 — Resource Management

- [ ] Post CRUD
- [ ] Comment CRUD
- [ ] Ownership checks
- [ ] Pagination
- [ ] Filtering
- [ ] Searching

### Phase 3 — Files

- [ ] Avatar uploads
- [ ] Cloud storage
- [ ] File metadata
- [ ] Private file authorization
- [ ] File deletion

### Phase 4 — Quality

- [ ] Centralized error handling
- [ ] Request validation
- [ ] Rate limiting
- [ ] Security headers
- [ ] Automated tests
- [ ] API documentation

### Phase 5 — Deployment

- [ ] MongoDB Atlas
- [ ] Production environment variables
- [ ] VPS or managed deployment
- [ ] PM2
- [ ] Nginx
- [ ] HTTPS
- [ ] Monitoring
- [ ] Backups

---

# 13. Final Knowledge Check

1. What is the difference between a controller and a service?
2. Why should business logic be separated from HTTP handling?
3. What is the relationship between User and Post?
4. Why should the author ID come from the authenticated user?
5. What is the difference between RBAC and ownership authorization?
6. What is mass assignment?
7. What is IDOR?
8. Why do we need pagination?
9. When is `lean()` useful?
10. Why should integration tests use a separate database?
11. What is OpenAPI?
12. What makes an API production-ready?

---

# Chapter Conclusion

You now have the architectural foundation for a complete backend application.

The important lesson is that professional backend development requires more than knowing Express routes and database queries.

You must understand how to design, secure, test, deploy, monitor, and maintain the entire system.

**End of the core REST API learning path.**
