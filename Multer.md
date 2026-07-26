### 

Working with files is one of the **most common backend tasks** in Express. Almost every production application deals with files:

* 📷 User profile pictures
* 📄 PDFs
* 🎥 Videos
* 📁 Documents
* 📊 Excel files
* 🎵 Audio
* 📦 ZIP files

Today, we'll learn **from scratch**, understand the concepts behind file handling, and then build practical examples.

---

# Roadmap

We'll learn in this order:

```
1. How files are sent over HTTP
2. Serving static files
3. Sending files to users
4. Uploading files (Multer)
5. Single file upload
6. Multiple file upload
7. File validation
8. File storage
9. Production storage (AWS S3, Cloudinary)
10. Security Best Practices
```

---

# Part 1 — How Files Travel in HTTP

Before Express, let's understand what happens.

Suppose you open

```
http://localhost:3000/image.png
```

Your browser sends

```
GET /image.png
```

Server responds

```
HTTP 200 OK

Content-Type: image/png

(binary image data)
```

The browser receives the bytes and displays the image.

Files are simply **bytes** sent over HTTP with the correct **Content-Type**.

---

## Everything is Bytes

A PDF

```
report.pdf
```

Internally

```
010101001101001...
```

Image

```
photo.jpg
```

Internally

```
111010010011...
```

Video

```
movie.mp4
```

Internally

```
100100010001...
```

Express doesn't care what the file is.

It only sends bytes.

---

# Part 2 — Serving Static Files

Imagine your project

```
project/

public/

logo.png

style.css

script.js

server.js
```

Normally

```
localhost:3000/logo.png
```

returns

```
404
```

because Express doesn't know where the file is.

Tell Express

```javascript
const express = require("express");

const app = express();

app.use(express.static("public"));

app.listen(3000);
```

Now

```
localhost:3000/logo.png
```

works.

---

## What is Static?

Static means

> Files that already exist.

Examples

```
logo.png

style.css

video.mp4

resume.pdf
```

No processing.

Express simply sends them.

---

Request Flow

```
Browser

↓

GET /logo.png

↓

Express

↓

public/logo.png

↓

Response
```

---

# Serving Multiple Static Folders

```
assets/

images/

videos/
```

```javascript
app.use(express.static("assets"));
app.use(express.static("images"));
```

Express searches each folder in order.

---

# Custom URL

Instead of

```
/logo.png
```

You may want

```
/static/logo.png
```

```javascript
app.use(
    "/static",
    express.static("public")
);
```

Now

```
localhost:3000/static/logo.png
```

---

# Part 3 — Sending a File

Sometimes files are outside the public folder.

Example

```
reports/

annual.pdf
```

Use

```javascript
const path = require("path");

app.get("/report",(req,res)=>{

res.sendFile(
path.join(__dirname,
"reports",
"annual.pdf")
);

});
```

Browser displays the PDF.

---

## sendFile()

Think

```
Express

↓

Locate file

↓

Read bytes

↓

Send bytes
```

---

# Downloading a File

Instead of opening

Force download.

```javascript
app.get("/download",(req,res)=>{

res.download(
"./files/report.pdf"
);

});
```

Browser

```
Save As...
```

appears.

---

Difference

```
sendFile()

↓

Display if possible

```

```
download()

↓

Always download
```

---

# Part 4 — Uploading Files

Uploading is the opposite.

Instead of

```
Server

↓

Client
```

Now

```
Client

↓

Server
```

---

Example

```
Choose File

↓

profile.jpg

↓

POST

↓

Server
```

---

Express **cannot** read uploaded files by itself.

Why?

Because uploaded files use

```
multipart/form-data
```

instead of JSON.

Need middleware.

Most popular

```
Multer
```

---

Install

```bash
npm install multer
```

---

# Part 5 — Multer

Think of Multer as

```
Incoming Request

↓

Reads multipart data

↓

Extracts files

↓

Stores them

↓

Adds info to req.file / req.files
```

Without Multer

```
req.body

↓

Only text
```

With Multer

```
req.file

↓

Uploaded file
```

---

# Basic Upload

Folder

```
uploads/
```

Server

```javascript
const multer = require("multer");

const upload =
multer({
destination:"uploads/"
});

app.post(
"/upload",
upload.single("image"),
(req,res)=>{

console.log(req.file);

res.send("Uploaded");

});
```

---

HTML

```html
<form
method="POST"
action="/upload"
enctype="multipart/form-data">

<input
type="file"
name="image">

<button>
Upload
</button>

</form>
```

---

Flow

```
Browser

↓

Choose image

↓

multipart/form-data

↓

Multer

↓

uploads/

↓

req.file
```

---

# Understanding upload.single()

```javascript
upload.single("image")
```

Means

Only one file.

The field name

```
image
```

must match

```html
<input
name="image">
```

