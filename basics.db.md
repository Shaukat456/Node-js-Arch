---
title: "Learn MySQL by Building a Mini Library System"
description: "A beginner-friendly, step-by-step MySQL tutorial covering tables, relations, keys, joins, and indexing"
---

# Learn MySQL by Building a Mini Library System

Welcome! In this tutorial you'll learn MySQL from scratch by building a **tiny Library Management System**. We'll go slow, explain every concept as it shows up, and only introduce one new idea at a time.

By the end, you'll understand:

- Databases & tables
- Data types
- Primary keys
- Foreign keys & relationships (one-to-many)
- Joins
- Indexing (and why it matters)
- Basic constraints (`NOT NULL`, `UNIQUE`, `AUTO_INCREMENT`)

Our project has 4 tables: **Authors**, **Books**, **Members**, and **Loans**. This is small enough to hold in your head, but realistic enough to show real relationships — just like a real app would use.

---

## Step 0: What is MySQL?

MySQL is a **Relational Database Management System (RDBMS)**. That's a fancy way of saying:

> "A program that stores data in **tables** (like spreadsheets), where tables can be **linked to each other** through shared columns."

Key vocabulary you'll hear throughout:

| Term                 | Meaning                                                                         |
| -------------------- | ------------------------------------------------------------------------------- |
| **Database**         | A container that holds related tables (e.g., `library_db`)                      |
| **Table**            | A grid of data, like one spreadsheet tab (e.g., `books`)                        |
| **Row (Record)**     | One entry in a table (e.g., one specific book)                                  |
| **Column (Field)**   | One property of a row (e.g., `title`, `price`)                                  |
| **Primary Key (PK)** | A column that uniquely identifies each row                                      |
| **Foreign Key (FK)** | A column that points to a Primary Key in another table, creating a relationship |
| **Index**            | A "shortcut" structure that makes searching a table much faster                 |

Don't worry if these feel abstract right now — you'll see each one in action below.

---

## Step 1: Create the Database

Everything starts with creating a database — think of it as creating a new "project folder" for your tables.

```sql
CREATE DATABASE library_db;

-- Tell MySQL to "use" this database for all following commands
USE library_db;
```

**Concept check:** A MySQL server can hold _many_ databases (e.g., `library_db`, `shop_db`, `blog_db`). `USE` just tells MySQL which one you're currently working inside.

---

## Step 2: Create Your First Table — `authors`

Let's start simple: a table that stores authors.

```sql
CREATE TABLE authors (
    author_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    country     VARCHAR(50)
);
```

Let's break this down line by line:

- `author_id INT AUTO_INCREMENT PRIMARY KEY`
  - `INT` → this column stores whole numbers
  - `AUTO_INCREMENT` → MySQL automatically assigns 1, 2, 3, 4... — you never set this yourself
  - `PRIMARY KEY` → this column **uniquely identifies each row**. No two authors can share an `author_id`, and it can never be empty.
- `name VARCHAR(100) NOT NULL`
  - `VARCHAR(100)` → variable-length text, up to 100 characters
  - `NOT NULL` → this field **must** have a value; you can't leave it blank
- `country VARCHAR(50)`
  - No `NOT NULL` here, so this column is optional

**Concept check — Why a Primary Key?**
Imagine two authors are both named "John Smith." If we searched `WHERE name = 'John Smith'`, we couldn't tell them apart. The `author_id` gives every row a unique fingerprint, no matter what.

---

## Step 3: Add Some Authors

```sql
INSERT INTO authors (name, country) VALUES
('J.K. Rowling', 'UK'),
('George Orwell', 'UK'),
('Chinua Achebe', 'Nigeria');
```

Notice we never insert `author_id` — MySQL fills it in automatically (1, 2, 3) because of `AUTO_INCREMENT`.

```sql
SELECT * FROM authors;
```

```
+-----------+----------------+---------+
| author_id | name           | country |
+-----------+----------------+---------+
| 1         | J.K. Rowling   | UK      |
| 2         | George Orwell  | UK      |
| 3         | Chinua Achebe  | Nigeria |
+-----------+----------------+---------+
```

---

## Step 4: Relationships — Create the `books` Table

Now the important part: **relationships**. One author can write _many_ books. This is called a **one-to-many relationship** (one author → many books).

To link `books` to `authors`, we add a **Foreign Key**.

```sql
CREATE TABLE books (
    book_id     INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(150) NOT NULL,
    author_id   INT,
    price       DECIMAL(6,2),
    published_year INT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
);
```

**What's new here:**

- `author_id INT` → stores a number that _matches_ an `author_id` from the `authors` table
- `FOREIGN KEY (author_id) REFERENCES authors(author_id)` → this line tells MySQL:
  > "The `author_id` value in this table **must** already exist in the `authors` table."

