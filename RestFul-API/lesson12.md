
# Chapter 13 — Cloud File Storage with Cloudinary and Amazon S3

## Learning Objectives

By the end of this chapter, you will understand:

1. Why local storage becomes problematic in production.
2. What object storage is.
3. How Cloudinary works.
4. How Amazon S3 works.
5. How to upload files to Cloudinary.
6. How to upload files to Amazon S3.
7. What signed URLs are.
8. What direct uploads are.
9. How to organize cloud storage in an MVC application.
10. How to delete cloud files.
11. How to protect private files.

---

# Part 1 — Why Cloud Storage?

## 1. Problems with Local File Storage

In the previous chapter, we stored files like this:

```text
secure-api/
│
├── uploads/
│   ├── profile.jpg
│   ├── assignment.pdf
│   └── document.png
│
└── src/
```

This works locally.

But imagine your application is deployed on two backend servers.

```text
             Client
               |
               v
          Load Balancer
           /         \
          v           v
      Server A     Server B
          |           |
          v           v
       uploads/     uploads/
```

A user uploads a file to Server A.

The next request reaches Server B.

But Server B doesn't have that file.

Why?

Because the two servers have separate local filesystems.

Other problems include:

- Server replacement may remove files.
- Backups become more complicated.
- Storage capacity is limited.
- Serving large files increases backend workload.
- Multiple instances require shared storage.

This is why many applications use cloud object storage.

---

## 2. What Is Object Storage?

Object storage is a system designed to store data as objects.

An object generally contains:

1. The actual data.
2. Metadata.
3. A unique key or identifier.

For example:

```text
Object:

Key:
users/123/avatar.jpg

Data:
[Actual image bytes]

Metadata:
Content-Type: image/jpeg
Size: 150 KB
```

Unlike a traditional filesystem, object storage organizes objects using keys inside buckets or containers.

### Important terminology

| Term | Meaning |
|---|---|
| Bucket | Container for stored objects |
| Object | Stored file and its metadata |
| Key | Object's unique name within a bucket |
| Region | Geographic location of storage infrastructure |
| Metadata | Information about the stored object |
| CDN | Network that delivers content from distributed locations |

Example:

```text
Bucket: my-app-files

Objects:
├── users/123/avatar.jpg
├── users/456/avatar.png
├── assignments/abc.pdf
└── reports/report-001.pdf
```

The key is not necessarily a physical folder. It is an object identifier that can contain slash-separated prefixes.

---

# Part 2 — Understanding Cloudinary

## 3. What Is Cloudinary?

Cloudinary is a cloud media-management platform.

It is especially useful for:

- Profile pictures.
- Product images.
- Gallery images.
- Videos.
- Image transformations.
- Image optimization.

Suppose a user uploads:

```text
original-image.png
```

Cloudinary can store it and deliver optimized versions.

For example:

```text
Original image:
2000 × 2000 pixels

Optimized version:
500 × 500 pixels
```

You can request different transformations without manually creating every image version.

### Cloudinary workflow

```text
Client
  |
  v
Express API
  |
  v
Multer
  |
  v
Cloudinary SDK
  |
  v
Cloudinary Storage
  |
  v
Return URL + Public ID
```

For this first implementation, we'll upload through our backend.

---

# Part 3 — Configure Cloudinary

## 4. Create a Cloudinary Account

Visit:

https://cloudinary.com/

Create an account.

From your Cloudinary dashboard, obtain:

- Cloud name.
- API key.
- API secret.

Keep these values private.

Never commit credentials to GitHub.

## 5. Install Cloudinary Dependencies

Install:

```bash
npm install cloudinary multer
```

We'll use Multer memory storage so that files are temporarily available as buffers instead of being saved to local disk first.

## 6. Configure Environment Variables

Add these values to `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Never expose `CLOUDINARY_API_SECRET` in frontend code.

## 7. Create Cloudinary Configuration

Create:

```text
src/config/cloudinary.js
```

Code:

```js
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

Make sure `dotenv.config()` runs before importing application modules that use environment variables.

---

# Part 4 — Memory Storage with Multer

## 8. Why Use Memory Storage?

Previously, we used:

```js
multer.diskStorage()
```

That saved files on our server's disk.

Now we want to upload directly from our backend to Cloudinary.

We can use:

```js
multer.memoryStorage()
```

This temporarily stores the uploaded file in memory.

Example:

```js
req.file.buffer
```

contains the file's binary data.

Create:

```text
src/middleware/cloudUpload.js
```

Code:

```js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, and WebP images are allowed")
      );
    }

    cb(null, true);
  }
});

module.exports = upload;
```

