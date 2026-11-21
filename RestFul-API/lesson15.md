
# Chapter 15 — API Testing with Jest and Supertest

## Learning Objectives

By the end of this chapter, you will understand:

1. Why automated testing is important.
2. Unit testing vs integration testing.
3. Jest fundamentals.
4. Test suites, test cases, and assertions.
5. Supertest for testing Express APIs.
6. Testing registration and login.
7. Testing JWT authentication.
8. Testing role-based access control.
9. Testing MongoDB operations.
10. Test databases and cleanup.
11. Testing error responses.
12. Organizing a professional testing structure.

---

# 1. Why Do We Need API Testing?

Imagine you've built an API with these endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/users/profile
PATCH  /api/users/profile
DELETE /api/users/profile

GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id/role
DELETE /api/users/:id

POST   /api/users/avatar
GET    /api/posts
```

You manually test all of them using Postman.

Everything works.

Then you modify the authentication middleware.

Suddenly, users cannot access their profiles.

Or perhaps you accidentally allow normal users to access admin endpoints.

These are regressions.

A regression occurs when a change introduces a bug into functionality that previously worked.

Automated tests help detect these problems.

## What Is Automated Testing?

Automated testing means writing code that checks whether your application behaves as expected.

Instead of manually sending requests and inspecting responses, a test program does it automatically.

Example:

```js
expect(response.status).toBe(201);
```

This checks whether the API returned HTTP status 201.

If it returns something else, the test fails.

---

# 2. Types of Software Testing

Before learning Jest, understand the different testing levels.

## 2.1 Unit Testing

Unit testing checks a small, isolated piece of code.

For example, imagine this utility:

File: `src/utils/calculateTotal.js`

```js
function calculateTotal(price, quantity) {
  return price * quantity;
}

module.exports = calculateTotal;
```

Unit test:

```js
const calculateTotal = require("./calculateTotal");

test("calculates the total price", () => {
  const result = calculateTotal(100, 3);

  expect(result).toBe(300);
});
```

We are testing one function without starting Express or connecting to MongoDB.

That is unit testing.

## 2.2 Integration Testing

Integration testing checks whether multiple components work together.

For example:

```text
HTTP Request
     |
     v
Express Route
     |
     v
Authentication Middleware
     |
     v
Controller
     |
     v
MongoDB
     |
     v
HTTP Response
```

A registration integration test may check whether:

1. Express receives the request.
2. Validation middleware validates the input.
3. The controller hashes the password.
4. MongoDB stores the user.
5. The API returns the expected response.

This tests multiple components together.

## 2.3 End-to-End Testing

End-to-end testing checks a complete user workflow from the perspective of the system's user.

Example:

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
Access Profile
   |
   v
Update Profile
```

E2E tests often involve more infrastructure, such as a running application and browser or external services.

For our current chapter, we'll focus mainly on unit and integration testing.

---

# 3. Understanding Jest

Jest is a JavaScript testing framework.

It provides tools for:

- Writing test cases.
- Running tests.
- Comparing expected and actual values.
- Mocking functions.
- Measuring test coverage.

Install Jest:

```bash
npm install --save-dev jest
```

Why `--save-dev`?

Because Jest is a development dependency.

It is needed when developing and testing the application, not normally when running the production API.

## Configure Jest

Open `package.json`.

Add:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --runInBand",
    "test:watch": "jest --watch"
  }
}
```

`--runInBand` runs tests serially in one process.

This can make database integration tests easier to manage.

Run:

```bash
npm test
```

---

# 4. Understanding Jest Fundamentals

Let's create our first test.

File:

`src/utils/math.js`

```js
function add(a, b) {
  return a + b;
}

module.exports = {
  add
};
```

Create:

`tests/math.test.js`

```js
const { add } = require("../src/utils/math");