This is called **referential integrity** — MySQL will _refuse_ to let you add a book with `author_id = 99` if no author with ID 99 exists. It protects your data from becoming inconsistent.

```
authors                    books
+-----------+           +------------+-----------+
| author_id | ◄───────┐ | book_id    | author_id |
+-----------+         └─┤ author_id  |           |
     1  ── one author       many books point back to author 1
```

---

## Step 5: Add Some Books

```sql
INSERT INTO books (title, author_id, price, published_year) VALUES
('Harry Potter and the Philosopher''s Stone', 1, 15.99, 1997),
('Harry Potter and the Chamber of Secrets', 1, 16.99, 1998),
('1984', 2, 9.99, 1949),
('Animal Farm', 2, 7.99, 1945),
('Things Fall Apart', 3, 11.50, 1958);
```

Notice both Harry Potter books use `author_id = 1` (J.K. Rowling) — that's the one-to-many relationship in action.

---

## Step 6: Your First JOIN

What if we want to see book titles _along with_ the author's name? The name isn't stored in `books` — only the `author_id` is. We use a **JOIN** to combine data across tables.

```sql
SELECT books.title, authors.name AS author_name, books.published_year
FROM books
JOIN authors ON books.author_id = authors.author_id
ORDER BY books.published_year;
```

```
+---------------------------------------------+----------------+-----------------+
| title                                       | author_name    | published_year  |
+---------------------------------------------+----------------+-----------------+
| Animal Farm                                 | George Orwell  | 1945            |
| 1984                                        | George Orwell  | 1949            |
| Things Fall Apart                           | Chinua Achebe  | 1958            |
| Harry Potter and the Philosopher's Stone    | J.K. Rowling   | 1997            |
| Harry Potter and the Chamber of Secrets     | J.K. Rowling   | 1998            |
+---------------------------------------------+----------------+-----------------+
```

**Concept check — JOIN in plain English:**
`JOIN` says: "For every book, go find the matching author (where `author_id` matches on both sides), and glue their columns together into one row."

---

## Step 7: Add `members` (Library Users)

```sql
CREATE TABLE members (
    member_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    joined_on   DATE
);
```

New concept: `UNIQUE`.

- `UNIQUE` means no two rows can have the same value in that column — perfect for emails, since two members shouldn't share one.
- This is different from `PRIMARY KEY` in that a table can have _many_ `UNIQUE` columns, but only _one_ `PRIMARY KEY`.

```sql
INSERT INTO members (full_name, email, joined_on) VALUES
('Ayesha Khan', 'ayesha@example.com', '2024-01-10'),
('Bilal Ahmed', 'bilal@example.com', '2024-03-22'),
('Sara Malik', 'sara@example.com', '2024-05-15');
```

---

## Step 8: The `loans` Table — Linking Two Tables Together

Now let's track which member borrowed which book. This table has **two** foreign keys — it sits _between_ `books` and `members`.

```sql
CREATE TABLE loans (
    loan_id     INT AUTO_INCREMENT PRIMARY KEY,
    book_id     INT NOT NULL,
    member_id   INT NOT NULL,
    loan_date   DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);
```

This is a very common real-world pattern:

```
authors --< books --< loans >-- members
```

Read `--<` as "one-to-many." One book can be loaned out many times (to different members, at different dates); one member can take out many loans.

```sql
INSERT INTO loans (book_id, member_id, loan_date, return_date) VALUES
(1, 1, '2024-06-01', '2024-06-15'),
(3, 2, '2024-06-05', NULL),
(1, 3, '2024-06-20', NULL),
(5, 1, '2024-07-01', '2024-07-10');
```

Note `return_date` is `NULL` for books that haven't been returned yet — that's fine, since we didn't mark it `NOT NULL`.

---

## Step 9: A Real Multi-Table Query

"Show me every currently borrowed book, who has it, and since when."

```sql
SELECT
    books.title,
    members.full_name,
    loans.loan_date
FROM loans
JOIN books   ON loans.book_id = books.book_id
JOIN members ON loans.member_id = members.member_id
WHERE loans.return_date IS NULL;
```

```
+---------------------------------------------+---------------+------------+
| title                                       | full_name     | loan_date  |
+---------------------------------------------+---------------+------------+
| 1984                                        | Bilal Ahmed   | 2024-06-05 |
| Harry Potter and the Philosopher's Stone    | Sara Malik    | 2024-06-20 |
+---------------------------------------------+---------------+------------+
```

This single query pulls from **3 tables at once** — this is the whole point of relational databases: store data once, in the right place, then combine it however you need.

---

## Step 10: Indexing — Making Searches Fast

Here's the concept students often skip, but it's crucial.

