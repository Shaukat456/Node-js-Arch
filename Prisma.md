---
title: "Prisma ORM — From Zero to a Working Node.js App"
description: "A complete, from-scratch guide to Prisma ORM covering every core concept, plus a full Task Manager REST API built with Node.js, Express, and Prisma 7."
---

# Prisma ORM — From Zero to a Working Node.js App

This guide teaches Prisma ORM from the ground up, one concept at a time, and then uses everything you learned to build a real **Task Manager REST API** with Node.js and Express.

> **A note on versions.** Prisma shipped a major version — **Prisma ORM 7** — in November 2025. It removed the old Rust query engine in favor of a pure JavaScript/TypeScript runtime, and two things changed as a result: Prisma Client now **requires a database driver adapter**, and every project now uses a **`prisma.config.ts`** file for CLI configuration. This guide teaches Prisma the way it works today. If you see an older tutorial that calls `new PrismaClient()` with nothing inside the parentheses, that's the Prisma 6 way — it won't work on 7.

---

## Table of Contents

**Part 1 — Understanding Prisma ORM**
1. [What Is Prisma ORM?](#1-what-is-prisma-orm)
2. [Why Use Prisma?](#2-why-use-prisma)
3. [The Prisma Toolchain](#3-the-prisma-toolchain)
4. [Installing Prisma & Project Setup](#4-installing-prisma--project-setup)
5. [The Prisma Schema File, Explained](#5-the-prisma-schema-file-explained)
6. [`prisma.config.ts`, Explained](#6-prismaconfigts-explained)
7. [Prisma Migrate](#7-prisma-migrate)
8. [Instantiating Prisma Client (Driver Adapters)](#8-instantiating-prisma-client-driver-adapters)
9. [CRUD Operations](#9-crud-operations)
10. [Filtering, Sorting & Pagination](#10-filtering-sorting--pagination)
11. [Working With Relations](#11-working-with-relations)
12. [Aggregations, Grouping & Counting](#12-aggregations-grouping--counting)
13. [Transactions](#13-transactions)
14. [Client Extensions (`$extends`)](#14-client-extensions-extends)
15. [Error Handling](#15-error-handling)
16. [Prisma Studio](#16-prisma-studio)

**Part 2 — Build a Task Manager REST API**
17. [Project Setup](#17-project-setup)
18. [Designing the Schema](#18-designing-the-schema)
19. [Running the Migration](#19-running-the-migration)
20. [Building the Express Server](#20-building-the-express-server)
21. [Implementing the Routes](#21-implementing-the-routes)
22. [Testing the API](#22-testing-the-api)
23. [Full Project File Tree](#23-full-project-file-tree)

**Part 3 — Wrap-Up**
24. [Best Practices](#24-best-practices)
25. [Next Steps & Resources](#25-next-steps--resources)

---

## Part 1 — Understanding Prisma ORM

### 1. What Is Prisma ORM?

Prisma is an open-source **ORM (Object-Relational Mapper)** for Node.js and TypeScript. Instead of writing raw SQL or hand-rolling model classes, you describe your database in one declarative file, and Prisma generates a fully type-safe client for you to query it with.

Prisma is made of four pieces that work together:

| Piece | What it does |
|---|---|
| **Prisma Schema** (`schema.prisma`) | A single file that describes your database connection and your data models. This is the source of truth. |
| **Prisma Client** | An auto-generated, type-safe query builder. You call `prisma.user.findMany()` instead of writing `SELECT * FROM "User"`. |
| **Prisma Migrate** | Turns changes to your schema into versioned SQL migration files and applies them to your database. |
| **Prisma Studio** | A visual, browser-based GUI for viewing and editing the data in your database. |

Prisma supports PostgreSQL, MySQL/MariaDB, SQLite, SQL Server, MongoDB, and CockroachDB, all through the same Client API.

### 2. Why Use Prisma?

- **Type safety** — every query you write is checked against your actual schema. Typo a field name or pass the wrong type, and your editor complains before you ever hit the database.
- **Autocomplete everywhere** — your editor knows every model, field, and relation, so you rarely need to open documentation mid-flow.
- **Declarative schema** — you describe *what* your data looks like, and Prisma figures out *how* to create it in SQL.
- **Automatic, reviewable migrations** — every schema change becomes a plain `.sql` file you can read, edit, and commit to version control.
- **One API, many databases** — switching from SQLite in development to PostgreSQL in production usually means changing a single line.

Worth knowing: Prisma isn't the only type-safe option — **Drizzle ORM** is a popular alternative that stays closer to raw SQL syntax instead of using a separate schema language. Prisma trades a little more "magic" (a custom schema file, a generated client) for a gentler learning curve and a richer toolchain (Migrate, Studio). Both are reasonable choices; this guide focuses on Prisma.

### 3. The Prisma Toolchain

A typical Prisma project has this shape:

```text
my-project/
├── prisma/
│   ├── schema.prisma       # your data model
│   └── migrations/         # auto-generated SQL migration history
├── generated/
│   └── prisma/              # the auto-generated Prisma Client code (do not edit)
├── prisma.config.ts         # CLI configuration (schema path, DB connection, etc.)
├── .env                      # environment variables (DATABASE_URL, etc.)
└── package.json
```

You'll mostly interact with Prisma through its CLI:

```bash
npx prisma init        # scaffold a new Prisma project
npx prisma migrate dev # create + apply a migration in development
npx prisma generate    # (re)generate the Prisma Client from your schema
npx prisma studio      # open the visual data browser
```

### 4. Installing Prisma & Project Setup

Let's set up a throwaway project just to learn the concepts (we'll build the real app in Part 2).

```bash
mkdir prisma-playground && cd prisma-playground
npm init -y
npm install typescript tsx @types/node --save-dev
npx tsc --init
```

Prisma 7 ships as an **ES Module**, so enable ESM in your project:

```json title="package.json"
{
  "type": "module"
}
```

```json title="tsconfig.json"
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true
  }
}
```

Now install Prisma itself, the client library, and (for this example) the SQLite driver adapter:

```bash
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
```

- **`prisma`** — the CLI (`migrate`, `generate`, `studio`, …)
- **`@prisma/client`** — the runtime library that powers the generated client
- **`@prisma/adapter-better-sqlite3`** — the driver adapter that lets Prisma talk to a local SQLite file
- **`dotenv`** — loads variables from `.env`

Initialize the project:

```bash
npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

This single command creates `prisma/schema.prisma`, a `.env` file, and `prisma.config.ts` — all pre-wired to talk to each other.

### 5. The Prisma Schema File, Explained

Everything about your data lives in `prisma/schema.prisma`. It has three kinds of blocks: **datasource**, **generator**, and **model**.

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

**`generator client`** tells Prisma what to generate and where. `provider = "prisma-client"` is the modern, Rust-free client generator. `output` is now **required** in Prisma 7 — the client is generated into your own project folder instead of hiding inside `node_modules`.

**`datasource db`** declares which database you're using (`sqlite`, `postgresql`, `mysql`, `sqlserver`, `mongodb`, `cockroachdb`). Notice there's no connection URL here — as of Prisma 7, the actual connection string lives in `prisma.config.ts`, not in the schema file.

**`model`** blocks map directly to database tables. Each line inside a model is a **field**: a name, a type, and optional attributes.

#### Scalar types

| Prisma type | Maps to (roughly) |
|---|---|
| `String` | text |
| `Int` | 32-bit integer |
| `BigInt` | 64-bit integer |
| `Float` | floating point number |
| `Decimal` | high-precision decimal (money, etc.) |
| `Boolean` | true/false |
| `DateTime` | date and time |
| `Json` | arbitrary JSON |
| `Bytes` | binary data |

Add a `?` after a type to make it optional (`content String?`), or `[]` to make it a list (`tags String[]`, only on databases that support native arrays, like PostgreSQL).

#### Common field attributes

| Attribute | Meaning |
|---|---|
| `@id` | marks the primary key |
| `@default(value)` | a default value — `@default(autoincrement())`, `@default(now())`, `@default(uuid())`, `@default(false)`, etc. |
| `@unique` | enforces a unique constraint on that column |
| `@updatedAt` | automatically set to the current time on every update |
| `@relation(...)` | describes how two models are connected |
| `@map("column_name")` | maps a field to a differently-named database column |
| `@@map("table_name")` | maps a model to a differently-named database table |
| `@@id([field1, field2])` | a composite primary key across multiple fields |
| `@@unique([field1, field2])` | a composite unique constraint |
| `@@index([field])` | adds a database index for faster lookups |

#### Relations

Prisma has three relation shapes, and you model all of them by pointing two fields at each other with `@relation`.

**One-to-many** (a user has many posts):

```prisma
model User {
  id    Int    @id @default(autoincrement())
  posts Post[]
}

model Post {
  id       Int  @id @default(autoincrement())
  author   User @relation(fields: [authorId], references: [id])
  authorId Int
}
```

The side holding `authorId` is the "foreign key" side — that's the table that actually gets a column added to it in SQL. The `Post[]` on `User` is just a virtual, Prisma-only field that lets you query in the other direction.

**One-to-one** (a user has one profile):

```prisma
model User {
  id      Int      @id @default(autoincrement())
  profile Profile?
}

model Profile {
  id     Int  @id @default(autoincrement())
  bio    String?
  user   User @relation(fields: [userId], references: [id])
  userId Int  @unique
}
```

The `@unique` on `userId` is what makes this one-to-one instead of one-to-many.

**Many-to-many** (posts have many tags, tags belong to many posts):

```prisma
model Post {
  id   Int   @id @default(autoincrement())
  tags Tag[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}
```

This is an **implicit** many-to-many: Prisma silently creates and manages a hidden join table for you. You never see it in the schema, and you rarely need to think about it.

#### Enums

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id   Int  @id @default(autoincrement())
  role Role @default(USER)
}
```

Enums give you a fixed set of allowed string values, checked at both the database and the TypeScript/JavaScript level.

### 6. `prisma.config.ts`, Explained

`prisma.config.ts` is the file the Prisma **CLI** reads to know where your schema is, where migrations live, and how to connect to your database. It's created automatically by `prisma init`.

```typescript title="prisma.config.ts"
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

- `schema` — path to your `schema.prisma` file
- `migrations.path` — where migration files are written
- `datasource.url` — the actual database connection string, read from your `.env` file through `env("DATABASE_URL")`
- `import "dotenv/config"` at the top is required — Prisma does **not** load `.env` files automatically anymore, `dotenv` does that job now

Your `.env` file just holds the raw value:

```text title=".env"
DATABASE_URL="file:./dev.db"
```

### 7. Prisma Migrate

Prisma Migrate turns edits to your schema into SQL files, then applies them to your database. The commands you'll use constantly:

```bash
npx prisma migrate dev --name init
```
Compares your schema to the database, generates a new SQL migration file describing the difference, applies it, and regenerates the Prisma Client. Use this constantly during development.

```bash
npx prisma migrate deploy
```
Applies any pending migrations without generating new ones or asking questions. This is the command you run in production/CI — it never resets data.

```bash
npx prisma migrate reset
```
Drops the database, reapplies every migration from scratch, and re-runs your seed script if you have one. Development only — this is destructive.

```bash
npx prisma migrate status
```
Tells you whether your database is in sync with your migration history.

```bash
npx prisma db push
```
Pushes your schema straight to the database **without** creating a migration file. Handy for quick prototyping, but skip it once you care about migration history — use `migrate dev` instead.

Each migration lands as a plain, readable SQL file under `prisma/migrations/<timestamp>_<name>/migration.sql` — commit these to Git, they're your database's version history.

### 8. Instantiating Prisma Client (Driver Adapters)

This is the biggest change in Prisma 7: **`new PrismaClient()` with no arguments now throws an error.** You must give it a driver adapter — a small package that knows how to talk to your specific database over its native JavaScript driver.

| Database | Adapter package |
|---|---|
| PostgreSQL | `@prisma/adapter-pg` |
| MySQL / MariaDB | `@prisma/adapter-mysql` |
| SQLite | `@prisma/adapter-better-sqlite3` |
| SQL Server | `@prisma/adapter-mssql` |
| PlanetScale | `@prisma/adapter-planetscale` |
| Turso / libSQL | `@prisma/adapter-libsql` |

**SQLite example:**

```javascript title="lib/prisma.js"
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

**PostgreSQL example:**

```javascript title="lib/prisma.js"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

Why the change? The adapter connects Prisma directly to the JavaScript driver you'd use anyway (`pg`, `better-sqlite3`, `mysql2`, …), which is what let Prisma drop its old Rust query engine entirely — faster startup, smaller bundles, and one less binary to worry about deploying.

You should create **one** `PrismaClient` instance and reuse it across your whole app (that's why we `export` it from `lib/prisma.js` instead of creating a new one per request).


### 9. CRUD Operations

All examples below assume `prisma` is the client instance we built in the previous section, and use the `User` / `Post` schema from Section 5.

**Create**

```javascript
// Create a single record
const user = await prisma.user.create({
  data: { email: "alice@example.com", name: "Alice" },
});

// Create a record and a related record in one call (nested write)
const userWithPost = await prisma.user.create({
  data: {
    email: "bob@example.com",
    name: "Bob",
    posts: {
      create: { title: "Hello World", published: true },
    },
  },
  include: { posts: true },
});

// Create many rows at once
await prisma.user.createMany({
  data: [
    { email: "carl@example.com", name: "Carl" },
    { email: "dana@example.com", name: "Dana" },
  ],
  skipDuplicates: true, // ignore rows that violate a unique constraint
});
```

**Read**

```javascript
// Find by a unique field (id, or any field marked @unique)
const user = await prisma.user.findUnique({ where: { id: 1 } });

// Find the first record matching a filter (not necessarily unique)
const firstPublished = await prisma.post.findFirst({
  where: { published: true },
});

// Find many records
const allUsers = await prisma.user.findMany();

// findUniqueOrThrow / findFirstOrThrow behave the same but
// throw a NotFoundError instead of returning null
const definitelyAUser = await prisma.user.findUniqueOrThrow({
  where: { id: 1 },
});
```

**Update**

```javascript
// Update one record
const updated = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Alice Smith" },
});

// Update many records that match a filter
await prisma.post.updateMany({
  where: { published: false },
  data: { published: true },
});

// Upsert: update if it exists, create if it doesn't
const tag = await prisma.tag.upsert({
  where: { name: "urgent" },
  update: {},
  create: { name: "urgent" },
});
```

**Delete**

```javascript
// Delete one record
await prisma.post.delete({ where: { id: 5 } });

// Delete many records matching a filter
await prisma.post.deleteMany({ where: { published: false } });
```

### 10. Filtering, Sorting & Pagination

**Filtering with `where`**

```javascript
const results = await prisma.post.findMany({
  where: {
    published: true,
    title: { contains: "Prisma" },       // LIKE '%Prisma%'
    createdAt: { gte: new Date("2026-01-01") },
    OR: [
      { title: { startsWith: "How to" } },
      { title: { endsWith: "Guide" } },
    ],
    NOT: { authorId: 3 },
  },
});
```

Common filter operators: `equals`, `not`, `in`, `notIn`, `lt`, `lte`, `gt`, `gte`, `contains`, `startsWith`, `endsWith`. Combine conditions with `AND`, `OR`, and `NOT`.

**Sorting with `orderBy`**

```javascript
const posts = await prisma.post.findMany({
  orderBy: [
    { published: "desc" },
    { title: "asc" },
  ],
});
```

**Offset pagination with `skip` / `take`**

```javascript
const page2 = await prisma.post.findMany({
  skip: 10,   // skip the first 10 results
  take: 10,   // return the next 10
  orderBy: { id: "asc" },
});
```

**Cursor pagination** (better for large, frequently-changing tables)

```javascript
const nextPage = await prisma.post.findMany({
  take: 10,
  skip: 1,               // skip the cursor itself
  cursor: { id: 25 },    // start right after post 25
  orderBy: { id: "asc" },
});
```

### 11. Working With Relations

**`include` vs. `select`**

`include` fetches a related model *in addition to* all scalar fields. `select` lets you pick exactly which fields (scalar or relational) come back — better for trimming response size.

```javascript
// include: get the user AND all their posts
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// select: get only specific fields, including a nested selection
const trimmed = await prisma.user.findUnique({
  where: { id: 1 },
  select: {
    name: true,
    posts: { select: { title: true } },
  },
});
```

**Nested writes: `connect`, `create`, `connectOrCreate`, `disconnect`**

```javascript
// Attach an EXISTING tag to a new post
await prisma.post.create({
  data: {
    title: "New Post",
    tags: { connect: [{ id: 3 }] },
  },
});

// Create a NEW tag while creating the post
await prisma.post.create({
  data: {
    title: "New Post",
    tags: { create: [{ name: "javascript" }] },
  },
});

// Use the tag if it exists, otherwise create it
await prisma.post.update({
  where: { id: 1 },
  data: {
    tags: {
      connectOrCreate: {
        where: { name: "urgent" },
        create: { name: "urgent" },
      },
    },
  },
});

// Remove a relation without deleting the related record
await prisma.post.update({
  where: { id: 1 },
  data: { tags: { disconnect: [{ id: 3 }] } },
});
```

**Filtering on relations**

```javascript
// Users who have AT LEAST ONE published post
await prisma.user.findMany({
  where: { posts: { some: { published: true } } },
});

// Users where EVERY post is published
await prisma.user.findMany({
  where: { posts: { every: { published: true } } },
});

// Users with NO posts at all
await prisma.user.findMany({
  where: { posts: { none: {} } },
});
```

`some` / `every` / `none` work on one-to-many and many-to-many lists. For a one-to-one or many-to-one relation, use `is` / `isNot` instead.

### 12. Aggregations, Grouping & Counting

```javascript
// Count
const totalPosts = await prisma.post.count({ where: { published: true } });

// Aggregate: sum, average, min, max in one call
const stats = await prisma.post.aggregate({
  _count: { id: true },
  _avg: { views: true },
  _sum: { views: true },
  _min: { createdAt: true },
  _max: { createdAt: true },
});

// Group by a field, with a having-like filter
const byAuthor = await prisma.post.groupBy({
  by: ["authorId"],
  _count: { id: true },
  having: {
    id: { _count: { gt: 5 } }, // authors with more than 5 posts
  },
});
```

### 13. Transactions

A transaction guarantees a set of database operations either **all succeed together, or all fail together** — critical whenever one write depends on another.

**Sequential transactions** — an array of prepared queries, run in order, all-or-nothing:

```javascript
const [post, updatedUser] = await prisma.$transaction([
  prisma.post.create({ data: { title: "New Post", authorId: 1 } }),
  prisma.user.update({
    where: { id: 1 },
    data: { postCount: { increment: 1 } },
  }),
]);
```

**Interactive transactions** — a callback with full control flow, useful when a later query depends on the result of an earlier one:

```javascript
const result = await prisma.$transaction(async (tx) => {
  const sender = await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } },
  });

  if (sender.balance < 0) {
    throw new Error("Insufficient funds"); // rolls back everything above
  }

  const receiver = await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } },
  });

  return { sender, receiver };
});
```

Note that inside the callback you query through `tx`, not `prisma` — that's what ties the queries to the same transaction.

### 14. Client Extensions (`$extends`)

Older Prisma versions had a `middleware` API for intercepting every query (logging, soft deletes, automatic field computation). Middleware is gone — **Client Extensions** (`$extends`) replaced it, and they're more powerful and fully type-safe.

```javascript
const prismaWithLogging = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const ms = (performance.now() - start).toFixed(1);
        console.log(`${model}.${operation} took ${ms}ms`);
        return result;
      },
    },
  },
});

// Use the extended client exactly like the original
await prismaWithLogging.user.findMany();
```

Extensions can also add custom methods (`model`), computed fields (`result`), or new top-level client methods (`client`) — but query interception (shown above) covers the vast majority of real-world use cases like logging, auditing, and soft deletes.

### 15. Error Handling

Prisma throws typed errors you can catch and branch on. The most common one is `PrismaClientKnownRequestError`, which carries an error `code`:

```javascript
import { Prisma } from "../generated/prisma/client.js";

try {
  await prisma.user.create({
    data: { email: "alice@example.com", name: "Alice" },
  });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      // Unique constraint violation
      console.log("That email is already taken.");
    } else if (error.code === "P2025") {
      // Record to update/delete was not found
      console.log("Record not found.");
    } else if (error.code === "P2003") {
      // Foreign key constraint failed
      console.log("Related record does not exist.");
    }
  }
  throw error;
}
```

| Code | Meaning |
|---|---|
| `P2002` | Unique constraint violation |
| `P2003` | Foreign key constraint failed |
| `P2025` | Record not found (on update/delete) |
| `P2014` | The change you're making would violate a required relation |

### 16. Prisma Studio

Prisma Studio is a local, browser-based GUI for browsing and editing your database — genuinely useful for sanity-checking data while you develop.

```bash
npx prisma studio
```

This opens a tab in your browser (usually at `http://localhost:5555`) where you can view every table, filter rows, and edit data by hand — no SQL required. Recent versions also surface **Query Insights** directly inside Studio, so you can spot slow queries next to the data that produced them.


---

## Part 2 — Build a Task Manager REST API

Time to put every concept from Part 1 to work. We'll build a small but complete REST API for managing tasks, with three related models: **User**, **Task**, and **Tag**. It demonstrates a one-to-many relation (a user has many tasks), a many-to-many relation (a task has many tags), enums, filtering, pagination, aggregation, and transactions.

### 17. Project Setup

```bash
mkdir task-manager-api && cd task-manager-api
npm init -y
```

Enable ESM in `package.json`:

```json title="package.json"
{
  "name": "task-manager-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/server.js",
    "start": "node src/server.js"
  }
}
```

Install everything we need — Express for the web server, and Prisma + the SQLite adapter for the database:

```bash
npm install express dotenv
npm install prisma --save-dev
npm install @prisma/client @prisma/adapter-better-sqlite3
```

Initialize Prisma with SQLite (great for a small app — zero setup, one local file):

```bash
npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

This creates `prisma/schema.prisma`, `.env`, and `prisma.config.ts`, already wired together.

### 18. Designing the Schema

Open `prisma/schema.prisma` and replace its contents with our three models:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id          Int       @id @default(autoincrement())
  title       String
  description String?
  completed   Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  author      User      @relation(fields: [authorId], references: [id])
  authorId    Int
  tags        Tag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([authorId])
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  tasks Task[]
}
```

What this schema gives us:

- **`User` → `Task`** is a one-to-many relation: `authorId` is the foreign key living on `Task`.
- **`Task` ↔ `Tag`** is an implicit many-to-many relation: Prisma manages the join table for us.
- **`priority`** is an enum with a default. (SQLite has no native enum type, so Prisma stores it as `TEXT` and enforces the allowed values itself, at the Client level rather than the database level.)
- **`updatedAt`** refreshes automatically on every update — no manual bookkeeping.
- **`@@index([authorId])`** speeds up the very common "find all tasks for this user" query.

### 19. Running the Migration

```bash
npx prisma migrate dev --name init
```

This reads the schema above, generates the SQL to create the `User`, `Task`, `Tag`, and hidden join tables, applies it to a new `dev.db` SQLite file, and regenerates the Prisma Client into `generated/prisma`.


### 20. Building the Express Server

First, the shared Prisma Client instance every route file will import:

```javascript title="src/lib/prisma.js"
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client.js";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
```

Then the entry point that wires Express together:

```javascript title="src/server.js"
import "dotenv/config";
import express from "express";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import tagsRouter from "./routes/tags.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running" });
});

app.use("/users", usersRouter);
app.use("/tasks", tasksRouter);
app.use("/tags", tagsRouter);

// Catch anything that doesn't match a route
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler — every route forwards errors here with next(error)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Task Manager API running at http://localhost:${PORT}`);
});
```

Every route below follows the same pattern: do the Prisma call inside a `try/catch`, and forward unexpected errors to `next(error)` so the central handler in `server.js` deals with them consistently.


### 21. Implementing the Routes

#### Users

```javascript title="src/routes/users.js"
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

const router = Router();

// POST /users - create a new user
router.post("/", async (req, res, next) => {
  try {
    const { email, name } = req.body;
    const user = await prisma.user.create({ data: { email, name } });
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "A user with that email already exists." });
    }
    next(error);
  }
});

// GET /users - list all users
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// GET /users/:id - get one user with all their tasks and tags
router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.params.id) },
      include: { tasks: { include: { tags: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
```

#### Tasks — the core of the API

This is where filtering, sorting, pagination, nested writes, and aggregation all come together.

```javascript title="src/routes/tasks.js"
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.js";

const router = Router();

// POST /tasks - create a task, optionally attaching tags by name
router.post("/", async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, authorId, tags } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        author: { connect: { id: Number(authorId) } },
        tags: tags
          ? {
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { tags: true, author: { select: { id: true, name: true } } },
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// GET /tasks - list tasks, with filtering, sorting, and pagination
// Query params: completed, priority, search, sortBy, order, page, pageSize
router.get("/", async (req, res, next) => {
  try {
    const {
      completed,
      priority,
      search,
      sortBy = "createdAt",
      order = "desc",
      page = "1",
      pageSize = "10",
    } = req.query;

    const where = {
      ...(completed !== undefined && { completed: completed === "true" }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const take = Number(pageSize);
    const skip = (Number(page) - 1) * take;

    // Run the page query and the total count together, atomically
    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take,
        include: { tags: true, author: { select: { id: true, name: true } } },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page: Number(page),
        pageSize: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/stats - counts grouped by priority, plus completed/pending totals
// NOTE: this route must be declared BEFORE "/:id", or Express will treat
// "stats" as an :id value.
router.get("/stats", async (req, res, next) => {
  try {
    const byPriority = await prisma.task.groupBy({
      by: ["priority"],
      _count: { id: true },
    });
    const completed = await prisma.task.count({ where: { completed: true } });
    const pending = await prisma.task.count({ where: { completed: false } });

    res.json({ byPriority, completed, pending });
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(req.params.id) },
      include: { tags: true, author: { select: { id: true, name: true } } },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - update a task
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;
    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        description,
        completed,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });
    res.json(task);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Task not found" });
    }
    next(error);
  }
});

// DELETE /tasks/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Task not found" });
    }
    next(error);
  }
});

export default router;
```

#### Tags

```javascript title="src/routes/tags.js"
import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GET /tags - list every tag along with how many tasks use it
router.get("/", async (req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { tasks: true } } },
    });
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