**Important:** This example uses MIME filtering for demonstration. In production, inspect actual file signatures and validate or decode images before accepting them. Memory storage also means uploaded files consume server memory, so enforce strict limits and concurrency controls.

---

# Part 5 — Uploading to Cloudinary

## 9. Understand Cloudinary Upload

Cloudinary provides:

```js
cloudinary.uploader.upload()
```

It accepts an upload source and options.

For a memory buffer, we'll use a data URI.

Conceptually:

```text
File Buffer
    |
    v
Base64 Encoding
    |
    v
Data URI
    |
    v
Cloudinary Upload
```

Create:

```text
src/services/cloudinaryService.js
```

Code:

```js
const cloudinary = require("../config/cloudinary");

const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "secure-api/avatars",
        resource_type: "image"
      },
      (error, result) => {

        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

const deleteImage = async (publicId) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "image"
  });
};

module.exports = {
  uploadImage,
  deleteImage
};
```

### Why upload_stream?

It allows us to send the buffer directly to Cloudinary without first creating a local file.

The result contains information such as:

```js
{
  public_id: "secure-api/avatars/abc123",
  secure_url: "https://res.cloudinary.com/...",
  format: "jpg",
  width: 500,
  height: 500
}
```

Two important values:

**secure_url**

The URL used to access the uploaded image.

**public_id**

The identifier used to manage or delete the image in Cloudinary.

We should store both in our database.

---

## 10. Update User Model

Previously, our User model had:

```js
avatar: {
  type: String,
  default: null
}
```

For cloud storage, update it to:

```js
avatar: {
  url: {
    type: String,
    default: null
  },

  publicId: {
    type: String,
    default: null
  }
}
```

Now MongoDB stores:

```json
{
  "avatar": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "secure-api/avatars/abc123"
  }
}
```

Why store `publicId`?

Because the URL is useful for displaying the image, but the public ID is needed to manage or delete the cloud resource.

---

## 11. Create Cloudinary Upload Controller

Open:

```text
src/controllers/userController.js
```

Add:

```js
const {
  uploadImage,
  deleteImage
} = require("../services/cloudinaryService");

const uploadAvatarToCloud = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(
      400,
      "Please upload an image"
    );
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  // Upload new image
  const uploadedImage = await uploadImage(req.file.buffer);

  const oldPublicId = user.avatar?.publicId;

  // Save new image information
  user.avatar = {
    url: uploadedImage.secure_url,
    publicId: uploadedImage.public_id
  };

  try {
    await user.save();
  } catch (error) {

    // Compensate for failed database update
    await deleteImage(uploadedImage.public_id).catch(() => {});

    throw error;
  }

  // Delete old image after successful database update
  if (oldPublicId) {
    await deleteImage(oldPublicId).catch((error) => {
      console.error("Old image cleanup failed:", error);
    });
  }

  return sendSuccess(
    res,
    200,
    "Avatar uploaded successfully",
    {
      avatar: user.avatar
    }
  );

});
```

### Understand the workflow

We first upload the new image.

```js
const uploadedImage = await uploadImage(req.file.buffer);
```

Then update MongoDB:

```js
user.avatar = {
  url: uploadedImage.secure_url,
  publicId: uploadedImage.public_id
};
```

Only after the database update succeeds do we delete the old image.

This order matters.

If we deleted the old image first and the database update failed, the user could lose their existing avatar.

This is an example of a compensating action:

- If cloud upload succeeds but database saving fails, delete the newly uploaded cloud object.
- If the database update succeeds but old-object deletion fails, keep the new avatar and retry cleanup later.

---

## 12. Add the Cloudinary Route

Open:

```text
src/routes/userRoutes.js
```

Import:

```js
const cloudUpload = require("../middleware/cloudUpload");

const {
  uploadAvatarToCloud
} = require("../controllers/userController");
```

Add:

```js
router.post(
  "/avatar/cloud",
  protect,
  cloudUpload.single("avatar"),
  uploadAvatarToCloud
);
```

Test using Postman:

```http
POST /api/users/avatar/cloud
```

Authorization:

```text
Bearer YOUR_JWT_TOKEN
```

Body:

```text
form-data

avatar: [Select image]
```