---

After Upload

```
req.file
```

contains

```javascript
{
filename:

"234234234-photo.jpg",

path:

"uploads/234234234-photo.jpg",

size:

182937,

mimetype:

"image/jpeg"
}
```

---

# Multiple Files

Suppose

```html
<input
type="file"
multiple
name="photos">
```

Then

```javascript
upload.array(
"photos",
5
)
```

Maximum

```
5 files
```

Now

```
req.files
```

is an array.

---

# Different Fields

Example

```
Profile Picture

Resume
```

```javascript
upload.fields([

{name:"avatar",maxCount:1},

{name:"resume",maxCount:1}

])
```

Now

```
req.files.avatar

req.files.resume
```

---

# Part 6 — Custom File Names

By default

```
abc123.jpg
```

Sometimes

Need

```
user-15.jpg
```

Use

```javascript
const storage =
multer.diskStorage({

destination:
"./uploads",

filename:
(req,file,cb)=>{

cb(
null,
Date.now()+"-"+file.originalname
);

}

});

const upload =
multer({storage});
```

---

# Part 7 — File Validation

Never trust uploads.

Suppose hacker uploads

```
virus.exe
```

Pretending

```
photo.jpg
```

Reject it.

```javascript
fileFilter:
(req,file,cb)=>{

if(
file.mimetype==="image/jpeg"
){

cb(null,true);

}else{

cb(
new Error("Only images")
);

}

}
```

---

Limit Size

```javascript
limits:{

fileSize:
2*1024*1024

}
```

2 MB

---

# Part 8 — Reading Files

Node has

```
fs
```

(File System)

```javascript
const fs =
require("fs");
```

Read

```javascript
fs.readFile(
"./notes.txt",
"utf8",
(err,data)=>{

console.log(data);

});
```

---

Promise version

```javascript
const fs =
require("fs/promises");

const data =
await fs.readFile(
"./notes.txt",
"utf8"
);
```

Preferred in modern Express apps.

---

# Writing Files

```javascript
await fs.writeFile(

"./notes.txt",

"Hello"

);
```

---

Append

```javascript
await fs.appendFile(

"./notes.txt",

"\nNew line"

);
```

---

Delete

```javascript
await fs.unlink(
"./notes.txt"
);
```

---

# Production Storage

Large companies rarely store uploaded files on the same server.

Instead

```
Browser

↓

Express

↓

AWS S3
```

or

```
Browser

↓

Express

↓

Cloudinary
```

Advantages

* Scalable
* Durable
* CDN support
* Easier backups
* Multiple application servers can access the same files

---

# Security Best Practices

Never trust uploaded files.

✔ Validate MIME type (and ideally inspect file contents)

✔ Limit file size

✔ Rename uploaded files

✔ Store uploads outside the public folder unless they are intentionally public

✔ Scan uploads for malware in high-security systems

✔ Restrict allowed extensions

✔ Generate random filenames to avoid collisions

✔ Check user authorization before allowing uploads or downloads

✔ Don't allow executable files

✔ Stream large files instead of loading them completely into memory

---

# Real Production Flow

```
User

↓

Choose profile.jpg

↓

POST multipart/form-data

↓

Express

↓

Multer

↓

Validate

↓

Virus Scan (optional)

↓

Rename

↓

Upload to AWS S3

↓

Store file URL in Database

↓

Return Success
```

---

# Summary

| Feature                 | Express API                                |
| ----------------------- | ------------------------------------------ |
| Serve static files      | `express.static()`                         |
| Send a file             | `res.sendFile()`                           |
| Force download          | `res.download()`                           |
| Upload one file         | `upload.single()`                          |
| Upload many files       | `upload.array()`                           |
| Upload different fields | `upload.fields()`                          |
| Read file               | `fs.readFile()` / `fs.promises.readFile()` |
| Write file              | `fs.writeFile()`                           |
| Delete file             | `fs.unlink()`                              |
| Rename uploaded files   | `multer.diskStorage()`                     |
| Validate uploads        | `fileFilter`, `limits`                     |

---

# What Production Developers Know Beyond This

Once you're comfortable with the basics, the next topics are:

1. **Streams** (`fs.createReadStream()` and `stream.pipeline()`) for efficiently serving large files.
2. **Memory Storage vs Disk Storage** in Multer and when to use each.
3. **Direct browser uploads to AWS S3** using pre-signed URLs (reduces load on your Express server).
4. **Image processing** with libraries like Sharp (resize, compress, convert formats).
5. **Chunked and resumable uploads** for very large files.
6. **Content-Disposition** and **Content-Type** headers for controlling browser behavior.
7. **Range Requests** for video/audio streaming.
8. **Secure private file access** using signed URLs or authenticated download endpoints.

These are the techniques commonly used in production systems that handle large volumes of file uploads and downloads.