**What is an index?**
Imagine a textbook with no index page. To find "photosynthesis," you'd flip through _every single page_. A book's index lets you jump straight to page 214. A database index works the same way — it lets MySQL find rows _without scanning the whole table_.

Right now, if you search:

```sql
SELECT * FROM books WHERE title = '1984';
```

...MySQL scans **every row** in `books` checking the title, one by one. That's fine for 5 rows, but painfully slow for 5 million rows.

### Creating an index

```sql
CREATE INDEX idx_books_title ON books(title);
```

Now MySQL builds a sorted lookup structure (a B-Tree, if you're curious) for the `title` column, so it can jump almost straight to the matching row instead of checking each one.

### Proving it works: `EXPLAIN`

```sql
EXPLAIN SELECT * FROM books WHERE title = '1984';
```

Before the index, the `type` column in the output shows `ALL` (full table scan). After the index, it shows `ref` or `const` (direct lookup) — a clear signal MySQL is using your index instead of scanning everything.

### A key insight: Primary Keys and Foreign Keys are auto-indexed

You may have noticed we never manually indexed `author_id` in the `books` table for our joins to work fast — that's because:

- `PRIMARY KEY` columns are **automatically indexed** by MySQL.
- It's good practice to also index Foreign Key columns, since they're used constantly in `JOIN`s:

```sql
CREATE INDEX idx_books_author_id ON books(author_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
```

**Concept check — the tradeoff:**
Indexes make **reads (SELECT)** faster, but make **writes (INSERT/UPDATE/DELETE)** slightly slower, because MySQL has to update the index structure every time data changes. That's why we don't index _every_ column — only the ones we frequently search or join on.

---

## Step 11: A Few More Useful Basics

**Filtering with `WHERE`:**

```sql
SELECT * FROM books WHERE price < 10;
```

**Sorting with `ORDER BY`:**

```sql
SELECT * FROM books ORDER BY price DESC;
```

**Counting related rows with `COUNT` and `GROUP BY`:**

```sql
-- How many books has each author written?
SELECT authors.name, COUNT(books.book_id) AS total_books
FROM authors
JOIN books ON authors.author_id = books.author_id
GROUP BY authors.name;
```

**Updating data:**

```sql
UPDATE loans
SET return_date = '2024-06-25'
WHERE loan_id = 2;
```

**Deleting data:**

```sql
DELETE FROM loans WHERE loan_id = 4;
```

---

## Step 12: Recap — The Full Schema

```sql
CREATE DATABASE library_db;
USE library_db;

CREATE TABLE authors (
    author_id   INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    country     VARCHAR(50)
);

CREATE TABLE books (
    book_id         INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(150) NOT NULL,
    author_id       INT,
    price           DECIMAL(6,2),
    published_year  INT,
    FOREIGN KEY (author_id) REFERENCES authors(author_id)
);

CREATE TABLE members (
    member_id   INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    joined_on   DATE
);

CREATE TABLE loans (
    loan_id     INT AUTO_INCREMENT PRIMARY KEY,
    book_id     INT NOT NULL,
    member_id   INT NOT NULL,
    loan_date   DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY (book_id) REFERENCES books(book_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author_id ON books(author_id);
CREATE INDEX idx_loans_book_id ON loans(book_id);
CREATE INDEX idx_loans_member_id ON loans(member_id);
```

---

## Step 13: Practice Exercises

Try these on your own to check understanding:

1. Write a query to list all books published before 1990.
2. Write a query to find which member currently has the book "1984" on loan.
3. Add a new author and a new book by them, then confirm the JOIN in Step 6 picks it up.
4. Add an index on `members.email` — why might this be useful, given the `UNIQUE` constraint is already there? (Hint: `UNIQUE` columns are auto-indexed too!)
5. Write a query using `GROUP BY` to find the most-borrowed book (count rows in `loans` grouped by `book_id`).

---

## Summary Cheat Sheet

| Concept               | Keyword          | What it does                                          |
| --------------------- | ---------------- | ----------------------------------------------------- |
| Unique row ID         | `PRIMARY KEY`    | Uniquely identifies each row; auto-indexed            |
| Link between tables   | `FOREIGN KEY`    | Ensures a column's value exists in another table      |
| No duplicates allowed | `UNIQUE`         | Prevents duplicate values (e.g., email)               |
| Required field        | `NOT NULL`       | Field cannot be left empty                            |
| Auto-numbering        | `AUTO_INCREMENT` | MySQL assigns the next number automatically           |
| Combine tables        | `JOIN`           | Merge rows from related tables into one result        |
| Speed up search       | `INDEX`          | Lets MySQL find rows without scanning the whole table |
| Check query speed     | `EXPLAIN`        | Shows how MySQL will execute a query                  |

You now have a working, related, indexed mini-database — and the core vocabulary to read almost any MySQL tutorial or real-world schema from here. 🎉