Expected response:

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "publicId": "secure-api/avatars/abc123"
    }
  }
}
```

---

# Part 6 — Image Transformations

## 13. What Are Image Transformations?

One major advantage of Cloudinary is that it can transform images during delivery.

Suppose a user uploads an image:

```text
3000 × 3000 pixels
```

But our profile UI needs:

```text
200 × 200 pixels
```

We don't need to store a separate image manually.

We can request a transformed image URL.

For example, with the Cloudinary SDK:

```js
const imageUrl = cloudinary.url(
  "secure-api/avatars/abc123",
  {
    width: 200,
    height: 200,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto"
  }
);
```

This requests:

- Width: 200 pixels.
- Height: 200 pixels.
- Crop: Fill.
- Quality: Automatic.
- Format: Automatic.

The exact transformations available depend on the asset and Cloudinary configuration.

### Real-world use cases

| Application | Transformation |
|---|---|
| Profile picture | 200 × 200 |
| Product card | 400 × 400 |
| Product detail | 1000 × 1000 |
| Blog thumbnail | 800 × 450 |
| Gallery preview | 300 × 300 |

This improves delivery efficiency and reduces unnecessary image downloads.

---

# Part 7 — Understanding Amazon S3

## 14. What Is Amazon S3?

Amazon S3 is an object-storage service from AWS.

It is commonly used for:

- User uploads.
- Documents.
- Images.
- Backups.
- Application assets.
- Large datasets.

Unlike Cloudinary, S3 is a general-purpose object storage service rather than primarily a media transformation platform.

### S3 architecture

```text
Client
  |
  v
Express Backend
  |
  v
AWS SDK
  |
  v
S3 Bucket
  |
  v
Stored Object
```

Example:

```text
Bucket:
secure-api-files

Objects:
users/123/avatar.jpg
documents/456/assignment.pdf
reports/789/report.pdf
```

The object key identifies the object.

---

## 15. Create an S3 Bucket

In the AWS Console:

1. Open Amazon S3.
2. Create a bucket.
3. Choose a globally unique bucket name.
4. Select the required AWS region.
5. Keep Block Public Access enabled unless you have a deliberate public-access design.
6. Create the bucket.

For private application documents, keep the bucket private.

Do not make your entire bucket public just to display one uploaded image.

---

## 16. Configure AWS Credentials

For local development, configure credentials using an AWS profile or environment variables.

Example `.env`:

```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

Never commit these credentials.

In production, prefer IAM roles or workload identity rather than long-lived access keys.

For example, an application running on AWS can use an IAM role with only the permissions it needs.

---

## 17. Install AWS SDK

Install:

```bash
npm install @aws-sdk/client-s3
```

AWS SDK v3 is modular.

We import only the S3 functionality we need.

---

## 18. Configure S3 Client

Create:

```text
src/config/s3.js
```

Code:

```js
const {
  S3Client
} = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION
});

module.exports = s3;
```

The SDK can obtain credentials from its default credential provider chain.

For example:

- Environment variables.
- Shared AWS credentials.
- IAM roles.

You do not need to manually pass access keys if credentials are already configured through a supported provider.

---

# Part 8 — Uploading Files to S3

## 19. Understand PutObjectCommand

To upload a file, we can use:

```js
PutObjectCommand
```

This command sends an object to an S3 bucket.

It requires:

- Bucket name.
- Object key.
- File body.

Example:

```js
const {
  PutObjectCommand
} = require("@aws-sdk/client-s3");

const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: "users/123/avatar.jpg",
  Body: fileBuffer,
  ContentType: "image/jpeg"
});
```

Then:

```js
await s3.send(command);
```

The file is uploaded to S3.

---

## 20. Create S3 Service

Create:

```text
src/services/s3Service.js
```

Code:

```js
const crypto = require("crypto");

const s3 = require("../config/s3");

const {
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const uploadFile = async (buffer, mimeType, folder) => {

  const filename = crypto.randomUUID();

  const key = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType
  });

  await s3.send(command);

  return {
    key
  };
};

const deleteFile = async (key) => {

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });

  return s3.send(command);
};

module.exports = {
  uploadFile,
  deleteFile
};
```

Notice that we return:

```js
{
  key: "users/123/abc123"
}
```

The key is our reference to the stored object.

We do not need to make the bucket public to upload or delete objects.

---

## 21. Create an S3 Upload Controller

Example:

```js
const {
  uploadFile,
  deleteFile
} = require("../services/s3Service");

const uploadAvatarToS3 = asyncHandler(async (req, res) => {

  if (!req.file) {
    throw new ApiError(
      400,
      "Please upload an image"
    );
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  const uploaded = await uploadFile(
    req.file.buffer,
    req.file.mimetype,
    `users/${user._id}/avatars`
  );

  const oldKey = user.avatar?.storageKey;

  user.avatar = {
    storageProvider: "s3",
    storageKey: uploaded.key,
    publicId: null,
    url: null
  };

  try {
    await user.save();
  } catch (error) {
    await deleteFile(uploaded.key).catch(() => {});
    throw error;
  }

  if (oldKey) {
    await deleteFile(oldKey).catch((error) => {
      console.error("Old S3 object cleanup failed:", error);
    });
  }

  return sendSuccess(
    res,
    200,
    "Avatar uploaded to S3",
    {
      storageKey: uploaded.key
    }
  );

});
```

