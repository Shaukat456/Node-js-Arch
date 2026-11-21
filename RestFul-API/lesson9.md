
# Chapter 10 — Password Management & Account Security

## Learning Objectives

By the end of this chapter, you will understand:

1. How to securely change a password.
2. How to verify the current password.
3. How to hash a new password.
4. How forgot-password functionality works.
5. How password-reset tokens work.
6. Why reset tokens should be hashed in the database.
7. How token expiration works.
8. How to invalidate a password-reset token after use.
9. How to prevent password reuse.
10. Important account security practices.

---

# Part 1 — Change Password

## 1. Understanding Change Password

Imagine a user is logged in and wants to change their password.

Their existing password is:

```text
oldPassword123
```

They want to change it to:

```text
newPassword456
```

Should we simply accept the new password?

No.

First, we should verify that the user knows their current password.

Otherwise, someone who gains access to an unattended logged-in session could change the account password without knowing the original password.

### Change password flow

```text
User
  |
  | Current password + New password
  v
PATCH /api/users/change-password
  |
  v
Authentication Middleware
  |
  v
Find Authenticated User
  |
  v
Verify Current Password
  |
  +---- Incorrect ----> 401 Unauthorized
  |
  v
Hash New Password
  |
  v
Save New Password
  |
  v
Success Response
```

## 2. Design the Endpoint

We'll create:

```http
PATCH /api/users/change-password
```

Request body:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

Why PATCH?

Because we're modifying a specific part of the user resource: the password.

This endpoint must be protected because only authenticated users should be able to change their own passwords.

---

## 3. Create Password Validation Schema

Open:

```text
src/validators/userValidator.js
```

Add:

```js
const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Current password is required"),

  newPassword: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password exceeds bcrypt's 72-byte limit"
    )
})
.strict()
.refine(
  (data) => data.currentPassword !== data.newPassword,
  {
    message: "New password must be different from current password",
    path: ["newPassword"]
  }
);
```

Export it:

```js
module.exports = {
  updateProfileSchema,
  updateRoleSchema,
  adminUpdateUserSchema,
  changePasswordSchema
};
```

### Why the 72-byte restriction?

Bcrypt processes a maximum of 72 bytes of password input.

This is important because 72 characters and 72 bytes are not always the same.

For example, some Unicode characters require multiple bytes.

We use:

```js
Buffer.byteLength(value, "utf8")
```

to calculate the actual byte length.

---

## 4. Implement Change Password Controller

Open:

```text
src/controllers/userController.js
```

Add:

```js
const bcrypt = require("bcrypt");

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword
    } = req.validatedBody;

    // Find authenticated user and retrieve password hash
    const user = await User.findById(req.user.id)
      .select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    // Save new password
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### Understand the code

**Step 1 — Find the user**

```js
const user = await User.findById(req.user.id)
  .select("+password");
```

We use the authenticated user's ID.

We do not accept a user ID from the request body.

Also, remember that the password field has `select: false`, so we explicitly retrieve it.

**Step 2 — Verify current password**

```js
const isCorrect = await bcrypt.compare(
  currentPassword,
  user.password
);
```

If the comparison returns `false`, the password is incorrect.

**Step 3 — Hash the new password**

```js
const hashedPassword = await bcrypt.hash(
  newPassword,
  12
);
```

We never store the plain-text password.

**Step 4 — Save**

```js
user.password = hashedPassword;

await user.save();
```

Mongoose saves the updated password hash.

---

## 5. Add the Change Password Route

Open:

```text
src/routes/userRoutes.js
```

Import the validator:

```js
const {
  changePasswordSchema
} = require("../validators/userValidator");
```

Import the controller:

```js
const {
  changePassword
} = require("../controllers/userController");
```

Add:

```js
router.patch(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);
```

Our request flow is:

```text
Request
   |
   v
protect
   |
   v
validate(changePasswordSchema)
   |
   v
changePassword
   |
   v