test("adds two numbers", () => {
  const result = add(5, 3);

  expect(result).toBe(8);
});
```

Run:

```bash
npm test
```

Jest discovers test files with names such as:

```text
math.test.js
math.spec.js
```

## Understand the Test Structure

```js
test("adds two numbers", () => {
  const result = add(5, 3);

  expect(result).toBe(8);
});
```

There are three important parts.

### 1. test()

Defines a test case.

```js
test("adds two numbers", () => {});
```

The first argument describes what we're testing.

### 2. expect()

Contains the actual result.

```js
expect(result);
```

### 3. Matcher

Defines what we expect.

```js
.toBe(8);
```

Together:

```js
expect(result).toBe(8);
```

Means:

"The result should be exactly 8."

## Common Jest Matchers

```js
expect(5).toBe(5);

expect({ name: "Ali" }).toEqual({
  name: "Ali"
});

expect(true).toBeTruthy();

expect(false).toBeFalsy();

expect(null).toBeNull();

expect([1, 2, 3]).toContain(2);

expect("hello").toMatch(/hello/);

expect(10).toBeGreaterThan(5);

expect(5).toBeLessThan(10);
```

Important difference:

`toBe()` checks primitive values and object identity.

`toEqual()` checks recursively whether object or array values match.

---

# 5. Grouping Tests with describe()

When an application becomes large, we need to organize tests.

Jest provides `describe()`.

Example:

```js
describe("Math utilities", () => {
  test("adds numbers", () => {
    expect(2 + 3).toBe(5);
  });

  test("multiplies numbers", () => {
    expect(2 * 3).toBe(6);
  });
});
```

Output:

```text
Math utilities
  ✓ adds numbers
  ✓ multiplies numbers
```

You can create nested test groups:

```js
describe("User utilities", () => {
  describe("Email validation", () => {
    test("accepts a valid email", () => {});

    test("rejects an invalid email", () => {});
  });
});
```

This makes large test suites easier to understand.

---

# 6. Asynchronous Testing

Our REST API uses asynchronous operations:

- MongoDB queries.
- Password hashing.
- JWT operations.
- File uploads.

Jest must wait for asynchronous operations to finish.

Use `async` and `await`.

Example:

```js
function getUser() {
  return Promise.resolve({
    name: "Ali"
  });
}

test("returns a user", async () => {
  const user = await getUser();

  expect(user.name).toBe("Ali");
});
```

If you don't await the asynchronous operation, Jest may finish the test before the assertion executes.

## Testing Rejected Promises

```js
function getUser() {
  return Promise.reject(
    new Error("User not found")
  );
}

test("throws when user is missing", async () => {
  await expect(getUser()).rejects.toThrow(
    "User not found"
  );
});
```

Use `.rejects` for rejected promises and `.resolves` for fulfilled promises.

---

# 7. What Is Supertest?

Jest runs our tests.

But how do we send HTTP requests to our Express application?

We can use Supertest.

Supertest allows us to test HTTP endpoints without manually starting a server and sending requests through Postman.

Install:

```bash
npm install --save-dev supertest
```

Conceptually:

```text
Jest
  |
  v
Supertest
  |
  v
Express Application
  |
  v
Route / Middleware / Controller
  |
  v
MongoDB
```

Supertest sends requests to the Express application and allows us to inspect responses.

---

# 8. Important Architecture Change: Separate app.js and server.js

Our project already uses two files:

- `app.js`: configures Express.
- `server.js`: connects to MongoDB and starts the server.

This separation is extremely useful for testing.

Why?

When testing endpoints, we don't want every test to start a permanent network server.

We can import the Express application directly.

Our structure:

```text
project/
│
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   └── ...
│
└── tests/
    └── ...
```

## app.js

Example:

```js
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Add your existing error-handling middleware here,
// after all routes.

module.exports = app;
```

Notice:

```js
module.exports = app;
```

We export the application.

We do not call `app.listen()` here.

## server.js

```js
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
```

The server entry point starts the database connection and HTTP listener.

The application itself can be imported independently.

This separation makes testing easier.

---

# 9. Your First API Integration Test

Let's test a simple endpoint.

Suppose we have:

```js
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running"
  });
});
```

Create:

`tests/health.test.js`

```js
const request = require("supertest");
const app = require("../src/app");

