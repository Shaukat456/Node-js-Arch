
# Chapter 8 — Role-Based Access Control (RBAC)

## Learning Objectives

By the end of this chapter, you will understand:

1. What authorization means.
2. What RBAC is.
3. The difference between authentication and authorization.
4. Roles and permissions.
5. How to create authorization middleware.
6. How to restrict routes based on roles.
7. How to implement admin-only endpoints.
8. How to handle `403 Forbidden`.
9. How to avoid common RBAC security mistakes.

---

## 1. Authentication vs Authorization

Let's understand the difference first.

Imagine you enter a university.

At the entrance, security checks your student card.

This answers:

**Who are you?**

This is authentication.

Now imagine you enter the university successfully.

Can you access the principal's office, examination records, and server room?

No.

You may be authenticated, but you don't necessarily have permission to access everything.

This is authorization.

### In our API

Authentication:

```text
Client sends JWT
       |
       v
JWT Middleware
       |
       v
Token verified
       |
       v
User identified
```

Authorization:

```text
Authenticated User
       |
       v
Check user's role
       |
       v
Is this role allowed?
       |
       +---- Yes ----> Continue
       |
       +---- No -----> 403 Forbidden
```

### Important distinction

| Authentication | Authorization |
|---|---|
| Who are you? | What can you do? |
| Verifies identity | Checks permissions |
| Uses JWT verification | Uses roles/permissions |
| Usually returns 401 on failure | Usually returns 403 on failure |

Remember:

- `401 Unauthorized`: Authentication is missing or invalid.
- `403 Forbidden`: Authentication succeeded, but access is not allowed.

---

## 2. What Is Role-Based Access Control?

RBAC stands for **Role-Based Access Control**.

It is an authorization model in which permissions are assigned to roles, and users are assigned those roles.

Instead of assigning individual permissions to every user, we group permissions into roles.

For example:

```text
                  SYSTEM
                    |
          ---------------------
          |         |         |
        USER    MODERATOR    ADMIN
          |         |         |
       Profile   Moderate    Manage
       Access    Content     Users
```

Let's use a practical example.

Imagine we are building a student management system.

We have three roles:

### User

A normal registered user.

Permissions:

- View own profile.
- Update own profile.
- View available courses.

### Moderator

A moderator manages content.

Permissions:

- Everything a normal user can do.
- Review reported content.
- Remove inappropriate content.

### Admin

An administrator manages the system.

Permissions:

- Manage users.
- Delete users.
- Change user roles.
- Access administrative endpoints.

Our first implementation will use these three roles.

---

## 3. Roles vs Permissions

These two terms are related, but they are not the same.

### Role

A role describes the user's responsibility or access category.

Examples:

```text
user
moderator
admin
```

### Permission

A permission describes a specific action that a user can perform.

Examples:

```text
users:read
users:create
users:update
users:delete

content:read
content:moderate
content:delete
```

Think of it this way:

**Role = A collection of permissions.**

For example:

```text
USER
  |
  +-- users:read:own
  +-- users:update:own

MODERATOR
  |
  +-- users:read:own
  +-- users:update:own
  +-- content:read
  +-- content:moderate

ADMIN
  |
  +-- users:read
  +-- users:create
  +-- users:update
  +-- users:delete
  +-- users:assign-role
  +-- content:moderate
```

For now, we will implement role-based authorization directly.

Later, we can extend it to permission-based authorization.

---

## 4. Our Existing User Model

In Chapter 4, we created a User model with a role field.

Open:

```text
src/models/User.js
```

It should contain something similar to:

```js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
```

Let's understand these two important properties.

### A. enum

```js
enum: ["user", "moderator", "admin"]
```

This restricts the role to the listed values when Mongoose validation runs.

For example:

```js
role: "admin"
```

Valid.

But:

```js
role: "superuser"
```

Invalid.

### B. default

```js
default: "user"
```

When a user registers without specifying a role, MongoDB receives a document with:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "role": "user"
}
```

The role is automatically set to `user`.

**Security rule:** Never allow a public registration request to assign itself the `admin` role.

Our registration validator should reject unexpected fields, and the registration controller should never copy a client-provided role into the user document.

---

## 5. The Problem With Our Current Authentication Middleware

Remember our previous middleware?

```js
req.user = {
  id: decoded.userId,
  role: decoded.role
};
```

After JWT verification, we have:

```js
req.user = {
  id: "123",
  role: "user"
};
```

Now we know who is making the request.

But we still haven't checked whether the user is allowed to perform a particular action.

We need another middleware.

Let's call it:

```js
authorize()
```

Its responsibility will be:

1. Read the authenticated user's role.
2. Compare it with the allowed roles.
3. Continue if the role is allowed.
4. Reject the request otherwise.

---

## 6. Create Authorization Middleware

Create:

```text
src/middleware/authorize.js
```

Add:

```js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {

    // Check authentication middleware ran first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    // User is authorized
    next();
  };
};