MongoDB
```

### Test with Postman

Request:

```http
PATCH http://localhost:3000/api/users/change-password
```

Authorization:

```text
Bearer YOUR_JWT_TOKEN
```

Body:

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

Expected response:

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

Try logging in with the old password.

It should fail.

Try logging in with the new password.

It should succeed.

---

# Part 2 — Forgot Password

## 6. Understanding Forgot Password

Now imagine a user forgets their password.

They cannot log in because they don't remember their credentials.

We need a way to allow them to recover access to their account.

A typical workflow is:

1. User submits their registered email.
2. Backend finds the account.
3. Backend generates a secure random reset token.
4. Backend stores a hash of the token and an expiration time.
5. Backend sends the original token to the user's registered email.
6. User opens the reset link.
7. User submits the token and a new password.
8. Backend verifies the token and updates the password.

### Forgot password flow

```text
User
  |
  | Registered email
  v
POST /api/auth/forgot-password
  |
  v
Find User
  |
  v
Generate Random Token
  |
  v
Hash Token
  |
  v
Save Hash + Expiration
  |
  v
Email Original Token
```

The actual email delivery will be added later. For now, we'll build the backend workflow and use a development-only reset link for testing.

---

## 7. Why Do We Need a Random Reset Token?

Why not simply send a new password to the user's email?

Because the backend should not generate and send a permanent password on behalf of the user.

Instead, we generate a temporary token.

For example:

```text
reset-token-123456
```

The user can use this token to prove that they have access to the registered email account.

The token should:

- Be unpredictable.
- Be temporary.
- Work only once.
- Be stored securely.

We can generate a secure random token using Node.js's built-in `crypto` module.

```js
const crypto = require("crypto");

const resetToken = crypto
  .randomBytes(32)
  .toString("hex");

console.log(resetToken);
```

This produces a cryptographically secure random value.

---

## 8. Why Hash the Reset Token?

This is an important security concept.

Suppose we save the original reset token directly in MongoDB.

If someone gains read access to our database, they could use an active reset token to change a user's password.

Instead, we save only its hash.

The process is:

```text
Original Token
      |
      v
   SHA-256
      |
      v
 Hashed Token
      |
      v
 Save in MongoDB
```

The original token is sent to the user.

When the user submits it, we hash it again and compare it with the database value.

Because SHA-256 is deterministic:

```text
SHA256(originalToken) = storedTokenHash
```

This is different from password hashing.

For passwords, we use bcrypt because passwords are human-selected and often predictable.

For a cryptographically random token with sufficient entropy, SHA-256 is suitable for storing its hash.

---

## 9. Add Reset Fields to User Model

Open:

```text
src/models/User.js
```

Add two fields:

```js
passwordResetToken: {
  type: String,
  select: false
},

passwordResetExpires: {
  type: Date,
  select: false
}
```

Your schema will now contain:

```js
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
    },

    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);
```

Why use `select: false` for reset fields?

Because these values should not appear in normal user queries.

---

## 10. Create Forgot Password Validator

Open:

```text
src/validators/authValidator.js
```

Add:

```js
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((value) => value.toLowerCase())
}).strict();
```

Export it:

```js
module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema
};
```

---

## 11. Implement Forgot Password Controller

Open:

```text
src/controllers/authController.js
```

Add:

```js
const crypto = require("crypto");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.validatedBody;

    const user = await User.findOne({ email });

    // Use the same response whether the account exists or not
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the account exists, a reset link will be sent."
      });
    }

    // Generate secure random token
    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    // Hash the token before saving
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save token hash and expiration
    user.passwordResetToken = hashedToken;

    user.passwordResetExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save({ validateBeforeSave: false });

    // Development-only reset link
    const resetUrl =
      `http://localhost:3000/reset-password/${resetToken}`;

    console.log("Development reset URL:", resetUrl);

    return res.status(200).json({
      success: true,
      message: "If the account exists, a reset link will be sent."
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### Understand the important parts

**Generate token:**

```js
crypto.randomBytes(32).toString("hex");
```

This generates 32 random bytes and converts them to a hexadecimal string.

**Hash token:**

```js
crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");
```

This produces a SHA-256 hash.

**Set expiration:**

```js
new Date(Date.now() + 10 * 60 * 1000);
```

Let's calculate:

```text
10 minutes
× 60 seconds
× 1000 milliseconds
```

The token expires after 10 minutes.

**Save without running all document validation:**

```js
await user.save({ validateBeforeSave: false });
```

Here, we are updating only reset fields.

This avoids unrelated validation problems in existing documents. It does not disable MongoDB or application-level security checks generally, so use it carefully.

### Important development note

The reset URL is currently printed to the terminal.

This is only for local development.

In production, send the link using an email provider and never expose the reset token in the API response or application logs.

Also, always use a generic response so attackers cannot determine whether an email address is registered.

---

## 12. Add Forgot Password Route

Open:

```text
src/routes/authRoutes.js
```

Import:

```js
const {
  forgotPassword
} = require("../controllers/authController");

const {
  forgotPasswordSchema
} = require("../validators/authValidator");
```

Add:

```js
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPassword
);
```

Our authentication endpoints now include:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
```

---

# Part 3 — Reset Password

## 13. Understanding Reset Password

The user has received a reset link.

For example:

```text
http://localhost:3000/reset-password/abc123...
```

The token is part of the URL.

The frontend extracts it and sends it to the backend with the new password.

We'll create:

```http
PATCH /api/auth/reset-password/:token
```

Request body:

```json
{
  "newPassword": "myNewPassword123"
}
```

The backend must:

1. Read the token from the URL.
2. Hash the token using SHA-256.
3. Find a user with that hash.
4. Check whether the token has expired.
5. Hash the new password using bcrypt.
6. Update the user's password.
7. Remove the reset token fields.

---

## 14. Create Reset Password Validator

In `src/validators/authValidator.js`, add:

```js
const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password must contain at least 8 characters")
    .refine(
      (value) => Buffer.byteLength(value, "utf8") <= 72,
      "Password exceeds bcrypt's 72-byte limit"
    )
}).strict();
```

Export it:

```js
module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
```

---

## 15. Implement Reset Password Controller

Open:

```text
src/controllers/authController.js
```

Add:

```js
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.validatedBody;

    // Hash submitted reset token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with matching, unexpired token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date()
      }
    }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      12
    );

    user.password = hashedPassword;

    // Invalidate reset token
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