This example assumes we update our avatar schema to support multiple storage providers.

For a real application, use a consistent storage metadata structure.

---

# Part 9 — Signed URLs

## 22. What Is a Signed URL?

Suppose we have a private document:

```text
documents/123/invoice.pdf
```

We want an authorized user to download it.

But we don't want to make the entire S3 bucket public.

How can we allow access?

We can generate a signed URL.

A signed URL is a temporary URL that grants permission to perform a specific operation on a particular object.

For example:

```text
https://bucket.s3.region.amazonaws.com/documents/123/invoice.pdf
?X-Amz-Signature=...
&X-Amz-Expires=300
```

This URL may allow access for a limited period.

### How it works

```text
User
  |
  v
GET /api/attachments/123/download-url
  |
  v
JWT Authentication
  |
  v
Ownership Authorization
  |
  v
Generate Signed URL
  |
  v
Return URL
  |
  v
User Downloads Directly from S3
```

The backend does not need to stream the entire file.

S3 delivers the object directly.

---

## 23. Generate a Signed Download URL

Install:

```bash
npm install @aws-sdk/s3-request-presigner
```

Create a service function:

```js
const {
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const {
  getSignedUrl
} = require("@aws-sdk/s3-request-presigner");

const generateDownloadUrl = async (key) => {

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });

  const url = await getSignedUrl(
    s3,
    command,
    {
      expiresIn: 300
    }
  );

  return url;
};
```

Here:

```js
expiresIn: 300
```

means 300 seconds, or 5 minutes.

Add the function to the service exports.

### Important security point

A signed URL is a bearer credential.

Anyone possessing it can generally use it until it expires.

Therefore:

- Generate it only after authorization.
- Keep expiration short.
- Do not log it.
- Avoid exposing private object keys unnecessarily.
- Use HTTPS.
- Do not assume that signing a URL makes the underlying object permanently private if it is also publicly accessible through another path.

---

# Part 10 — Direct Uploads

## 24. Backend Upload vs Direct Upload

So far, we have used this architecture:

```text
Client
  |
  v
Express Backend
  |
  v
Cloud Storage
```

The backend receives the entire file and then uploads it.

This is called a backend-mediated upload.

For large files or high traffic, it may be more efficient to upload directly to cloud storage.

### Direct upload architecture

```text
Client
  |
  | 1. Request upload permission
  v
Express Backend
  |
  | 2. Generate signed upload URL
  v
Client
  |
  | 3. Upload file directly
  v
Cloud Storage
  |
  | 4. Confirm upload
  v
Express Backend
```

The backend handles authorization and permission generation.

The file data travels directly from the client to cloud storage.

### Benefits

- Less backend bandwidth usage.
- Less backend memory usage.
- Better handling of large uploads.
- Easier horizontal scaling.

### Security requirements

A signed upload URL should restrict:

- The allowed object key.
- The allowed operation.
- The expiration.
- The content type where supported.
- The upload size through appropriate policy or upload mechanism.

Do not allow the client to choose arbitrary storage keys or overwrite arbitrary objects.

Also, the backend should verify the uploaded object before marking it as an approved attachment.

---

# Part 11 — Storage Architecture in MVC

## 25. Why Should Controllers Not Know Every Storage Detail?

Imagine your controller directly contains:

```js
cloudinary.uploader.upload_stream(...)
```

Then later you decide to migrate to S3.

You may need to modify several controllers.

This creates tight coupling.

Instead, we can create a storage service abstraction.

### Architecture

```text
Controller
   |
   v
Storage Service
   |
   +------> Cloudinary
   |
   +------> Amazon S3
   |
   +------> Local Storage
```

The controller only knows that it needs to upload or delete a file.

It does not need to know how the provider works internally.

## 26. Define a Storage Service Interface

Conceptually, every storage provider should support:

```js
upload(buffer, options)
delete(key)
```

For example:

```js
class StorageService {
  async upload(buffer, options) {
    throw new Error("upload() must be implemented");
  }

  async delete(key) {
    throw new Error("delete() must be implemented");
  }
}
```

This is a conceptual base class.

JavaScript does not enforce interfaces automatically.

We can implement the same method names in separate provider modules.

Example:

```text
src/
  services/
    storage/
      cloudinaryStorage.js
      s3Storage.js
      index.js
```

Then choose a provider using configuration:

```env
STORAGE_PROVIDER=s3
```