describe("GET /api/health", () => {
  test("returns API health status", async () => {
    const response = await request(app)
      .get("/api/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      success: true,
      message: "API is running"
    });
  });
});
```

Run:

```bash
npm test
```

Let's understand:

```js
request(app)
```

Tells Supertest which Express application to test.

```js
.get("/api/health")
```

Sends a GET request.

```js
expect(response.status).toBe(200);
```

Checks the HTTP status code.

```js
expect(response.body.success).toBe(true);
```

Checks the JSON response.

We can also test POST requests:

```js
const response = await request(app)
  .post("/api/example")
  .send({
    name: "Ali"
  });
```

`.send()` sends the request body.

---

# 10. Preparing a Separate Test Database

We should never run integration tests against our actual development or production database.

Why?

Tests may:

- Create users.
- Delete users.
- Change passwords.
- Create posts.
- Modify records.

If we use our real database, testing could destroy actual data.

We should use a separate test database.

Example environment configuration:

```env
MONGO_URI=mongodb://127.0.0.1:27017/secure_api
TEST_MONGO_URI=mongodb://127.0.0.1:27017/secure_api_test

JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=1h
```

For real deployments, test secrets should be separate from production secrets.

Install dotenv if it is not already installed:

```bash
npm install dotenv
```

Load environment variables in the Jest setup file.

Create:

`tests/setup.js`

```js
require("dotenv").config();
```

Configure Jest:

```json
{
  "jest": {
    "setupFiles": [
      "<rootDir>/tests/setup.js"
    ]
  }
}
```

Important:

Use a dedicated test database and make sure the application cannot accidentally connect to production during tests.

For CI environments, provision a dedicated MongoDB instance or use an isolated test database.

---

# 11. Database Connection for Tests

Our normal `connectDB()` function uses `MONGO_URI`.

For testing, we want to use `TEST_MONGO_URI`.

A simple database configuration:

`src/config/db.js`

```js
const mongoose = require("mongoose");

async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) {
    throw new Error("MongoDB URI is missing");
  }

  await mongoose.connect(uri);

  console.log("MongoDB connected");
}

module.exports = connectDB;
```

Create:

`tests/db.js`

```js
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");

async function connectTestDB() {
  const uri = process.env.TEST_MONGO_URI;

  if (!uri) {
    throw new Error("TEST_MONGO_URI is missing");
  }

  await connectDB(uri);
}

async function clearDatabase() {
  const collections = mongoose.connection.collections;

  for (const collection of Object.values(collections)) {
    await collection.deleteMany({});
  }
}

async function closeDatabase() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}

module.exports = {
  connectTestDB,
  clearDatabase,
  closeDatabase
};
```

The cleanup function removes documents between tests.

The closing function drops the test database and closes the connection.

Only use these functions with a dedicated test database.

---

# 12. Jest Setup and Teardown

Jest provides lifecycle hooks.

These allow us to perform operations before and after tests.

Important hooks:

| Hook | Purpose |
|---|---|
| beforeAll | Runs once before all tests in a scope |
| afterAll | Runs once after all tests in a scope |
| beforeEach | Runs before every test |
| afterEach | Runs after every test |

Example:

`tests/auth.test.js`

```js
const request = require("supertest");
const app = require("../src/app");

const {
  connectTestDB,
  clearDatabase,
  closeDatabase
} = require("./db");

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe("Authentication API", () => {
  test("example test", async () => {
    expect(true).toBe(true);
  });
});
```

Execution order:

```text
beforeAll
    |
    v
beforeEach
    |
    v
Test 1
    |
    v
beforeEach
    |
    v
Test 2
    |
    v
afterAll
```

The actual order applies within the relevant test scope.

---

# 13. Testing User Registration

Now let's test our actual API.

Endpoint:

```http
POST /api/auth/register
```

Suppose the request body is:

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "StrongPassword123"
}
```

We want to test several scenarios.

### Test 1: Successful Registration

Expected:

- Status code: 201.
- User is created.
- Password is not returned.

### Test 2: Duplicate Email

Expected:

- Registration is rejected.
- Duplicate user is not created.

### Test 3: Invalid Email

Expected:

- Validation error.
- User is not created.

### Test 4: Missing Password

Expected:

- Validation error.
- User is not created.

Create:

`tests/auth.test.js`

