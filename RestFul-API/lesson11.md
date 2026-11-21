
# Chapter 12 — File Uploads in Node.js & Express

## Learning Objectives

By the end of this chapter, you will understand:

1. How file uploads work between frontend and backend.
2. What `multipart/form-data` is.
3. What Multer does.
4. How to upload a single file.
5. How to upload multiple files.
6. How to validate file types and sizes.
7. How to organize uploaded files.
8. How to save file metadata in MongoDB.
9. How to serve uploaded files.
10. How to delete uploaded files.
11. How to secure file-upload endpoints.

---

# Part 1 — Understanding File Uploads

## 1. How Does a File Reach the Backend?

Imagine you're building a user profile system.

A user wants to upload a profile picture.

The frontend contains:

```html
<input type="file" />
```

The user selects:

```text
profile.jpg
```

How does this file reach our Express backend?

The frontend sends an HTTP request containing the file.

Unlike ordinary JSON requests, file uploads commonly use:

```text
multipart/form-data
```

### Normal JSON request

For example, when updating a user's name:

```http
PATCH /api/users/profile
Content-Type: application/json
```

Body:

```json
{
  "name": "Ali"
}
```

### File upload request

When uploading a profile picture:

```http
PATCH /api/users/profile/avatar
Content-Type: multipart/form-data
```

The request contains file data rather than a JSON representation of the file.

This distinction is important.

`express.json()` parses JSON request bodies, but it does not parse multipart file uploads.

We need a multipart parser.

---

## 2. What Is multipart/form-data?

HTTP requests can send data in different formats.

Common content types include:

| Content-Type | Purpose |
|---|---|
| application/json | Sending JSON |
| application/x-www-form-urlencoded | Sending simple form fields |
| multipart/form-data | Sending files and form fields |
| text/plain | Sending plain text |

### How multipart/form-data works

Imagine a form containing:

- Name: Ali
- Email: ali@example.com
- Profile picture: profile.jpg

The browser sends the request as multiple parts.

Conceptually:

```text
Request
│
├── Part 1
│   └── name = Ali
│
├── Part 2
│   └── email = ali@example.com
│
└── Part 3
    └── profile.jpg
```

Each part contains its own headers and content.

The browser also generates a boundary that separates the parts.

You generally should not manually construct this boundary when using browser `FormData` or Postman.

---

## 3. What Is Multer?

<text weight="semibold" color="success">Multer</text> is Express middleware that handles `multipart/form-data`.

It processes incoming multipart requests and makes their file information available to your application.

For example:

```js
req.file
```

contains information about a single uploaded file.

For multiple files:

```js
req.files
```

contains an array of uploaded files.

Multer can also:

- Control where files are stored.
- Rename uploaded files.
- Limit file sizes.
- Limit the number of files.
- Filter files.

We'll use Multer in this chapter.

---

# Part 2 — Installing Multer

## 4. Install Dependencies

Inside your project:

```bash
npm install multer
```

We'll also use Node.js built-in modules:

```js
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
```

No additional installation is needed for these modules.

---

# Part 3 — Understanding Storage

## 5. Where Should Uploaded Files Be Stored?

When a user uploads a file, we need to decide where it should go.

There are two common approaches.

### Option A — Local Disk Storage

Store uploaded files on your server.

Example:

```text
secure-api/
│
├── uploads/
│   ├── profile-123.jpg
│   ├── document-456.pdf
│   └── image-789.png
│
└── src/
```

Advantages:

- Simple to implement.
- No external storage service required.
- Good for learning and small applications.

Disadvantages:

- Server storage is limited.
- Files may be lost when using temporary or replaceable server instances.
- Multiple backend instances need shared storage or synchronization.

### Option B — Cloud Object Storage

Store files using a service such as:

- Amazon S3
- Cloudinary
- Google Cloud Storage

Advantages:

- Scalable storage.
- Easier integration with CDN delivery.
- Files can be stored independently of your application server.

For now, we'll implement local storage.

The concepts will also help you understand cloud uploads later.

---

# Part 4 — Creating Upload Middleware

## 6. Create the Upload Directory

Create this directory in your project root:

```text
uploads/
```

Your project structure becomes:

