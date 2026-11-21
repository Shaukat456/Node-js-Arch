
# Chapter 9 — Complete User Management API

## Learning Objectives

By the end of this chapter, you will understand:

1. How to update a user's profile.
2. How to implement resource ownership.
3. How admins can manage users.
4. How to update user roles securely.
5. How to delete user accounts.
6. How pagination works.
7. How filtering and searching work.
8. How sorting works.
9. How to build reusable query logic.
10. How to design practical REST endpoints.

---

## 1. Understanding User Management

Imagine we're building a user management system.

We need the following functionality:

| Feature | Normal User | Admin |
|---|---|---|
| View own profile | Yes | Yes |
| Update own profile | Yes | Yes |
| Delete own account | Yes | Yes |
| View all users | No | Yes |
| View another user's profile | No | Yes |
| Update another user's profile | No | Yes |
| Change user role | No | Yes |
| Delete another user | No | Yes |

Notice something important.

We have two separate concepts:

- Role-based access: Is the user an admin?
- Ownership-based access: Does this resource belong to the current user?

For example, a normal user should be able to update their own name but not another user's name.

We'll implement both.

---

## 2. Understand the Endpoints

Let's first design our API.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/users/profile` | Authenticated | Get own profile |
| PATCH | `/api/users/profile` | Authenticated | Update own profile |
| DELETE | `/api/users/profile` | Authenticated | Delete own account |
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/:id` | Admin | Get one user |
| PATCH | `/api/users/:id` | Admin | Update another user |
| PATCH | `/api/users/:id/role` | Admin | Change user role |
| DELETE | `/api/users/:id` | Admin | Delete another user |

Why use `PATCH`?

Because PATCH is commonly used when updating only selected fields of a resource.

For example, a user may want to update only their name without sending their email and other information.

---

## 3. Understand PUT vs PATCH

Both methods are used for updates, but they have different intended semantics.

### PUT

PUT represents replacing a resource with a supplied representation.

Example:

```http
PUT /api/users/123
```

```json
{
  "name": "Ali",
  "email": "ali@example.com"
}
```

### PATCH

PATCH represents applying partial modifications.

Example:

```http
PATCH /api/users/profile
```

```json
{
  "name": "Ali Khan"
}
```

We use PATCH for our profile update endpoints because we want to modify individual fields.

---

## 4. Create Profile Update Validator

We should never directly trust data sent by the frontend.

Suppose a user sends:

```json
{
  "name": "Ali",
  "role": "admin"
}
```

We must not allow this request to change their role.

Create or update:

```text
src/validators/userValidator.js
```

Add:

```js
const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(80)
    .optional(),

  email: z
    .string()
    .trim()
    .email("Invalid email")
    .transform((value) => value.toLowerCase())
    .optional()
})
.strict()
.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided"
  }
);

const updateRoleSchema = z.object({
  role: z.enum(["user", "moderator", "admin"])
}).strict();

