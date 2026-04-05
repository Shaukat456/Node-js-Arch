Perfect 👌 — we’ll now dive deep into **API architecture patterns** starting with:

### ✅ MVC → Clean Architecture → Hexagonal Architecture

These are _core backend design patterns_ that separate logic and make your code scalable, testable, and maintainable.

We’ll go **step-by-step**, each concept with:

- Real-world analogies
- Node.js examples
- Interview-level understanding

---

## 🧩 1. MVC (Model–View–Controller)

### 🎯 Purpose

MVC is the _oldest and most common_ architecture used in web development.
It separates your application into **three layers** — making your code organized.

```
Request → Controller → Model → (Database)
Response ← View ← Controller
```

---

### ⚙️ Components

#### 1. Model

- Represents **data** and **business logic**.
- Defines _what data looks like_ (schema) and _how it behaves_.
- Example: Mongoose model in Node.js.

```js
// models/User.js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
module.exports = mongoose.model("User", userSchema);
```

---

#### 2. View

- Handles **what the user sees**.
- In Node.js (Express), this could be HTML templates (EJS, Pug).
- In APIs, “View” is often replaced by the **JSON response** you send.

```js
// JSON response as a view
res.json({ message: "User created successfully", data: user });
```

---

#### 3. Controller

- The **brain** — receives requests, talks to the Model, and sends the View (response).

```js
// controllers/userController.js
const User = require("../models/User");
exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json({ user });
};
```

---

#### 4. Routes

- Connects HTTP endpoints to controllers.

```js
// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { createUser } = require("../controllers/userController");

router.post("/users", createUser);
module.exports = router;
```

---

### 🧠 Analogy

Think of MVC like a **restaurant**:

- **Controller** → Waiter (takes your order, delivers it)
- **Model** → Chef (prepares the food)
- **View** → Dish presented to the customer (HTML/JSON)

---

### 💬 Interview Questions

- Q: What is MVC and why use it?
  → It separates logic, makes code modular and testable.
- Q: Where do you write validation logic in MVC?
  → In the Controller (or separate middleware).
- Q: What is the “View” in REST APIs?
  → The JSON or data returned to the client.

---

## 🧱 2. Clean Architecture

### 🎯 Purpose

Proposed by **Robert C. Martin (Uncle Bob)**, Clean Architecture emphasizes **independence** —
your **business logic** should not depend on frameworks, databases, or external tools.

It’s structured in **concentric layers**:

```
       +---------------------------+
       |     Presentation Layer    |
       +---------------------------+
       |     Application Layer     |
       +---------------------------+
       |     Domain Layer          |
       +---------------------------+
       |     Infrastructure Layer  |
       +---------------------------+
```

---

### 🧩 Layers in Detail

#### 1. Domain Layer

- **Core business rules.**
- Pure logic — no database, no HTTP.
- Example: calculations, validation rules, entity definitions.

```js
// domain/entities/UserEntity.js
class User {
  constructor({ name, email }) {
    if (!email.includes("@")) throw new Error("Invalid email");
    this.name = name;
    this.email = email;
  }
}
module.exports = User;
```

---

#### 2. Application Layer

- **Use cases** (what the system does).
- Uses domain entities to perform actions.
- Example: `CreateUserUseCase`, `DeleteUserUseCase`.

```js
// application/use-cases/createUser.js
module.exports = async function createUser(userRepo, data) {
  const user = await userRepo.create(data);
  return user;
};
```

---

#### 3. Infrastructure Layer

- Actual **implementations** of external systems —
  e.g., database, HTTP, file system, etc.

```js
// infrastructure/repositories/mongoUserRepo.js
const User = require("../../models/User");
module.exports = {
  create: async (data) => await User.create(data),
};
```

---

#### 4. Presentation Layer

- API endpoints, CLI, or any entry point.
- Talks to the Application layer (use cases), not directly to the database.

```js
// controllers/userController.js
const createUser = require("../application/use-cases/createUser");
const userRepo = require("../infrastructure/repositories/mongoUserRepo");

exports.createUserController = async (req, res) => {
  const user = await createUser(userRepo, req.body);
  res.json(user);
};
```

---

### 🧠 Analogy

Clean Architecture is like **a power adapter**:

- You can plug any device (DB, UI, etc.) into it without breaking the system.
- Inner layers don’t know or care about the outer ones.

---

### 💬 Interview Questions

- Q: What problem does Clean Architecture solve?
  → Tight coupling between business logic and frameworks.
- Q: What’s the difference between MVC and Clean Architecture?
  → MVC mixes concerns (controller talks directly to model). Clean Architecture enforces clear boundaries.
- Q: Can you swap MongoDB with PostgreSQL easily?
  → Yes, because your business logic doesn’t depend on Mongo.

---

## 🔶 3. Hexagonal Architecture (Ports & Adapters)

### 🎯 Purpose

Hexagonal Architecture (aka **Ports and Adapters Pattern**) is a practical form of Clean Architecture.
It helps your application **talk to the outside world** cleanly.

```
          +----------------------+
          |     Application      |
          +----------------------+
     /------------|-------------\
   Port A       Port B         Port C
 (HTTP API)  (Database)     (Message Queue)
```

---

### 🧩 Key Concepts

- **Port:** Interface (a contract that defines interaction)
- **Adapter:** Actual implementation that plugs into that port

---

### ⚙️ Example (in Node.js)

#### Port (Interface)

```js
// ports/UserRepository.js
class UserRepository {
  async create(userData) {
    throw new Error("Not implemented");
  }
}
module.exports = UserRepository;
```

#### Adapter (Implementation)

```js
// adapters/MongoUserRepository.js
const UserRepository = require("../ports/UserRepository");
const User = require("../models/User");

class MongoUserRepository extends UserRepository {
  async create(userData) {
    return await User.create(userData);
  }
}
module.exports = MongoUserRepository;
```

#### Application Core

```js
// application/CreateUser.js
module.exports = class CreateUser {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
  async execute(data) {
    return await this.userRepo.create(data);
  }
};
```

#### Controller (driving adapter)

```js
const MongoUserRepository = require("../adapters/MongoUserRepository");
const CreateUser = require("../application/CreateUser");

const userRepo = new MongoUserRepository();
const createUser = new CreateUser(userRepo);

exports.createUserController = async (req, res) => {
  const user = await createUser.execute(req.body);
  res.json(user);
};
```

---

### 🧠 Analogy

Think of your app like a **universal socket** —
different devices (HTTP API, Database, Queue) can plug in, as long as they match the socket’s shape (interface).

---

### 💬 Interview Questions

- Q: Why use Hexagonal Architecture?
  → To make your codebase independent from frameworks and easy to test/mock.
- Q: What’s the difference between Ports and Adapters?
  → Ports define interfaces; Adapters implement them.
- Q: How is it different from Clean Architecture?
  → It’s a concrete implementation pattern of Clean Architecture principles.

---