module.exports = authorize;
```

Let's understand this code carefully.

### A. Why do we use `...allowedRoles`?

This is JavaScript's rest parameter syntax.

It allows us to pass multiple arguments.

For example:

```js
authorize("admin");
```

Inside the function:

```js
allowedRoles = ["admin"];
```

And:

```js
authorize("admin", "moderator");
```

Produces:

```js
allowedRoles = ["admin", "moderator"];
```

### B. Why return another function?

Look at:

```js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // Authorization logic
  };
};
```

This is a higher-order function.

A higher-order function is a function that returns another function or accepts a function as an argument.

Here:

```js
authorize("admin")
```

does not directly perform authorization.

It creates and returns middleware configured to allow admins.

Express then executes the returned middleware for each matching request.

### C. Check the user's role

```js
if (!allowedRoles.includes(req.user.role)) {
```

Suppose:

```js
allowedRoles = ["admin"];
```

And:

```js
req.user.role = "user";
```

Then:

```js
allowedRoles.includes("user");
```

Returns:

```js
false
```

Therefore, we return:

```http
403 Forbidden
```

### D. Why call next()?

```js
next();
```

If the user's role is allowed, the request continues to the controller.

---

## 7. Authentication and Authorization Together

Now we have two middleware functions.

### Authentication middleware

```js
protect
```

It answers:

**Is this a valid authenticated user?**

### Authorization middleware

```js
authorize("admin")
```

It answers:

**Is this user an admin?**

We combine them like this:

```js
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  deleteUser
);
```

The execution order is:

```text
Request
   |
   v
protect
   |
   | Is JWT valid?
   |
   +---- No ----> 401
   |
   v
authorize("admin")
   |
   | Is user admin?
   |
   +---- No ----> 403
   |
   v
deleteUser Controller
   |
   v
Response
```

Notice the order.

We must authenticate the user before checking their role.

Otherwise, `req.user` may not exist.

---

## 8. Create an Admin-Only Endpoint

Now let's build a practical feature.

We want administrators to see all registered users.

Endpoint:

```http
GET /api/users
```

Only admins should access it.

### Step 1: Create the controller

Open:

```text
src/controllers/userController.js
```

Add:

```js
const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  getProfile,
  getAllUsers
};
```

If `getProfile` was already exported, keep it in the export object.

Notice:

```js
.select("-password");
```

This explicitly excludes the password field from the result.

Although our schema already uses `select: false`, explicitly excluding it here makes our intention clear.

### Step 2: Add the route

Open:

```text
src/routes/userRoutes.js
```

Update it:

```js
const express = require("express");

const router = express.Router();

