Joins are one of the **most important concepts in MySQL**. If you understand joins properly, you can work with almost any database.

Think of joins as answering this question:

> **"How do I combine information stored in different tables?"**

---

# Why do we need Joins?

Imagine you are building a university management system.

Instead of storing everything in one huge table, databases separate data into multiple tables.

## Students Table

| student_id | name  | age |
| ---------- | ----- | --- |
| 1          | Ali   | 20  |
| 2          | Sara  | 22  |
| 3          | Ahmed | 21  |

---

## Courses Table

| course_id | course_name |
| --------- | ----------- |
| 101       | Physics     |
| 102       | Chemistry   |
| 103       | Mathematics |

---

## Enrollment Table

This table tells which student studies which course.

| student_id | course_id |
| ---------- | --------- |
| 1          | 101       |
| 1          | 103       |
| 2          | 102       |
| 3          | 101       |

Notice something?

The student's name isn't repeated.

The course name isn't repeated.

Instead, IDs connect the tables.

This is called a **relationship**.

Now suppose your boss asks:

> Show me every student's name along with the course they are studying.

Problem:

* Student name is in Students table.
* Course name is in Courses table.
* Connection is inside Enrollment table.

This is exactly why **JOIN** exists.

---

# Visual Understanding

```
Students
+----+-------+
|1   | Ali   |
|2   | Sara  |
|3   | Ahmed |
+----+-------+

Enrollment
+----+------+
|1   |101   |
|1   |103   |
|2   |102   |
|3   |101   |
+----+------+

Courses
+-----+------------+
|101  |Physics     |
|102  |Chemistry   |
|103  |Math        |
+-----+------------+
```

JOIN combines them.

↓

```
Ali      Physics
Ali      Math
Sara     Chemistry
Ahmed    Physics
```

---

# Types of Joins

There are mainly:

```
JOIN
│
├── INNER JOIN
├── LEFT JOIN
├── RIGHT JOIN
├── FULL OUTER JOIN
├── CROSS JOIN
└── SELF JOIN
```

We'll learn one by one.

---

# 1. INNER JOIN

Most commonly used.

Think:

> Give me only the matching records.

---

Example

Students

| id | name  |
| -- | ----- |
| 1  | Ali   |
| 2  | Sara  |
| 3  | Ahmed |

Orders

| order_id | student_id |
| -------- | ---------- |
| 100      | 1          |
| 101      | 1          |
| 102      | 2          |

Notice:

Ahmed never placed an order.

---

Query

```sql
SELECT
students.name,
orders.order_id
FROM students
INNER JOIN orders
ON students.id = orders.student_id;
```

Result

| name | order_id |
| ---- | -------- |
| Ali  | 100      |
| Ali  | 101      |
| Sara | 102      |

Ahmed is missing.

Why?

Because INNER JOIN only returns matching rows.

---

Visual

```
Students

Ali ------ Order
Sara ----- Order
Ahmed ---- No Order

Result

Ali
Sara
```

Only common part.

```
Students   ∩   Orders
```

---

Real World

E-commerce

Customers

| id | name  |
| -- | ----- |
| 1  | Ali   |
| 2  | Sara  |
| 3  | Ahmed |

Orders

| customer_id |
| ----------- |
| 1           |
| 1           |
| 2           |

Need:

Customers who have purchased.

Use INNER JOIN.

---

# 2. LEFT JOIN

Think

> Give me ALL rows from the left table.

Whether matching exists or not.

---

Students

| id | name  |
| -- | ----- |
| 1  | Ali   |
| 2  | Sara  |
| 3  | Ahmed |

Orders

| student_id |
| ---------- |
| 1          |
| 2          |

Query

```sql
SELECT
students.name,
orders.student_id
FROM students
LEFT JOIN orders
ON students.id = orders.student_id;
```

Output

| name  | student_id |
| ----- | ---------- |
| Ali   | 1          |
| Sara  | 2          |
| Ahmed | NULL       |

Ahmed appears!

No order?

Database writes NULL.

---

Visual

```
LEFT TABLE

Ali
Sara
Ahmed

RIGHT TABLE

Ali
Sara

LEFT JOIN RESULT

Ali
Sara
Ahmed(NULL)
```

---

Real World

Company

Employees

| id | name |
| -- | ---- |
| 1  | John |
| 2  | Mike |
| 3  | Emma |

Departments

| employee_id | department |
| ----------- | ---------- |
| 1           | HR         |
| 2           | IT         |

Need:

Show all employees.

Even if they have no department.

Use LEFT JOIN.

---

# 3. RIGHT JOIN

Opposite of LEFT JOIN.

Keep everything from the RIGHT table.

---

Students

| id | name |
| -- | ---- |
| 1  | Ali  |
| 2  | Sara |

Orders

| student_id |
| ---------- |
| 1          |
| 2          |
| 5          |

Order 5 belongs to someone missing.

Query

```sql
SELECT
students.name,
orders.student_id
FROM students
RIGHT JOIN orders
ON students.id = orders.student_id;
```

Output

| name | student_id |
| ---- | ---------- |
| Ali  | 1          |
| Sara | 2          |
| NULL | 5          |

---

Real World

Products

Orders

Need:

Show every order.

Even if the product has been deleted.

RIGHT JOIN.