export default router;
```

`_count` is a shortcut for including just the count of a relation instead of the full list of related records — much cheaper than fetching every task just to call `.length`.


### 22. Testing the API

Start the server:

```bash
npm run dev
```

Create a user:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'
```

Create a task for that user, attaching two tags by name:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Write the FYP proposal",
    "description": "Draft the first two sections",
    "priority": "HIGH",
    "authorId": 1,
    "tags": ["research", "urgent"]
  }'
```

List tasks, filtered to high-priority incomplete ones, sorted by due date, page 1 of 5:

```bash
curl "http://localhost:3000/tasks?completed=false&priority=HIGH&sortBy=dueDate&order=asc&page=1&pageSize=5"
```

Mark a task complete:

```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

Get aggregate stats:

```bash
curl http://localhost:3000/tasks/stats
```

Delete a task:

```bash
curl -X DELETE http://localhost:3000/tasks/1
```

Open Prisma Studio at any point to see the same data visually:

```bash
npx prisma studio
```

### 23. Full Project File Tree

```text
task-manager-api/
├── generated/
│   └── prisma/                # auto-generated Prisma Client — never edit by hand
├── prisma/
│   ├── schema.prisma           # data model
│   └── migrations/             # auto-generated SQL migration history
├── src/
│   ├── lib/
│   │   └── prisma.js           # shared PrismaClient instance (with driver adapter)
│   ├── routes/
│   │   ├── users.js
│   │   ├── tasks.js
│   │   └── tags.js
│   └── server.js               # Express app entry point
├── .env                          # DATABASE_URL
├── prisma.config.ts              # Prisma CLI configuration
└── package.json
```