### Understand the query

```js
const user = await User.findOne({
  passwordResetToken: hashedToken,
  passwordResetExpires: {
    $gt: new Date()
  }
});
```

This query checks two conditions.

**Condition 1:**

```js
passwordResetToken: hashedToken
```

The stored token hash must match the submitted token's hash.

**Condition 2:**

```js
passwordResetExpires: {
  $gt: new Date()
}
```

`$gt` means greater than.

The expiration date must be later than the current time.

Both conditions must match.

### Why remove the token after successful reset?

```js
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
```

This prevents the same reset token from being reused.

A password reset token should be single-use.

---

## 16. Add Reset Password Route

Open:

```text
src/routes/authRoutes.js
```

Import the controller:

```js
const {
  resetPassword
} = require("../controllers/authController");
```

Import the validator:

```js
const {
  resetPasswordSchema
} = require("../validators/authValidator");
```

Add:

```js
router.patch(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  resetPassword
);
```

Our authentication endpoints are now:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request reset |
| PATCH | `/api/auth/reset-password/:token` | Reset password |

---

## 17. Test the Complete Forgot/Reset Workflow

### Step 1: Request password reset

Request:

```http
POST http://localhost:3000/api/auth/forgot-password
```

Body:

```json
{
  "email": "ali@example.com"
}
```

Expected response:

```json
{
  "success": true,
  "message": "If the account exists, a reset link will be sent."
}
```

### Step 2: Get the development reset token

Check your server terminal.

You should see something similar to:

```text
Development reset URL:
http://localhost:3000/reset-password/abc123...
```

Copy the token from the URL.

### Step 3: Reset password

Request:

```http
PATCH http://localhost:3000/api/auth/reset-password/YOUR_TOKEN
```

Body:

```json
{
  "newPassword": "newPassword456"
}
```

Expected:

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Step 4: Test old password

Try logging in with the old password.

Expected:

```text
401 Unauthorized
```

### Step 5: Test new password

Try logging in with:

```json
{
  "email": "ali@example.com",
  "password": "newPassword456"
}
```

Expected:

```text
200 OK
```

### Step 6: Try reusing the reset token

Send the same reset request again.

Expected:

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

The token has already been invalidated.

---

# Part 4 — Additional Account Security

## 18. Should Existing JWT Tokens Be Invalidated After Password Change?

Consider this situation:

1. Ali logs in on his laptop.
2. The backend issues JWT Token A.
3. Ali also logs in on his phone.
4. The backend issues JWT Token B.
5. Ali changes his password.

Should Token A and Token B remain valid?

This depends on your security policy.

For many applications, changing a password should invalidate existing sessions.

However, ordinary stateless JWT verification does not automatically invalidate previously issued tokens.