---

# 4. FULL OUTER JOIN

MySQL **does NOT support FULL OUTER JOIN directly.**

But conceptually:

Return

* everything from left
* everything from right

Matched + unmatched.

Example

Students

|Ali|
|Sara|
|Ahmed|

Orders

|Ali|
|Sara|
|John|

Result

```
Ali
Sara
Ahmed
John
```

Everything.

---

How in MySQL?

Using UNION.

```sql
SELECT *
FROM students
LEFT JOIN orders
ON students.id = orders.student_id

UNION

SELECT *
FROM students
RIGHT JOIN orders
ON students.id = orders.student_id;
```

---

# 5. CROSS JOIN

Produces every possible combination.

No condition.

---

Students

|Ali|
|Sara|

Courses

|Physics|
|Math|

Result

| Student | Course  |
| ------- | ------- |
| Ali     | Physics |
| Ali     | Math    |
| Sara    | Physics |
| Sara    | Math    |

Query

```sql
SELECT *
FROM students
CROSS JOIN courses;
```

---

Real World

T-shirt Store

Colors

```
Red
Blue
Green
```

Sizes

```
S
M
L
```

Need every possible combination.

```
Red S
Red M
Red L

Blue S
Blue M
Blue L

Green S
Green M
Green L
```

CROSS JOIN.

---

# 6. SELF JOIN

Join a table with itself.

Useful for hierarchy.

Example

Employees

| id | name | manager_id |
| -- | ---- | ---------- |
| 1  | CEO  | NULL       |
| 2  | John | 1          |
| 3  | Emma | 1          |
| 4  | Ali  | 2          |

Need

Employee + Manager name

Query

```sql
SELECT
e.name AS Employee,
m.name AS Manager
FROM employees e
LEFT JOIN employees m
ON e.manager_id = m.id;
```

Output

| Employee | Manager |
| -------- | ------- |
| CEO      | NULL    |
| John     | CEO     |
| Emma     | CEO     |
| Ali      | John    |

---

Real World

Organization Chart

```
CEO

│

├──John

│   └──Ali

└──Emma
```

Same table.

Different aliases.

---

# Multiple Joins

Now let's build a real university example.

Students

| id | name |
| -- | ---- |
| 1  | Ali  |
| 2  | Sara |

Enrollments

| student_id | course_id |
| ---------- | --------- |
| 1          | 101       |
| 1          | 103       |
| 2          | 102       |

Courses

| id  | course    |
| --- | --------- |
| 101 | Physics   |
| 102 | Chemistry |
| 103 | Math      |

Query

```sql
SELECT
students.name,
courses.course
FROM students
INNER JOIN enrollments
ON students.id = enrollments.student_id
INNER JOIN courses
ON enrollments.course_id = courses.id;
```

Output

| Student | Course    |
| ------- | --------- |
| Ali     | Physics   |
| Ali     | Math      |
| Sara    | Chemistry |

---

# How to Read a JOIN Query

Take this query:

```sql
SELECT
s.name,
c.course
FROM students s
INNER JOIN enrollments e
ON s.id = e.student_id
INNER JOIN courses c
ON e.course_id = c.id;
```

Read it like English:

1. Start with the `students` table (aliased as `s`).
2. Join `enrollments` (`e`) where the student IDs match.
3. Join `courses` (`c`) where the course IDs match.
4. Display the student's name and the course name.

---

# Which JOIN Should You Use?

| Situation                          | JOIN                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| Only matching records              | INNER JOIN                                                                    |
| Keep all records from left table   | LEFT JOIN                                                                     |
| Keep all records from right table  | RIGHT JOIN                                                                    |
| Keep all records from both tables  | FULL OUTER JOIN (simulate with `LEFT JOIN` + `RIGHT JOIN` + `UNION` in MySQL) |
| Every possible combination         | CROSS JOIN                                                                    |
| Compare rows within the same table | SELF JOIN                                                                     |

---

# Real-World Examples

| Application                                   | Typical JOIN         |
| --------------------------------------------- | -------------------- |
| E-commerce: Customers ↔ Orders                | INNER JOIN           |
| Show all customers, even those with no orders | LEFT JOIN            |
| University: Students ↔ Enrollments ↔ Courses  | Multiple INNER JOINs |
| Hospital: Patients ↔ Appointments ↔ Doctors   | Multiple JOINs       |
| Banking: Customers ↔ Accounts ↔ Transactions  | Multiple JOINs       |
| HR: Employees ↔ Departments                   | LEFT JOIN            |
| Company hierarchy (Employee ↔ Manager)        | SELF JOIN            |
| Product catalog (Colors × Sizes × Materials)  | CROSS JOIN           |

---

# Memory Trick

Think of JOINs as Venn diagrams:

```
INNER JOIN
     (Only overlap)

      A ∩ B
```

```
LEFT JOIN

All of A
+ matching from B
```

```
RIGHT JOIN

All of B
+ matching from A
```

```
FULL OUTER JOIN

Everything from A
Everything from B
```

```
CROSS JOIN

A × B
(All combinations)
```

```
SELF JOIN

A joins with A
(Same table, different roles)
```

Once you master these patterns, you'll be able to query relational databases for real-world applications such as e-commerce systems, hospital management, banking, HR, and university databases.