---

## Part 3 — Wrap-Up

### 24. Best Practices

- **One `PrismaClient` per process.** Create it once (as we did in `src/lib/prisma.js`) and import that same instance everywhere — never call `new PrismaClient()` inside a request handler.
- **Always pass a driver adapter.** It's mandatory in Prisma 7, and it's also what gives you access to the underlying driver's own connection-pooling options if you need to tune them.
- **Commit your migrations.** The files under `prisma/migrations/` are your database's change history — treat them like code, review them in pull requests, never hand-edit a migration that's already been applied to production.
- **Use `migrate deploy` in production, `migrate dev` only locally.** `migrate dev` can reset your database if it detects drift; `migrate deploy` never touches data it doesn't have to.
- **Prefer `select` over `include` when you don't need every field** — it keeps API responses smaller and queries faster.
- **Wrap multi-step writes in a transaction.** Anything where a partial write would leave your data inconsistent (like the balance transfer example in Section 13) belongs in `$transaction`.
- **Handle known Prisma error codes explicitly** (`P2002`, `P2025`, `P2003`) so your API returns useful HTTP status codes instead of a generic 500.
- **Keep secrets in `.env`, never in `schema.prisma` or `prisma.config.ts` directly** — always route them through `env("DATABASE_URL")`.

### 25. Next Steps & Resources

- Add **authentication** (e.g. JWT) and scope task queries to the logged-in user.
- Add **input validation** with a library like `zod` before data ever reaches Prisma.
- Swap SQLite for **PostgreSQL** in production — usually just a `datasource` provider change and a new adapter package.
- Explore **Prisma Client Extensions** further for things like automatic soft-deletes or field-level encryption.
- Official docs: [prisma.io/docs](https://www.prisma.io/docs)
- Prisma Discord community: [pris.ly/discord](https://pris.ly/discord)

You now know the full Prisma toolchain — schema, migrations, client, relations, transactions, extensions — and you've used every one of those pieces in a real, working API. From here, the fastest way to get better is to extend this project: add a `Project` model that groups tasks, add comments on tasks, or add full-text search.