module.exports = {
  updateProfileSchema,
  updateRoleSchema
};
```

### Why don't we include password?

Password changes should have a dedicated endpoint with additional security requirements.

For example:

- Verify the current password.
- Validate the new password.
- Hash the new password.
- Update the stored hash.

We'll implement that separately.

### Why don't we include role?

Because a normal user should not be able to promote themselves to admin.

Role updates will use a separate admin-only endpoint.

---

## 5. Create the Update Profile Controller

Open:

```text
src/controllers/userController.js
```

Add:

```js
const updateProfile = async (req, res) => {
  try {
    const updates = req.validatedBody;

    // Update only the authenticated user's document
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: updates
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### Understand the important parts

#### A. req.validatedBody

```js
const updates = req.validatedBody;
```

Our validation middleware validates the request body and stores the result in `req.validatedBody`.

We use this validated data instead of directly trusting `req.body`.

#### B. findByIdAndUpdate()

```js
User.findByIdAndUpdate(
  req.user.id,
  { $set: updates },
  {
    new: true,
    runValidators: true
  }
);
```

Let's understand the arguments.

| Argument | Purpose |
|---|---|
| `req.user.id` | Identifies the document to update |
| `$set: updates` | Changes only supplied fields |
| `new: true` | Returns the updated document |
| `runValidators: true` | Runs applicable schema validators |

Notice that the user ID comes from:

```js
req.user.id
```

It does not come from the request body.

This prevents a normal user from choosing another user's ID to update.

---

## 6. Add the Profile Update Route

Open:

```text
src/routes/userRoutes.js
```

Import the validator:

```js
const validate = require("../middleware/validate");

const {
  updateProfileSchema,
  updateRoleSchema
} = require("../validators/userValidator");
```

Import the controller:

```js
const {
  getProfile,
  updateProfile
} = require("../controllers/userController");
```

Add the route:

```js
router.patch(
  "/profile",
  protect,
  validate(updateProfileSchema),
  updateProfile
);
```

The request flow:

```text
PATCH /api/users/profile
          |
          v
     protect
          |
          v
 validate()
          |
          v
 updateProfile
          |
          v
       MongoDB
```

---

## 7. Implement Delete Own Account

A user should also be able to delete their own account.

Add this controller:

```js
const deleteOwnAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

Add the route:

```js
router.delete(
  "/profile",
  protect,
  deleteOwnAccount
);
```

### Why is this safe?

We use:

```js
req.user.id
```

The user cannot specify another user's ID.

Therefore, this endpoint only deletes the authenticated user's account.

**Production consideration:** Account deletion may also require deleting or anonymizing related records, invalidating sessions, and handling audit records. We'll keep this endpoint focused on the User document for now.

---

## 8. Admin: Get All Users

We already implemented a basic version in Chapter 8.

Now let's improve it with pagination, search, filtering, and sorting.

First, understand why we need these features.

Imagine our database has 100,000 users.

Should we return all 100,000 users in one response?

No.

That would consume unnecessary memory and bandwidth.

Instead, we return a limited number of users per request.

This is pagination.

---

## 9. Understanding Pagination

Pagination divides a large collection into smaller pages.

Imagine we have 100 users and want to show 10 users per page.

```text
Page 1: Users 1–10
Page 2: Users 11–20
Page 3: Users 21–30
...
Page 10: Users 91–100
```

We can implement pagination using two query parameters:

```text
page
limit
```

Example:

```http
GET /api/users?page=2&limit=10
```

This means:

- Page number = 2
- Users per page = 10

### How does MongoDB pagination work?

Mongoose provides:

```js
.skip()
.limit()
```

Suppose:

```js
const page = 2;
const limit = 10;
```

We calculate:

```js
const skip = (page - 1) * limit;
```

Therefore:

```js
skip = (2 - 1) * 10;

// skip = 10
```

MongoDB skips the first 10 documents and returns the next 10.

---

## 10. Understanding Search and Filtering

Pagination controls how many documents we return.

Search and filtering control which documents we return.

### Search

Suppose we want to find users by name or email.

Request:

```http
GET /api/users?search=ali
```

We can use MongoDB regular expressions:

```js
{
  $or: [
    { name: { $regex: "ali", $options: "i" } },
    { email: { $regex: "ali", $options: "i" } }
  ]
}
```

Explanation:

- `$or`: At least one condition must match.
- `$regex`: Pattern matching.
- `$options: "i"`: Case-insensitive search.

### Filtering

Suppose we only want administrators.

Request:

```http
GET /api/users?role=admin
```

MongoDB filter:

```js
{
  role: "admin"
}
```

### Sorting

Suppose we want newest users first.

Request:

```http
GET /api/users?sort=createdAt&order=desc
```

Mongoose:

```js
.sort({ createdAt: -1 })
```

Sorting values:

| Value | Meaning |
|---|---|
| `1` | Ascending |
| `-1` | Descending |

---

## 11. Build the Complete Get All Users Controller

Replace your previous `getAllUsers` controller with:

```js
const getAllUsers = async (req, res) => {
  try {
    // 1. Pagination parameters
    const page = Math.max(
      1,
      parseInt(req.query.page, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 10)
    );

    const skip = (page - 1) * limit;

    // 2. Build filter
    const filter = {};

    if (req.query.role) {
      const allowedRoles = ["user", "moderator", "admin"];

      if (!allowedRoles.includes(req.query.role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter"
        });
      }

      filter.role = req.query.role;
    }

    // 3. Search
    if (req.query.search) {
      const search = req.query.search.trim();

      if (search.length > 80) {
        return res.status(400).json({
          success: false,
          message: "Search term is too long"
        });
      }

      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(
        escapedSearch,
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    // 4. Sorting
    const allowedSortFields = [
      "name",
      "email",
      "createdAt"
    ];

    const sortField = allowedSortFields.includes(
      req.query.sort
    )
      ? req.query.sort
      : "createdAt";

    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const sort = {
      [sortField]: sortOrder,
      _id: 1
    };

    // 5. Fetch data and total count
    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      User.countDocuments(filter)
    ]);

    // 6. Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,

      pagination: {
        currentPage: page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },

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
```

### Let's understand the complete query.

#### A. Read query parameters

```js
req.query.page
req.query.limit
req.query.search
req.query.role
req.query.sort
req.query.order
```

For this request:

```http
GET /api/users?page=2&limit=10&role=user
```

Express gives us:

```js
req.query = {
  page: "2",
  limit: "10",
  role: "user"
};
```

Notice that query parameter values are strings.

That's why we use `parseInt()` for numeric values.

#### B. Why use Math.min() and Math.max()?

```js
const limit = Math.min(
  100,
  Math.max(1, parseInt(req.query.limit, 10) || 10)
);
```

This ensures:

- Minimum limit = 1
- Maximum limit = 100
- Default limit = 10

Without a maximum, someone could request:

```http
GET /api/users?limit=1000000
```

We don't want to allow unlimited database results.

#### C. Why use Promise.all()?

```js
const [users, totalUsers] = await Promise.all([
  User.find(filter),
  User.countDocuments(filter)
]);
```

We have two independent database operations:

1. Fetch the current page.
2. Count all matching documents.

`Promise.all()` allows both operations to run concurrently.

#### D. Why use lean()?

```js
.lean()
```

By default, Mongoose returns full Mongoose documents.

`lean()` returns plain JavaScript objects instead.

It can improve read performance when we don't need Mongoose document methods or change tracking.

#### E. Why escape the search term?

We create a regular expression from user-provided text.

Escaping special regular-expression characters prevents the search term from unintentionally behaving like a regular expression pattern.

For large collections, unindexed regular-expression searches can still be expensive. A dedicated text-search solution or indexed search strategy may be more appropriate.

---

## 12. Test Pagination, Search, Filtering, and Sorting

All these endpoints require an admin token.

### Pagination

```http
GET /api/users?page=2&limit=10
```

### Search

```http
GET /api/users?search=ali
```

### Filter by role

```http
GET /api/users?role=admin
```

### Sorting

```http
GET /api/users?sort=name&order=asc
```

### Combine everything

```http
GET /api/users?page=1&limit=5&role=user&search=ali&sort=createdAt&order=desc
```

Expected response structure:

```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "limit": 5,
    "totalUsers": 20,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "users": [
    {
      "_id": "671a123456789abcdef12345",
      "name": "Ali",
      "email": "ali@example.com",
      "role": "user"
    }
  ]
}
```

The example contains one user for illustration; your actual response depends on your database.

---

## 13. Admin: Get One User

Create a controller:

```js
const mongoose = require("mongoose");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

This endpoint is intended for administrators.

Route:

```js
router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);
```

---

## 14. Admin: Update Another User

An administrator may need to update a user's name or email.

We will not allow this endpoint to change roles.

Role changes will have their own endpoint.

Create a validator:

```js
const adminUpdateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .optional(),

  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
    .optional()
})
.strict()
.refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field must be provided"
  }
);
```

Add controller:

```js
const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: req.validatedBody
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    console.error("Admin update error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

Route:

```js
router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validate(adminUpdateUserSchema),
  updateUserByAdmin
);
```

---

## 15. Admin: Change User Role

Now let's implement an important administrative operation.

An admin should be able to change a user's role.

For example:

```text
user -> moderator
moderator -> admin
admin -> user
```

This is a sensitive operation, so only administrators can perform it.

### Controller

```js
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.validatedBody;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Prevent accidental self-demotion
    if (req.user.id === id && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role"
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { role }
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Role update error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### Route

```js
router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  validate(updateRoleSchema),
  updateUserRole
);
```

### Test request

```http
PATCH /api/users/USER_ID/role
```

Body:

```json
{
  "role": "moderator"
}
```

Expected response:

```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": "671a123456789abcdef12345",
    "name": "Ali",
    "email": "ali@example.com",
    "role": "moderator"
  }
}
```

Remember: Changing the database role does not automatically update previously issued JWTs.

Our current authentication middleware trusts the role claim from the verified token. In a later security improvement, we will make authorization use the current database role.

---

## 16. Admin: Delete Another User

We implemented a basic delete endpoint in Chapter 8.

Keep the existing implementation, but ensure it:

- Validates the MongoDB ID.
- Checks whether the user exists.
- Does not return sensitive information.
- Is protected by admin authorization.

Route:

```js
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);
```

An admin can now delete another account.

---

## 17. Complete User Routes

Your `src/routes/userRoutes.js` should now look like this:

```js
const express = require("express");

const router = express.Router();

const {
  protect
} = require("../middleware/authMiddleware");

const authorize = require("../middleware/authorize");

const validate = require("../middleware/validate");

const {
  updateProfileSchema,
  updateRoleSchema,
  adminUpdateUserSchema
} = require("../validators/userValidator");

const {
  getProfile,
  updateProfile,
  deleteOwnAccount,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");

// Authenticated users

router.get(
  "/profile",
  protect,
  getProfile
);

router.patch(
  "/profile",
  protect,
  validate(updateProfileSchema),
  updateProfile
);

router.delete(
  "/profile",
  protect,
  deleteOwnAccount
);

// Admin operations

router.get(
  "/",
  protect,
  authorize("admin"),
  getAllUsers
);

router.get(
  "/:id",
  protect,
  authorize("admin"),
  getUserById
);

router.patch(
  "/:id",
  protect,
  authorize("admin"),
  validate(adminUpdateUserSchema),
  updateUserByAdmin
);

router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  validate(updateRoleSchema),
  updateUserRole
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteUser
);

module.exports = router;
```

**Important:** Make sure every controller and validator shown in this chapter is exported from its corresponding file. Keep your existing registration, login, and profile controllers instead of replacing them.

Also, define `/profile` routes before `/:id` routes. This makes the routing structure easier to understand and avoids route conflicts if you add more endpoints later.

---

## 18. Complete API Overview

Our API now supports:

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |

### Normal User Operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users/profile` | View own profile |
| PATCH | `/api/users/profile` | Update own profile |
| DELETE | `/api/users/profile` | Delete own account |

### Admin Operations

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get one user |
| PATCH | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id/role` | Change user role |
| DELETE | `/api/users/:id` | Delete user |

---

## 19. Exercises

Complete these exercises yourself.

### Exercise 1 — Add Phone Number

Add a `phone` field to the User model.

Allow users to update their own phone number.

### Exercise 2 — Add Account Status

Add:

```js
isActive: {
  type: Boolean,
  default: true
}
```

Allow admins to deactivate accounts.

### Exercise 3 — Prevent Inactive Users

Modify authentication middleware so inactive accounts cannot access protected endpoints.

### Exercise 4 — Add Search by Name

Create an endpoint that searches users by name.

### Exercise 5 — Add Minimum and Maximum Pagination Limits

Ensure:

- Page cannot be negative.
- Limit cannot exceed 100.
- Invalid values are handled properly.

### Exercise 6 — Protect Admin Accounts

Prevent an admin from deleting the last active administrator.

Hint: Before deletion, count the remaining active admin accounts.

### Exercise 7 — Audit Role Changes

Whenever an admin changes another user's role, record:

- Admin ID.
- Target user ID.
- Previous role.
- New role.
- Timestamp.

This is useful for auditing sensitive operations.

---

## 20. Knowledge Check

1. What is the difference between PUT and PATCH?
2. Why do we use `req.user.id` for updating a user's own profile?
3. What is resource ownership?
4. What is pagination?
5. What is the purpose of `.skip()`?
6. What is the purpose of `.limit()`?
7. What does `countDocuments()` return?
8. What is the difference between filtering and searching?
9. What is the purpose of MongoDB `$or`?
10. What does `.sort({ createdAt: -1 })` mean?
11. Why should role changes have a separate endpoint?
12. Why is changing a role in MongoDB not enough to update an existing JWT?
13. Why should we restrict the maximum pagination limit?
14. Why should password updates use a separate endpoint?

---

## 21. What We Have Built

We now have a practical user management API.

It supports:

- Registration.
- Login.
- JWT authentication.
- Role-based authorization.
- User profile management.
- Admin user management.
- User role management.
- Pagination.
- Searching.
- Filtering.
- Sorting.

Our project is becoming a real-world REST API rather than just a collection of CRUD endpoints.

---

## Next Chapter — Password Management & Account Security

We will implement:

1. Change password.
2. Secure password updates.
3. Forgot password.
4. Reset password using a secure token.
5. Token hashing and expiration.
6. Password confirmation.
7. Preventing password reuse.
8. Account security considerations.

**Goal:** Build a secure password management workflow for our REST API.