```js
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");

describe("POST /api/auth/register", () => {
  test("registers a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ali",
        email: "ali@example.com",
        password: "StrongPassword123"
      });

    expect(response.status).toBe(201);

    expect(response.body.success).toBe(true);

    const user = await User.findOne({
      email: "ali@example.com"
    }).select("+password");

    expect(user).not.toBeNull();

    expect(user.password).not.toBe(
      "StrongPassword123"
    );

    expect(response.body.data.password).toBeUndefined();
  });

  test("rejects duplicate email", async () => {
    await User.create({
      name: "Ali",
      email: "ali@example.com",
      password: "hashedPassword"
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Another Ali",
        email: "ali@example.com",
        password: "StrongPassword123"
      });

    expect(response.status).toBe(409);
  });

  test("rejects invalid email", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ali",
        email: "invalid-email",
        password: "StrongPassword123"
      });

    expect(response.status).toBe(400);
  });

  test("rejects missing password", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Ali",
        email: "ali@example.com"
      });

    expect(response.status).toBe(400);
  });
});
```

Important:

This example assumes your API returns:

- `201` for successful registration.
- `409` for duplicate email.
- `400` for validation errors.
- A response containing `success` and `data`.

Adjust the assertions to match your actual API response contract.

Also, when creating a user directly with `User.create()` in a test, use the same password hashing process as your application if the model has no password-hashing hook. The literal `"hashedPassword"` is only sufficient for this duplicate-email test because login is not being tested.

---

# 14. Testing Login and JWT

Endpoint:

```http
POST /api/auth/login
```

We want to check:

1. Correct credentials produce a JWT.
2. Incorrect password is rejected.
3. Unknown email is rejected.
4. JWT is returned in the expected response field.
5. Password is never returned.

Example:

```js
const bcrypt = require("bcrypt");
const User = require("../src/models/User");

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const hashedPassword = await bcrypt.hash(
      "StrongPassword123",
      10
    );

    await User.create({
      name: "Ali",
      email: "ali@example.com",
      password: hashedPassword,
      role: "user"
    });
  });

  test("logs in with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ali@example.com",
        password: "StrongPassword123"
      });

    expect(response.status).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.data.token).toEqual(
      expect.any(String)
    );

    expect(response.body.data.user.password).toBeUndefined();
  });

  test("rejects incorrect password", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "ali@example.com",
        password: "WrongPassword123"
      });

    expect(response.status).toBe(401);
  });

  test("rejects unknown email", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "StrongPassword123"
      });

    expect(response.status).toBe(401);
  });
});
```

Again, match the response paths and status codes to your implementation.

---

# 15. Testing JWT Authentication Middleware

Now we test a protected endpoint.

Example:

```http
GET /api/users/profile
```

This endpoint requires:

```http
Authorization: Bearer YOUR_JWT
```

We need three scenarios.

| Scenario | Expected |
|---|---|
| No token | 401 Unauthorized |
| Invalid token | 401 Unauthorized |
| Valid token | 200 OK |

Example:

```js
const jwt = require("jsonwebtoken");
const User = require("../src/models/User");

describe("GET /api/users/profile", () => {
  let user;
  let token;

  beforeEach(async () => {
    user = await User.create({
      name: "Ali",
      email: "ali@example.com",
      password: "hashedPassword",
      role: "user"
    });

    token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );
  });

  test("rejects request without token", async () => {
    const response = await request(app)
      .get("/api/users/profile");

    expect(response.status).toBe(401);
  });

  test("rejects invalid token", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
  });

  test("allows request with valid token", async () => {
    const response = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

This tests the real authentication middleware.

Important:

The example assumes your middleware reads the user ID from `payload.id` and uses `JWT_SECRET`.

If your implementation uses a different JWT payload shape or environment variable, adapt the test accordingly.

---

# 16. Testing Role-Based Access Control

Our application has three roles:

```text
user
moderator
admin
```

Suppose we have:

```http
GET /api/admin/analytics/user-post-counts
```

Only administrators should access it.

We want to verify:

| User Role | Expected |
|---|---|
| user | 403 Forbidden |
| moderator | 403 Forbidden |
| admin | 200 OK |
| unauthenticated | 401 Unauthorized |

Example:

```js
const jwt = require("jsonwebtoken");

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
      algorithm: "HS256"
    }
  );
}