We need an additional mechanism.

One simple approach is a token version.

### Add tokenVersion to User model

```js
tokenVersion: {
  type: Number,
  default: 0
}
```

When issuing a JWT:

```js
const token = jwt.sign(
  {
    userId: user._id.toString(),
    role: user.role,
    tokenVersion: user.tokenVersion
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "1h",
    algorithm: "HS256"
  }
);
```

When verifying the token, compare its version with the database.

For example:

```js
if (decoded.tokenVersion !== user.tokenVersion) {
  return res.status(401).json({
    success: false,
    message: "Session is no longer valid"
  });
}
```

When the password changes:

```js
user.tokenVersion += 1;

await user.save();
```

Now tokens containing the previous version become invalid.

**Important:** This requires authentication middleware to fetch the current user from MongoDB. It also introduces a database lookup for protected requests.

We will implement a stronger version of this authentication flow in a later security chapter.

---

## 19. Password Management Security Checklist

Before deploying a password management system, consider these rules:

| Security measure | Reason |
|---|---|
| Hash passwords with bcrypt or Argon2id | Avoid storing plaintext passwords |
| Use generic forgot-password responses | Prevent account enumeration |
| Generate reset tokens with crypto | Use unpredictable tokens |
| Store only reset token hashes | Reduce damage from database exposure |
| Add token expiration | Limit token usefulness |
| Invalidate tokens after use | Prevent reuse |
| Rate-limit reset requests | Reduce abuse |
| Use HTTPS | Protect tokens in transit |
| Avoid logging reset tokens | Prevent accidental exposure |
| Invalidate existing sessions when appropriate | Protect compromised accounts |

For production applications, consider Argon2id as an alternative password hashing algorithm and follow current OWASP password-storage recommendations.

---

## 20. Exercises

### Exercise 1 — Password Confirmation

Modify the reset-password validator to accept:

```json
{
  "newPassword": "newPassword456",
  "confirmPassword": "newPassword456"
}
```

Reject the request if both passwords do not match.

### Exercise 2 — Prevent Password Reuse

When changing a password, compare the new password against the existing password.

Reject the request if they are identical.

### Exercise 3 — Invalidate Sessions

Implement the `tokenVersion` approach.

Whenever a user changes their password:

- Increase `tokenVersion`.
- Save the user.
- Reject JWTs with an old version.

### Exercise 4 — Reset Token Expiration

Change reset token expiration from 10 minutes to 5 minutes.

Test an expired token.

### Exercise 5 — Rate Limiting

Limit forgot-password requests to a small number per time window.

Consider what should happen if someone repeatedly requests reset links for the same account.

### Exercise 6 — Email Delivery

Integrate an email provider.

Send a password reset link to the user's registered email.

Do not return the reset token in the API response.

---

## 21. Knowledge Check

1. Why should users provide their current password when changing it?
2. Why do we use `crypto.randomBytes()`?
3. Why is SHA-256 suitable for hashing a high-entropy reset token?
4. Why do we use bcrypt for passwords instead?
5. Why should reset tokens expire?
6. What does `$gt` mean in a MongoDB query?
7. Why should a reset token be single-use?
8. Why should the original reset token not be stored in MongoDB?
9. What is account enumeration?
10. What is a token-version strategy?
11. Does changing a password automatically invalidate stateless JWTs?
12. Why should reset links only be delivered through a trusted channel?

---

## 22. What We Have Built

Our API now supports:

### Authentication

- Registration
- Login
- JWT generation
- JWT verification

### Authorization

- Role-based access control
- Admin-only routes
- Ownership checks

### User Management

- Get profile
- Update profile
- Delete account
- Admin user management
- Pagination
- Search
- Filtering
- Sorting

### Password Management

- Change password
- Forgot password
- Reset password
- Secure reset tokens
- Token expiration
- Single-use reset tokens

---

## Next Chapter — API Error Handling, Validation & Security Hardening

We'll improve the architecture instead of continuing to add controllers with repeated try/catch blocks.

Topics:

1. Centralized error handling.
2. Custom API error classes.
3. Async error handlers.
4. 404 handling.
5. Global validation.
6. Consistent API response structure.
7. Express security middleware.
8. Rate limiting.
9. CORS.
10. Helmet.
11. Request logging.

**Goal:** Transform our API from a working project into a more maintainable and production-oriented backend.
