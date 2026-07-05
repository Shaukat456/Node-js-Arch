---
---

# What is a Transaction?

A **transaction** is a group of SQL statements that are treated as **one single unit of work**.

Think of it like this:

> **Either all queries execute successfully OR none of them execute.**

There is no in-between.

---

## Real World Example

Imagine ATM money transfer.

You transfer **Rs.5000** from Account A to Account B.

The database has to do two things:

```
1. Deduct Rs.5000 from Account A

2. Add Rs.5000 to Account B
```

What if electricity goes out after deducting money but before adding it?

Without transactions

```
Account A : Lost Rs.5000

Account B : Didn't receive anything
```

Money disappeared.

Very bad.

Transactions prevent this.

---

# Transaction Flow

```
START TRANSACTION

↓

Query 1

↓

Query 2

↓

Query 3

↓

Everything Successful?

        YES
         ↓
      COMMIT

        NO
         ↓
     ROLLBACK
```

---

# Example Project

Let's build a small banking system.

## Step 1

Create database

```sql
CREATE DATABASE bank;

USE bank;
```

---

## Step 2

Create Accounts table

```sql
CREATE TABLE accounts(
    id INT PRIMARY KEY,
    name VARCHAR(50),
    balance INT
);
```

---

Insert data

```sql
INSERT INTO accounts
VALUES
(1,'Ali',10000),
(2,'Ahmed',8000);
```

Current table

| id | name  | balance |
| -- | ----- | ------- |
| 1  | Ali   | 10000   |
| 2  | Ahmed | 8000    |

---

# Without Transaction

Suppose Ali sends 3000 to Ahmed.

First query

```sql
UPDATE accounts
SET balance = balance - 3000
WHERE id=1;
```

Now

| Ali  |
| ---- |
| 7000 |

Second query

```sql
UPDATE accounts
SET balance = balance + 3000
WHERE id=2;
```

Ahmed

11000

Everything works.

But...

Suppose server crashes after first query.

Table becomes

|Ali|7000|

|Ahmed|8000|

3000 vanished forever.

---

# Using Transaction

Now let's solve this.

```sql
START TRANSACTION;
```

Meaning

> Don't permanently save anything yet.

---

First query

```sql
UPDATE accounts
SET balance = balance - 3000
WHERE id=1;
```

Database

Ali

7000

But...

This change is **temporary**.

---

Second query

```sql
UPDATE accounts
SET balance = balance + 3000
WHERE id=2;
```

Ahmed

11000

Still temporary.

Nothing is permanent.

---

Everything looks good.

Now save permanently.

```sql
COMMIT;
```

Now

Table becomes

|Ali|7000|

|Ahmed|11000|

Permanent.

---

# What if Error Happens?

Suppose second query fails.

Instead

```sql
ROLLBACK;
```

Database automatically returns to

|Ali|10000|

|Ahmed|8000|

Exactly as before.

No money lost.

---

# Visual Diagram

Before

```
Ali
10000

Ahmed
8000
```

↓

Transaction starts

```
Ali
7000

Ahmed
11000

Temporary
```

↓

Commit

```
Ali
7000

Ahmed
11000

Permanent
```

OR

↓

Rollback

```
Ali
10000

Ahmed
8000
```

---

# START TRANSACTION

Syntax

```sql
START TRANSACTION;
```

or

```sql
BEGIN;
```

Both are same.

---

# COMMIT

Commit means

> Save permanently.

```sql
COMMIT;
```

---

# ROLLBACK

Rollback means

Undo everything.

```sql
ROLLBACK;
```

---

# Complete Example

```sql
START TRANSACTION;

UPDATE accounts
SET balance = balance - 500
WHERE id=1;

UPDATE accounts
SET balance = balance + 500
WHERE id=2;

COMMIT;
```

---

Example with rollback

```sql
START TRANSACTION;

UPDATE accounts
SET balance = balance - 500
WHERE id=1;

-- Something went wrong

ROLLBACK;
```

Final balances remain unchanged.

---

# Another Example

Inventory System

Table

```
Products
```