```text
secure-api/
│
├── uploads/
│
├── server.js
├── package.json
│
└── src/
    ├── app.js
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

Do not commit private or user-uploaded files to Git.

Add this to `.gitignore`:

```gitignore
uploads/*
!uploads/.gitkeep
```

Create an empty `uploads/.gitkeep` file if you want Git to retain the directory.

---

## 7. Configure Multer Storage

Create:

```text
src/middleware/upload.js
```

Code:

```js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    const uniqueName =
      crypto.randomUUID() +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
  }

});

const upload = multer({
  storage
});

module.exports = upload;
```

### Understand the code

**Step 1 — diskStorage**

```js
multer.diskStorage({})
```

This tells Multer to save files on the server's disk.

**Step 2 — destination**

```js
destination: (req, file, cb) => {
  cb(null, "uploads/");
}
```

This determines where the file will be saved.

The callback has this structure:

```js
cb(error, destination);
```

Here, `null` means there is no error.

**Step 3 — filename**

```js
filename: (req, file, cb) => {
  const uniqueName =
    crypto.randomUUID() +
    path.extname(file.originalname).toLowerCase();

  cb(null, uniqueName);
}
```

Why not save the file using its original name?

Imagine two users upload:

```text
profile.jpg
```

If we use the original filename, one upload might overwrite another.

Instead, we generate a unique filename.

Example:

```text
9c4a2f4d-....jpg
```

We retain the extension for convenience, but remember that a filename extension does not prove the file's actual type.

---

# Part 5 — Uploading a Single File

## 8. Create the Upload Endpoint

We'll allow users to upload their profile pictures.

Endpoint:

```http
POST /api/users/avatar
```

The endpoint must be protected.

Why?

Because a user should only be allowed to upload an avatar for their own account.

### Request flow

```text
Client
  |
  v
POST /api/users/avatar
  |
  v
Authentication Middleware
  |
  v
Multer Middleware
  |
  v
Controller
  |
  v
Save File Metadata
  |
  v
Response
```

## 9. Create Upload Controller

Open:

```text
src/controllers/userController.js
```

Add:

```js
const uploadAvatar = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(
      400,
      "Please upload an image"
    );
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    // Remove uploaded file if account no longer exists
    await fs.promises.unlink(req.file.path).catch(() => {});

    throw new ApiError(
      404,
      "User not found"
    );
  }

  user.avatar = req.file.filename;

  await user.save();

  return sendSuccess(
    res,
    200,
    "Avatar uploaded successfully",
    {
      avatar: req.file.filename
    }
  );

});
```

Required imports:

```js
const fs = require("fs");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { sendSuccess } = require("../utils/response");
```

### Understand `req.file`

Multer adds uploaded file information to the request.

For example:

```js
req.file
```

may contain:

```js
{
  fieldname: "avatar",
  originalname: "profile.jpg",
  encoding: "7bit",
  mimetype: "image/jpeg",
  destination: "uploads/",
  filename: "generated-name.jpg",
  path: "uploads/generated-name.jpg",
  size: 120000
}
```

Important properties:

| Property | Meaning |
|---|---|
| originalname | Original uploaded filename |
| mimetype | Client-provided MIME type |
| filename | Generated filename |
| path | Saved file path |
| size | File size in bytes |

We save:

```js
user.avatar = req.file.filename;
```

We do not need to store the entire file inside MongoDB.

We'll store only its metadata and filename.

---

# Part 6 — Updating the User Model

## 10. Add Avatar Field

Open:

```text
src/models/User.js
```

Add:

```js
avatar: {
  type: String,
  default: null
}
```

Your model now contains:

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

    avatar: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);
```

Keep all the other fields you already added in previous chapters, including password-reset and token-version fields.

---

# Part 7 — Add the Route

## 11. Configure Upload Route

Open:

```text
src/routes/userRoutes.js
```

Import:

```js
const upload = require("../middleware/upload");

const {
  uploadAvatar
} = require("../controllers/userController");
```

Add:

```js
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);
```

### Understand `upload.single("avatar")`

This tells Multer:

- Expect one uploaded file.
- The form field name must be `avatar`.
- Put the uploaded file information in `req.file`.

The field name matters.

If your frontend sends:

```text
profilePicture
```

but the backend expects:

```text
avatar
```

Multer will reject the request because the field names do not match.

---

# Part 8 — Serve Uploaded Files

## 12. Make Uploads Accessible

We have stored the file.

But how can a frontend display it?

We need to expose an appropriate static-file URL.

Open:

```text
src/app.js
```

Add:

```js
const path = require("path");

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
```

Now a file stored as:

```text
uploads/generated-name.jpg
```

can be accessed through:

```text
http://localhost:3000/uploads/generated-name.jpg
```

### Important security distinction

Static file serving makes files publicly accessible to anyone who knows their URL.

This is appropriate only for files intended to be public, such as profile pictures.

Do not use this approach for private documents, identity documents, or confidential files.

Private files should be served through an authenticated download endpoint or a carefully controlled signed URL.

---

# Part 9 — Test with Postman

## 13. Upload a Profile Picture

Request:

```http
POST http://localhost:3000/api/users/avatar
```

Authorization:

```text
Bearer YOUR_JWT_TOKEN
```

Go to:

```text
Body → form-data
```

Add:

| Key | Type | Value |
|---|---|---|
| avatar | File | Select profile.jpg |

Do not manually set the `Content-Type` header.

Postman automatically generates the multipart boundary.

Expected response:

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": "generated-name.jpg"
  }
}
```

Check your project:

```text
uploads/
  generated-name.jpg
```

Now open:

```text
http://localhost:3000/uploads/generated-name.jpg
```

You should see the image if static serving is configured correctly.

---

# Part 10 — Uploading Multiple Files

## 14. Understanding Multiple File Uploads

Sometimes a user needs to upload multiple files.

For example:

- A student uploads assignment attachments.
- A seller uploads multiple product images.
- A user uploads several gallery images.

Multer provides:

```js
upload.array("files", 5)
```

This means:

- Accept files under the field name `files`.
- Accept a maximum of 5 files.

The files become available through:

```js
req.files
```

### Example route

```js
router.post(
  "/attachments",
  protect,
  upload.array("files", 5),
  uploadAttachments
);
```

### Example controller

```js
const uploadAttachments = asyncHandler(async (req, res) => {

  if (!req.files || req.files.length === 0) {
    throw new ApiError(
      400,
      "Please upload at least one file"
    );
  }

  const files = req.files.map((file) => ({
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype
  }));

  return sendSuccess(
    res,
    201,
    "Files uploaded successfully",
    files
  );

});
```

For a real application, save this metadata in MongoDB instead of returning it only in the response.

Also, if a database operation fails after files have been saved, clean up those files to avoid orphaned storage.

---

# Part 11 — File Validation

## 15. Why Validate Uploaded Files?

Imagine our API is intended to accept profile pictures.

A malicious user uploads:

```text
malware.exe
```

We should reject it.

We should also reject files that are too large.

For example, if the maximum image size is 2 MB, a 100 MB file should not be accepted.

We'll implement two checks:

1. File size.
2. File type.

## 16. Add File Size Limit

Update `src/middleware/upload.js`:

```js
const upload = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024
  }
});
```

Explanation:

```text
2 × 1024 × 1024 = 2,097,152 bytes
```

That is 2 MiB.

Multer will reject larger files.

## 17. Add MIME Type Filter

We can initially filter by MIME type:

```js
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const fileFilter = (req, file, cb) => {

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(
    new ApiError(
      400,
      "Only JPEG, PNG, and WebP images are allowed"
    )
  );

};
```

Update the Multer configuration:

```js
const upload = multer({
  storage,

  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1
  },

  fileFilter
});
```

Remember to import:

```js
const ApiError = require("../utils/ApiError");
```

### Important security limitation

`file.mimetype` is supplied by the client.

A malicious client can claim that an executable file is an image.

Therefore:

**MIME-type filtering alone is not sufficient for secure uploads.**

For production, inspect the actual file signature (magic bytes), preferably with a maintained file-type detection library, and decode/re-encode images with a trusted image-processing library when appropriate.

Also:

- Generate your own filenames.
- Never trust the original filename as a filesystem path.
- Keep uploaded files outside executable application directories.
- Consider malware scanning for higher-risk file types.
- Enforce storage quotas and request limits.

---

# Part 12 — Handling Multer Errors

## 18. File Size Error

Suppose someone uploads a file larger than the configured limit.

Multer may generate:

```text
MulterError: File too large
```

We should convert it into a clean API response.

One way is to wrap the upload middleware.

Add this to `src/middleware/upload.js`:

```js
const handleUpload = (middleware) => {
  return (req, res, next) => {

    middleware(req, res, (error) => {

      if (!error) {
        return next();
      }

      if (error instanceof multer.MulterError) {

        if (error.code === "LIMIT_FILE_SIZE") {
          return next(
            new ApiError(
              413,
              "Uploaded file is too large"
            )
          );
        }

        if (error.code === "LIMIT_FILE_COUNT") {
          return next(
            new ApiError(
              400,
              "Too many files uploaded"
            )
          );
        }

        return next(
          new ApiError(
            400,
            "File upload failed"
          )
        );
      }

      next(error);
    });
  };
};

module.exports = {
  upload,
  handleUpload
};
```

Now update your route:

```js
const {
  upload,
  handleUpload
} = require("../middleware/upload");

router.post(
  "/avatar",
  protect,
  handleUpload(upload.single("avatar")),
  uploadAvatar
);
```

Notice that we now export both `upload` and `handleUpload`.

The custom error is passed to our centralized error handler.

---

# Part 13 — Deleting an Uploaded File

## 19. Why Do We Need File Deletion?

Imagine a user uploads a new avatar every day.

After 30 days, the uploads directory might contain 30 images, even though only one is currently used.

This wastes storage.

When replacing an avatar, we should:

1. Find the existing user.
2. Remember the old filename.
3. Save the new file.
4. Update the user's avatar field.
5. Delete the old file.

### Example controller

```js
const replaceAvatar = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(
      400,
      "Please upload an image"
    );
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    await fs.promises.unlink(req.file.path).catch(() => {});

    throw new ApiError(404, "User not found");
  }

  const oldAvatar = user.avatar;

  user.avatar = req.file.filename;

  try {
    await user.save();
  } catch (error) {
    await fs.promises.unlink(req.file.path).catch(() => {});
    throw error;
  }

  if (oldAvatar) {
    const oldPath = path.join(
      process.cwd(),
      "uploads",
      path.basename(oldAvatar)
    );

    await fs.promises.unlink(oldPath).catch((error) => {
      console.error("Old avatar cleanup failed:", error);
    });
  }

  return sendSuccess(
    res,
    200,
    "Avatar updated successfully",
    {
      avatar: user.avatar
    }
  );

});
```

Required imports:

```js
const fs = require("fs");
const path = require("path");
```

### Why use path.basename?

```js
path.basename(oldAvatar)
```

It ensures that we use only the filename portion when constructing the path.

Never use an arbitrary user-provided path to delete files.

Also, this example assumes all avatar files are managed by this upload system. In a larger application, you should use a dedicated storage service and explicit ownership checks.

---

# Part 14 — Storing File Metadata in MongoDB

## 20. Should We Store the Actual File in MongoDB?

Usually, for ordinary REST applications, we store the file in filesystem or object storage and keep metadata in MongoDB.

For example:

```text
File storage:
uploads/abc123.pdf

MongoDB:
{
  filename: "abc123.pdf",
  originalName: "assignment.pdf",
  mimeType: "application/pdf",
  size: 500000,
  uploadedBy: "user-id"
}
```

Why?

MongoDB is a database for application data.

Object storage or a filesystem is generally a better fit for large binary files.

MongoDB does have GridFS for storing files larger than the BSON document size limit, but we do not need it for this project.

## 21. Create an Attachment Model

Create:

```text
src/models/Attachment.js
```

Code:

```js
const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true
    },

    originalName: {
      type: String,
      required: true
    },

    mimeType: {
      type: String,
      required: true
    },

    size: {
      type: Number,
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Attachment",
  attachmentSchema
);
```

## 22. Save Attachment Metadata

Controller:

```js
const Attachment = require("../models/Attachment");

const uploadDocument = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(
      400,
      "Please upload a document"
    );
  }

  const attachment = await Attachment.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedBy: req.user.id
  });

  return sendSuccess(
    res,
    201,
    "Document uploaded successfully",
    attachment
  );

});
```

This gives us two separate responsibilities:

**Filesystem:**

Stores the actual file.

**MongoDB:**

Stores information about the file.

The `uploadedBy` field connects the file to the user who uploaded it.

For production code, clean up the physical file if saving its MongoDB metadata fails.

---

# Part 15 — Private File Downloads

## 23. Public vs Private Files

Not all uploaded files should be publicly accessible.

Examples of public files:

- Profile pictures.
- Public product images.
- Public gallery images.

Examples of private files:

- Identity documents.
- Private invoices.
- Student assignments.
- Confidential reports.

For private files, do not expose the entire uploads directory using `express.static()`.

Instead, create a protected endpoint:

```http
GET /api/attachments/:id/download
```

Example controller:

```js
const downloadAttachment = asyncHandler(async (req, res) => {

  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    throw new ApiError(
      404,
      "Attachment not found"
    );
  }

  // Owner or admin can download
  const isOwner =
    attachment.uploadedBy.toString() === req.user.id;

  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "You cannot access this file"
    );
  }

  const filePath = path.join(
    process.cwd(),
    "uploads",
    attachment.filename
  );

  return res.download(
    filePath,
    attachment.originalName
  );

});
```

Route:

```js
router.get(
  "/:id/download",
  protect,
  downloadAttachment
);
```

This is an example of combining:

- Authentication.
- Authorization.
- Database lookup.
- Filesystem access.

The user must be authenticated and either own the attachment or have the admin role.

In a larger system, add validation for the attachment ID and handle missing files on disk.

---

# Part 16 — Frontend File Upload

## 24. How Does React Send a File?

A React frontend can use `FormData`.

Example:

```jsx
async function uploadAvatar(file, token) {

  const formData = new FormData();

  formData.append("avatar", file);

  const response = await fetch(
    "http://localhost:3000/api/users/avatar",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`
      },

      body: formData
    }
  );

  const result = await response.json();

  return result;
}
```

Important:

Do not manually set:

```js
"Content-Type": "multipart/form-data"
```

The browser must generate the multipart boundary and include it in the header.

### File input example

```jsx
function AvatarUpload({ token }) {

  const handleChange = async (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const result = await uploadAvatar(file, token);

    console.log(result);
  };

  return (
    <input
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onChange={handleChange}
    />
  );
}
```

The `accept` attribute helps guide the user's file selection.

It is not a security check. The backend must validate the file independently.

---

# Part 17 — Final Project Structure

Our relevant structure now looks like this:

```text
secure-api/
│
├── uploads/
│
├── server.js
│
└── src/
    │
    ├── app.js
    │
    ├── controllers/
    │   ├── authController.js
    │   └── userController.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   ├── authorize.js
    │   ├── validate.js
    │   ├── upload.js
    │   ├── errorHandler.js
    │   └── notFound.js
    │
    ├── models/
    │   ├── User.js
    │   └── Attachment.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   └── userRoutes.js
    │
    └── utils/
        ├── ApiError.js
        ├── asyncHandler.js
        └── response.js
```

---

# Part 18 — Exercises

## Exercise 1: Single File Upload

Create:

```http
POST /api/users/avatar
```

Requirements:

- Authentication required.
- Accept one image.
- Maximum size 2 MiB.
- Generate a unique filename.
- Save filename in the User model.

## Exercise 2: Multiple Images

Create:

```http
POST /api/gallery
```

Requirements:

- Accept a maximum of 5 images.
- Save them in the uploads directory.
- Store metadata in MongoDB.

## Exercise 3: File Deletion

Create:

```http
DELETE /api/attachments/:id
```

Requirements:

- Only the owner or admin can delete.
- Delete metadata from MongoDB.
- Delete the physical file.
- Handle missing files safely.

## Exercise 4: Private Documents

Create:

```http
GET /api/attachments/:id/download
```

Requirements:

- JWT authentication.
- Owner or admin authorization.
- No public static access to private documents.

## Exercise 5: File Validation

Reject:

- Files larger than the configured limit.
- Unsupported file types.
- Empty upload requests.
- More than the allowed number of files.

Use actual file-signature inspection rather than relying only on the client-provided MIME type.

---

# Part 19 — Knowledge Check

1. What is multipart/form-data?
2. Why doesn't express.json() process file uploads?
3. What is Multer?
4. What is the difference between req.file and req.files?
5. What is diskStorage?
6. Why should we generate unique filenames?
7. Why is file.mimetype not sufficient for security?
8. What does limits.fileSize do?
9. Why should private documents not be served through express.static()?
10. Why do we store metadata separately from the actual file?
11. What is the purpose of the uploadedBy field?
12. How can we prevent users from downloading other users' files?

---

# Chapter Summary

We implemented:

- Multipart form uploads.
- Multer middleware.
- Single file uploads.
- Multiple file uploads.
- Unique filenames.
- File-size restrictions.
- MIME-type filtering.
- Centralized Multer error handling.
- File metadata in MongoDB.
- Public static file serving.
- Private file downloads.
- File deletion.
- React FormData integration.

## Next Chapter — Advanced File Uploads

We'll explore:

1. Cloudinary integration.
2. Amazon S3 concepts.
3. Direct-to-cloud uploads.
4. Signed upload URLs.
5. Image resizing and compression.
6. File ownership and access control.
7. Storage abstraction in MVC applications.
8. Upload progress and large-file handling.

**Goal:** Move from basic local file uploads to a scalable file-storage architecture.