const {
  protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const {
  getProfile,
  getAllUsers
} = require("../controllers/userController");

// Any authenticated user
router.get("/profile", protect, getProfile);

// Admin only
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

module.exports = router;
```

Now:

```http
GET /api/users/profile
```

is accessible to authenticated users.

But:

```http
GET /api/users
```

is accessible only to admins.

---

## 9. Allow Multiple Roles

Suppose moderators and admins should both be allowed to access a content moderation endpoint.

We can write:

```js
router.delete(
  "/content/:id",
  protect,
  authorize("admin", "moderator"),
  deleteContent
);
```

This means:

```js
allowedRoles = ["admin", "moderator"];
```

If the authenticated user's role is either of these, access is granted.

Examples:

| User role | Allowed roles | Result |
|---|---|---|
| user | admin | 403 |
| moderator | admin | 403 |
| admin | admin | Allowed |
| moderator | admin, moderator | Allowed |
| admin | admin, moderator | Allowed |

---

## 10. Create an Admin-Only User Deletion Endpoint

Let's extend our API.

We want administrators to delete users.

Endpoint:

```http
DELETE /api/users/:id
```

### Step 1: Create controller

In:

```text
src/controllers/userController.js
```

Add:

```js
const mongoose = require("mongoose");

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

Make sure the top of the controller contains:

```js
const User = require("../models/User");
const mongoose = require("mongoose");
```

And export the controller:

```js
module.exports = {
  getProfile,
  getAllUsers,
  deleteUser
};
```

### Step 2: Add the route

In `userRoutes.js`:

```js
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);
```

Now only an authenticated admin can delete a user.

---

## 11. Our Complete User Routes

Your `userRoutes.js` should now look like this:

```js
const express = require("express");

const router = express.Router();

const {
  protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const {
  getProfile,
  getAllUsers,
  deleteUser
} = require("../controllers/userController");

// Authenticated users
router.get(
  "/profile",
  protect,
  getProfile
);

// Admin only
router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

// Admin only
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;
```

Our API now has:

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/profile` | Any authenticated user |
| GET | `/api/users` | Admin |
| DELETE | `/api/users/:id` | Admin |

---

## 12. How Do We Test Admin Access?

There is one challenge.

Our public registration endpoint creates users with:

```js
role: "user"
```

We intentionally do not allow public users to register as admins.

So how do we test admin functionality?

For development, you can manually update a user's role in MongoDB.

For example, using MongoDB Shell:

```javascript
use secure_api

db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

First, register an ordinary account using the API.

Then update its role manually in your development database.

Log in again to receive a token containing the new role.

**Why log in again?**

Our current JWT includes the role at the time of login.

If you update the database role, an already-issued token does not automatically change.

For production, role assignment must be performed through a properly protected administrative process. Never expose a public endpoint that lets users promote themselves.

---

## 13. Postman Testing

Let's test three different scenarios.

### Test A: Normal user accesses profile

Request:

```http
GET http://localhost:3000/api/users/profile
```

Authorization:

```text
Bearer NORMAL_USER_TOKEN
```

Expected:

```text
200 OK
```

### Test B: Normal user accesses all users

Request:

```http
GET http://localhost:3000/api/users
```

Authorization:

```text
Bearer NORMAL_USER_TOKEN
```

Expected:

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

Status:

```text
403 Forbidden
```

Why?

The user is authenticated, but their role is `user`, not `admin`.

### Test C: Admin accesses all users

Request:

```http
GET http://localhost:3000/api/users
```

Authorization:

```text
Bearer ADMIN_TOKEN
```

Expected:

```text
200 OK
```

The API returns the registered users.

### Test D: Normal user deletes another user

Request:

```http
DELETE http://localhost:3000/api/users/USER_ID
```

Authorization:

```text
Bearer NORMAL_USER_TOKEN
```

Expected:

```text
403 Forbidden
```

### Test E: Admin deletes a user

Use:

```text
Bearer ADMIN_TOKEN
```

Expected:

```text
200 OK
```

The user is deleted.

---

## 14. Important RBAC Security Rules

### Rule 1: Never trust the client-provided role

A user might send:

```json
{
  "role": "admin"
}
```

The backend must never use this value to grant permissions.

Roles should be assigned by trusted server-side logic.

### Rule 2: Authentication must run first

Correct:

```js
protect,
authorize("admin"),
deleteUser
```

Incorrect:

```js
authorize("admin"),
protect,
deleteUser
```

The authorization middleware depends on the authenticated identity.

### Rule 3: Do not expose sensitive data

Even admin endpoints should return only the information they need.

Avoid returning password hashes or secrets.

### Rule 4: Check resource ownership

Consider this endpoint:

```http
GET /api/users/:id
```

Should a normal user be allowed to view every user's information?

Not necessarily.

Even if the role is `user`, the application may allow access only when:

```js
req.user.id === req.params.id
```

This is called resource ownership checking.

Role checks and ownership checks solve different problems.

### Rule 5: Validate IDs and input

Never assume route parameters are valid MongoDB IDs.

Validate them before database operations.

### Rule 6: Do not rely blindly on stale JWT roles

If roles can change, remember that a token may contain an outdated role.

For stronger authorization, load the current user's role from the database or implement a revocation/version strategy.

---

## 15. Exercises

Complete these tasks yourself.

### Exercise 1 — Admin Dashboard

Create:

```http
GET /api/admin/dashboard
```

Only admins should access it.

Expected response:

```json
{
  "success": true,
  "message": "Welcome to the admin dashboard"
}
```

### Exercise 2 — Moderator Endpoint

Create:

```http
GET /api/moderator/dashboard
```

Allow:

- moderator
- admin

Reject normal users.

### Exercise 3 — Role Checking

Create an endpoint that returns the authenticated user's role.

Hint:

```js
req.user.role
```

### Exercise 4 — Ownership Checking

Create:

```http
GET /api/users/:id
```

Allow users to access their own profile.

Allow admins to access any user's profile.

Think about how to combine:

- Authentication middleware.
- Ownership checks.
- Role checks.

### Exercise 5 — Prevent Self-Deletion

Modify the admin delete endpoint so an admin cannot accidentally delete their own account.

Hint:

```js
if (req.user.id === id) {
  // Reject deletion
}
```

---

## 16. Knowledge Check

Answer these questions before moving on.

1. What is RBAC?
2. What is the difference between a role and a permission?
3. Why do we need authorization after authentication?
4. What does `authorize("admin")` do?
5. What is a higher-order function?
6. Why does our authorization middleware return another function?
7. What is the difference between HTTP 401 and HTTP 403?
8. Why must `protect` execute before `authorize`?
9. Why should users not be allowed to assign their own roles?
10. What is resource ownership?
11. Why can a JWT contain an outdated role?
12. How can we support multiple roles on a single endpoint?

---

## 17. What We Have Built

Our application now has three main roles:

| Role | Access |
|---|---|
| user | Own profile and authenticated endpoints |
| moderator | User-level access plus moderation endpoints |
| admin | Administrative endpoints |

Our API supports:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/users/profile
GET    /api/users
DELETE /api/users/:id
```

We have implemented:

- JWT authentication.
- Authentication middleware.
- Authorization middleware.
- Role-based access control.
- Admin-only routes.
- Multiple-role access.
- Ownership-checking concepts.

---

## Next Chapter — Complete User Management API

Now we will expand our project into a more complete user management system.

Topics:

1. Update user profile.
2. Delete user account.
3. Admin creates users.
4. Admin updates user roles.
5. Pagination.
6. Search and filtering.
7. Sorting.
8. Proper validation and error handling.
9. Resource ownership.
10. Improving the API's overall structure.

**Goal:** Build a practical REST API with registration, login, authentication, authorization, and complete user management.