| Laptop | Stock |
| ------ | ----- |
| Dell   | 10    |

Customer buys 2 laptops.

Need to

```
Reduce stock

↓

Create order

↓

Create invoice

↓

Payment record
```

If invoice creation fails

Should stock reduce?

No.

Everything should undo.

```
START TRANSACTION

Reduce Stock

Create Order

Create Invoice

Payment

COMMIT
```

Otherwise

```
ROLLBACK
```

---

# Example

```sql
START TRANSACTION;

UPDATE products
SET stock = stock-2
WHERE id=1;

INSERT INTO orders(customer,product)
VALUES('Ali','Dell');

INSERT INTO invoices(...)
VALUES(...);

COMMIT;
```

---

# ACID Properties

Every transaction follows **ACID**.

## A — Atomicity

Means

> All or Nothing.

Example

```
Transfer Money

Deduct

Add
```

Both happen

OR

None happen.

Never half.

---

## C — Consistency

Database should remain valid before and after transaction.

Example

Total money

```
Before

18000

After

18000
```

Money shouldn't disappear.

---

## I — Isolation

Multiple users can perform transactions simultaneously without interfering.

Example

Ali transfers money

Ahmed buys laptop

Sara updates profile

All work independently.

---

## D — Durability

After Commit

Data is permanent.

Even if

```
Power Failure

Computer Crash

Server Restart
```

Committed data stays saved.

---

# Autocommit

By default MySQL uses

```
AUTOCOMMIT = ON
```

Meaning

Every query automatically commits.

Example

```sql
UPDATE accounts
SET balance=9000
WHERE id=1;
```

Immediately saved.

No rollback possible.

---

Check

```sql
SELECT @@autocommit;
```

Output

```
1
```

means ON.

---

Turn off

```sql
SET autocommit=0;
```

Now

You must manually

```sql
COMMIT;
```

or

```sql
ROLLBACK;
```

---

# SAVEPOINT

Suppose transaction has many queries.

```
Query1

Query2

Query3

Query4
```

Only Query4 fails.

You don't want to undo everything.

Use Savepoint.

---

Example

```sql
START TRANSACTION;

UPDATE accounts
SET balance=balance-500
WHERE id=1;

SAVEPOINT after_deduction;

UPDATE accounts
SET balance=balance+500
WHERE id=2;

ROLLBACK TO after_deduction;

COMMIT;
```

Only operations after the savepoint are undone.

---

# Real Project Flow

Imagine an online shopping website.

Customer clicks **Buy Now**.

The backend might execute:

```
START TRANSACTION

↓

Check Product Stock

↓

Reduce Stock

↓

Create Order

↓

Create Payment Record

↓

Generate Invoice

↓

Reward Loyalty Points

↓

COMMIT
```

If any step fails:

```
ROLLBACK
```

The database returns to its previous state, so you don't end up with reduced stock but no order, or an order without a payment record.

---

# Summary

| Command               | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `START TRANSACTION`   | Begin a transaction                            |
| `BEGIN`               | Same as `START TRANSACTION`                    |
| `COMMIT`              | Permanently save all changes                   |
| `ROLLBACK`            | Undo all changes since the transaction started |
| `SAVEPOINT name`      | Mark a point within a transaction              |
| `ROLLBACK TO name`    | Undo changes back to a savepoint               |
| `SET autocommit=0`    | Disable automatic commits                      |
| `SELECT @@autocommit` | Check autocommit status                        |

## Interview Questions

1. What is a transaction in MySQL?
2. Why are transactions important?
3. What is the difference between `COMMIT` and `ROLLBACK`?
4. Explain the ACID properties with examples.
5. What is `AUTOCOMMIT`, and how does it affect transactions?
6. What is a `SAVEPOINT`, and when would you use it?
7. Why are transactions essential in banking and e-commerce systems?
8. Which storage engine (such as **InnoDB**) supports transactions, and why is that important?

Once you're comfortable with these basics, the next topics to learn are **locking (shared vs. exclusive locks)**, **transaction isolation levels** (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`), and **deadlocks**, which explain how MySQL handles many users accessing the same data concurrently.