describe("Admin analytics authorization", () => {
  async function createUser(role) {
    const user = await User.create({
      name: `${role} user`,
      email: `${role}@example.com`,
      password: "hashedPassword",
      role
    });

    return {
      user,
      token: createToken(user)
    };
  }

  test("rejects normal user", async () => {
    const { token } = await createUser("user");

    const response = await request(app)
      .get("/api/admin/analytics/user-post-counts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("rejects moderator", async () => {
    const { token } = await createUser("moderator");

    const response = await request(app)
      .get("/api/admin/analytics/user-post-counts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("allows admin", async () => {
    const { token } = await createUser("admin");

    const response = await request(app)
      .get("/api/admin/analytics/user-post-counts")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
```

This is particularly important.

A test that only checks whether an admin can access an endpoint is incomplete.

We must also test whether unauthorized roles are denied.

---

# 17. Test Coverage

Test coverage measures how much of your code is executed by tests.

Jest can generate coverage reports.

Run:

```bash
npm test -- --coverage
```

Example output:

```text
File                % Stmts
---------------------------
authController.js     90%
userController.js     75%
authMiddleware.js    100%
authorize.js         100%
```

Common coverage metrics:

| Metric | Meaning |
|---|---|
| Statements | Executable statements tested |
| Branches | Conditional paths tested |
| Functions | Functions executed |
| Lines | Lines executed |

Example:

```js
function getDiscount(isPremium) {
  if (isPremium) {
    return 20;
  }

  return 0;
}
```

If tests only call:

```js
getDiscount(true);
```

Then the `false` branch is not tested.

We should test both:

```js
test("premium user gets discount", () => {
  expect(getDiscount(true)).toBe(20);
});

test("normal user gets no discount", () => {
  expect(getDiscount(false)).toBe(0);
});
```

Important:

High coverage does not automatically mean high-quality tests.

A test must verify meaningful application behavior.

---

# 18. Mocking: Testing Without Real Dependencies

Sometimes we don't want to call an actual external service.

Examples:

- Cloudinary.
- Amazon S3.
- Email providers.
- Payment gateways.

Mocking allows us to replace a dependency with a controlled fake implementation.

Suppose we have:

```js
async function sendWelcomeEmail(email) {
  // Calls an external email provider.
}
```

We can test our controller without actually sending an email.

Example:

```js
jest.mock("../src/services/emailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));
```

Then:

```js
const {
  sendWelcomeEmail
} = require("../src/services/emailService");

test("calls email service", async () => {
  await sendWelcomeEmail("ali@example.com");

  expect(sendWelcomeEmail).toHaveBeenCalledWith(
    "ali@example.com"
  );
});
```

Important distinction:

- A unit test may mock MongoDB or external dependencies.
- An integration test should generally use a real test database.
- External services are often mocked during integration tests.

Do not mock every dependency in an integration test. Otherwise, you may not actually be testing the integration.

---

# 19. Testing File Uploads

We previously implemented file uploads using Multer.

Supertest supports multipart file uploads.

Example:

```js
const path = require("path");

test("uploads a profile image", async () => {
  const response = await request(app)
    .post("/api/users/avatar")
    .set("Authorization", `Bearer ${token}`)
    .attach(
      "avatar",
      path.join(__dirname, "fixtures/avatar.jpg")
    );

  expect(response.status).toBe(200);
});
```

`.attach()` attaches a file to the multipart request.

For this test, create a test fixture:

```text
tests/
│
├── fixtures/
│   └── avatar.jpg
│
└── upload.test.js
```

You should also test:

- Missing file.
- Unsupported file type.
- File exceeding the size limit.
- Unauthenticated upload.
- Upload to the wrong field name.

Use harmless test files, not real user documents.

For cloud storage integration, mock Cloudinary or S3 in automated tests so that tests do not upload real files or incur external costs.

---

# 20. A Professional Testing Structure

As our project grows, organize tests by feature.

Example:

```text
project/
│
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
│
├── tests/
│   ├── setup.js
│   ├── db.js
│   │
│   ├── unit/
│   │   ├── math.test.js
│   │   └── validators.test.js
│   │
│   ├── integration/
│   │   ├── auth.test.js
│   │   ├── users.test.js
│   │   ├── posts.test.js
│   │   └── authorization.test.js
│   │
│   └── fixtures/
│       └── avatar.jpg
│
├── package.json
└── server.js
```

This separates small isolated tests from API integration tests.

---

# 21. Important Testing Best Practices

## 1. Never Use Production Database

Always use a separate test database.

## 2. Test Both Success and Failure

For every important endpoint, test:

- Valid input.
- Invalid input.
- Missing authentication.
- Insufficient permissions.
- Missing records.
- Unexpected errors where relevant.

## 3. Don't Depend on Test Execution Order

Each test should prepare its own required data.

Avoid assuming that another test has already created a user.

## 4. Keep Tests Independent

Clean up data between tests or use another isolation strategy.

## 5. Test Security Rules

Especially:

- Password is never returned.
- Normal users cannot assign themselves admin roles.
- Users cannot access another user's private resources.
- Invalid JWTs are rejected.
- Admin-only routes enforce authorization.

## 6. Avoid Real External Services

Mock cloud storage, email, and payment services unless you're deliberately running a controlled integration test.

## 7. Use Meaningful Assertions

A request returning status 200 does not prove the business logic is correct.

Also inspect the response data and relevant database state.

---

# 22. Chapter Summary

| Concept | Purpose |
|---|---|
| Unit testing | Tests individual functions |
| Integration testing | Tests components working together |
| E2E testing | Tests complete workflows |
| Jest | JavaScript testing framework |
| Supertest | Sends HTTP requests to Express apps |
| describe() | Groups related tests |
| test() | Defines a test case |
| expect() | Defines expected behavior |
| beforeEach() | Prepares each test |
| afterAll() | Performs final cleanup |
| Mocking | Replaces real dependencies with controlled implementations |
| Coverage | Measures executed code paths |

---

# 23. Practical Assignment

Build an automated test suite for your existing REST API.

## Part A — Authentication

Write tests for:

1. Successful registration.
2. Duplicate email.
3. Invalid email.
4. Missing password.
5. Successful login.
6. Incorrect password.
7. Unknown email.

## Part B — JWT

Write tests for:

1. Missing token.
2. Invalid token.
3. Expired token.
4. Valid token.
5. Protected profile endpoint.

## Part C — RBAC

Write tests for:

1. User accessing user endpoint.
2. User accessing admin endpoint.
3. Moderator accessing admin endpoint.
4. Admin accessing admin endpoint.
5. Unauthenticated access.

## Part D — User Management

Write tests for:

1. Updating own profile.
2. Updating another user's profile.
3. Admin updating another user's role.
4. Normal user changing their own role.
5. Deleting own account.
6. Admin deleting another user.

## Part E — File Uploads

Write tests for:

1. Valid image upload.
2. Unsupported file.
3. Oversized file.
4. Missing file.
5. Unauthorized upload.

## Part F — Database

Write tests for:

1. Creating a post.
2. Retrieving posts with populated author information.
3. Preventing duplicate course enrollment.
4. Aggregation result correctness.

---

# 24. Knowledge Check

Answer these questions before moving forward.

1. What is the difference between unit testing and integration testing?
2. Why do we use Jest?
3. What does Supertest do?
4. Why should we export the Express app separately from `server.js`?
5. What does `expect(response.status).toBe(200)` verify?
6. Why do we use `async/await` in asynchronous tests?
7. What is the purpose of `beforeEach()`?
8. Why should tests use a separate database?
9. What is mocking?
10. What is test coverage?
11. Why should we test both successful and unsuccessful authorization?
12. Why is high test coverage not enough to guarantee software quality?

---

# Next Chapter — Production-Ready REST API: Error Handling, Logging, Rate Limiting, and Security

In the next chapter, we'll improve the API for real-world deployment:

1. Centralized error handling.
2. Custom error classes.
3. Async controller error handling.
4. Request logging.
5. Rate limiting.
6. CORS.
7. Helmet security headers.
8. Environment configuration.
9. API versioning.
10. Production deployment checklist.