The application can select the correct service at startup.

This is useful when the application grows or storage requirements change.

---

# Part 12 — Cloud Storage Database Design

## 27. Store Storage Metadata

A useful generic structure:

```js
{
  filename: "abc123.jpg",

  originalName: "profile.jpg",

  mimeType: "image/jpeg",

  size: 150000,

  storageProvider: "cloudinary",

  storageKey: "secure-api/avatars/abc123",

  url: "https://res.cloudinary.com/...",

  uploadedBy: "user-id"
}
```

For S3:

```js
{
  filename: "abc123.jpg",

  originalName: "profile.jpg",

  mimeType: "image/jpeg",

  size: 150000,

  storageProvider: "s3",

  storageKey: "users/123/avatars/abc123",

  url: null,

  uploadedBy: "user-id"
}
```

Notice that `storageKey` is the important provider-independent reference.

For Cloudinary, it maps to the public ID.

For S3, it maps to the object key.

A more formal implementation may use provider-specific fields or a storage adapter to translate these identifiers.

---

# Part 13 — Cloud Storage Security

## 28. Important Security Rules

Before deploying a cloud upload system, consider the following.

| Security rule | Reason |
|---|---|
| Keep credentials in environment or IAM | Protect cloud account access |
| Keep private buckets private | Prevent unauthorized downloads |
| Generate storage keys on the backend | Prevent arbitrary path selection |
| Validate actual file content | Do not trust file extensions or MIME headers |
| Restrict upload sizes | Prevent resource exhaustion |
| Restrict file counts | Prevent excessive uploads |
| Authorize downloads | Protect private files |
| Use short-lived signed URLs | Limit temporary access |
| Clean up orphaned objects | Avoid unnecessary storage costs |
| Apply least-privilege IAM | Limit damage from compromised credentials |

### One important concept: Least Privilege

Suppose our backend only needs to:

- Upload objects to one bucket.
- Delete objects from that bucket.
- Read specific objects.

Should we give it full administrator access to AWS?

No.

We should create an IAM policy with only the permissions required by our application.

This is called the principle of least privilege.

---

# Part 14 — Exercises

## Exercise 1: Cloudinary Avatar

Implement:

POST /api/users/avatar/cloud

Requirements:

- JWT authentication.
- One image upload.
- File-size limit.
- Cloudinary upload.
- Store URL and public ID.
- Delete previous image.

## Exercise 2: S3 Document Upload

Implement:

POST /api/attachments

Requirements:

- JWT authentication.
- Accept PDF files only.
- Generate object key on backend.
- Upload to private S3 bucket.
- Save metadata in MongoDB.

## Exercise 3: Private Download

Implement:

GET /api/attachments/:id/download-url

Requirements:

- Authenticate user.
- Verify ownership or admin role.
- Generate a five-minute signed URL.
- Return the URL.

## Exercise 4: File Deletion

Implement:

DELETE /api/attachments/:id

Requirements:

- Verify ownership.
- Delete cloud object.
- Delete MongoDB metadata.
- Handle storage errors safely.

## Exercise 5: Storage Abstraction

Create:

```text
src/services/storage/
```

Implement two providers:

- Cloudinary.
- S3.

Make controllers use a common interface instead of directly importing provider-specific SDKs.

---

# Part 15 — Knowledge Check

1. What is object storage?
2. What is the difference between a bucket and an object?
3. Why can local file storage become problematic with multiple servers?
4. What is Cloudinary particularly useful for?
5. What is Amazon S3?
6. What is an S3 object key?
7. What is the purpose of Cloudinary's public ID?
8. What is a signed URL?
9. Why should private buckets remain private?
10. What is a direct upload?
11. How does a direct upload reduce backend workload?
12. What is the principle of least privilege?
13. Why should controllers not directly depend on storage SDKs?
14. What is a compensating action when cloud upload succeeds but database saving fails?

---

# Chapter Summary

We learned:

- Object storage fundamentals.
- Cloudinary configuration.
- Cloudinary uploads.
- Image transformations.
- Amazon S3 configuration.
- S3 uploads and deletion.
- Signed download URLs.
- Direct uploads.
- MVC storage abstraction.
- Cloud storage security.

## Next Chapter — Database Relationships and Advanced MongoDB with Mongoose

We'll learn:

1. MongoDB references.
2. One-to-one relationships.
3. One-to-many relationships.
4. Many-to-many relationships.
5. Mongoose populate.
6. Embedding vs referencing.
7. Aggregation pipelines.
8. Indexes.
9. Transactions.
10. Database performance.

**Goal:** Build APIs that manage connected data correctly and efficiently.
