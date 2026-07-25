---
---
---

# Step 4: What is a Key?

A key identifies data.

Think of a university roll number.

Even if two students are both named Ali, their roll numbers are different.

Example

| StudentID | Name |
| --------- | ---- |
| 101       | Ali  |
| 102       | Ali  |

Which Ali?

StudentID tells us.

Therefore,

```
StudentID = Key
```

---

# Step 5: Primary Key

A **Primary Key** is a column (or set of columns) whose value is **unique** for every row.

Rules:

* Cannot repeat
* Cannot be NULL
* Identifies exactly one row

Example

| StudentID | Name |
| --------- | ---- |
| 1         | Ali  |
| 2         | Sara |
| 3         | John |

Primary Key

```
StudentID
```

Every student has a unique ID.

---

## Real-Life Analogy

Think of a CNIC.

Two people can have the same name.

Nobody can have the same CNIC.

That's why CNIC works like a primary key.

---

# Step 6: Foreign Key

A Foreign Key connects two tables.

Suppose we have

## Students

| StudentID | Name |
| --------- | ---- |
| 1         | Ali  |
| 2         | Sara |

---

## Orders

| OrderID | StudentID |
| ------- | --------- |
| 100     | 1         |
| 101     | 2         |

StudentID in Orders refers to StudentID in Students.

It tells us

```
Order belongs to Ali.
```

This connecting column is called a **Foreign Key**.

Think of it as a reference or pointer to another table.

---

# Step 7: Composite Key

Sometimes one column is **not enough** to identify a row.

Example

A student can enroll in many courses.

A course can have many students.

Enrollment Table

| StudentID | CourseID |
| --------- | -------- |
| 1         | 101      |
| 1         | 102      |
| 2         | 101      |

Can StudentID uniquely identify a row?

No.

Student 1 appears twice.

Can CourseID uniquely identify a row?

No.

Course 101 appears twice.

But together:

```
(StudentID, CourseID)
```

every combination is unique.

This is called a **Composite Primary Key**.

---

# Step 8: Why Normalization Exists

Imagine this table.

| Student | Course | Teacher | Teacher Phone |
| ------- | ------ | ------- | ------------- |
| Ali     | Python | Ahmed   | 0300          |
| Sara    | Python | Ahmed   | 0300          |
| Hamza   | Python | Ahmed   | 0300          |

Ahmed's phone number is repeated three times.

Suppose Ahmed changes his phone.

Now we must edit three rows.

If we forget one...

Database becomes inconsistent.

Normalization solves this.

---

# First Normal Form (1NF)

Rule

> Every cell must contain exactly **one value** (atomic value).

---

Bad

| Student | Subjects     |
| ------- | ------------ |
| Ali     | Python, Java |

One cell has two values.

This makes searching difficult.

For example:

"Find everyone taking Java."

The database has to search inside text.

---

Good

| Student | Subject |
| ------- | ------- |
| Ali     | Python  |
| Ali     | Java    |

Now each row represents one fact.

---

Another bad example

| Student | Phones    |
| ------- | --------- |
| Ali     | 0300,0311 |

Good

| Student | Phone |
| ------- | ----- |
| Ali     | 0300  |
| Ali     | 0311  |

This satisfies 1NF.

---

# Before Learning 2NF

We need two important terms.

## Dependency

A dependency means:

> One piece of data determines another piece of data.

---

Example

| StudentID | StudentName |
| --------- | ----------- |
| 1         | Ali         |
| 2         | Sara        |

If I know StudentID = 1,

I immediately know

```
StudentName = Ali
```

We write this as

```
StudentID → StudentName
```

Read it as:

> StudentID determines StudentName.

---

Another example

```
CourseID → CourseName
```

because every CourseID has one course name.

---

# Partial Dependency

This is the most important idea in 2NF.

Imagine

| StudentID | CourseID | StudentName | CourseName |
| --------- | -------- | ----------- | ---------- |
| 1         | 101      | Ali         | Python     |
| 1         | 102      | Ali         | Java       |
| 2         | 101      | Sara        | Python     |

Primary Key

```
(StudentID, CourseID)
```

This is a composite key.

Now ask:

Does StudentName depend on the whole key?

No.

StudentName depends only on StudentID.

```
StudentID → StudentName
```

CourseID doesn't matter.

Similarly,

```
CourseID → CourseName
```

StudentID doesn't matter.

These are called **partial dependencies**, because each non-key attribute depends on **only part** of the composite key instead of the whole composite key.

---

# Second Normal Form (2NF)

### Official Definition

A table is in **2NF** if:

1. It is already in **1NF**.
2. Every non-key attribute depends on the **entire primary key**, not just part of it.

Let's unpack the new terms:

* **Attribute** = another word for a column.
* **Non-key attribute** = any column that is **not** part of the primary key.

In our table:

| StudentID | CourseID | StudentName | CourseName |
| --------- | -------- | ----------- | ---------- |

Primary key:

```
(StudentID, CourseID)
```

Non-key attributes are:

* StudentName
* CourseName

Now let's check them.

### StudentName

Does it depend on both StudentID and CourseID?

No.

If I know StudentID = 1, I already know the name is Ali.

The course doesn't matter.

```
StudentID → StudentName
```

### CourseName

Does it depend on both columns?

No.

Knowing CourseID = 101 is enough to know the course is Python.

```
CourseID → CourseName
```

Both are partial dependencies, so the table is **not in 2NF**.

---

## Fixing the Table

### Students

| StudentID | StudentName |
| --------- | ----------- |
| 1         | Ali         |
| 2         | Sara        |

---

### Courses

| CourseID | CourseName |
| -------- | ---------- |
| 101      | Python     |
| 102      | Java       |

---

### Enrollments

| StudentID | CourseID |
| --------- | -------- |
| 1         | 101      |
| 1         | 102      |
| 2         | 101      |

Now:

* The Students table stores facts about students.
* The Courses table stores facts about courses.
* The Enrollments table stores only which student takes which course.

Each fact is stored exactly once.

---

## Real-Life Analogy for 2NF

Imagine a cricket tournament.

Each match is uniquely identified by:

```
(Team, Stadium)
```

Now suppose the table is:

| Team | Stadium          | Team Coach | Stadium City |
| ---- | ---------------- | ---------- | ------------ |
| A    | National Stadium | Coach X    | Karachi      |
| A    | Gaddafi Stadium  | Coach X    | Lahore       |

* Team Coach depends only on **Team**.
* Stadium City depends only on **Stadium**.

Neither depends on the whole composite key.

So split the data:

* Teams (Team, Coach)
* Stadiums (Stadium, City)
* Matches (Team, Stadium)

That's 2NF.

---

# Before Learning 3NF

We need one more concept.

## Transitive Dependency

A transitive dependency means:

> A non-key column depends on another non-key column, instead of depending directly on the primary key.

Think of it like a chain.

```
Primary Key
     ↓
Department
     ↓
Manager
```

The manager is determined by the department, not directly by the employee.

---

# Third Normal Form (3NF)

### Official Definition

A table is in **3NF** if:

1. It is already in **2NF**.
2. No non-key attribute depends on another non-key attribute.

---

Example

| EmpID | Employee | Department | Manager |
| ----- | -------- | ---------- | ------- |
| 1     | Ali      | IT         | Ahmed   |
| 2     | Sara     | IT         | Ahmed   |
| 3     | John     | HR         | Bilal   |

Primary Key:

```
EmpID
```

Non-key attributes:

* Employee
* Department
* Manager

Now ask:

Does Manager depend on EmpID?

No.

The manager depends on the department.

```
Department → Manager
```

So the dependency chain is:

```
EmpID
   ↓
Department
   ↓
Manager
```

This is a **transitive dependency**.

If the IT manager changes, you must update every employee in the IT department. That creates repeated data and possible inconsistencies.

---

## Fixing 3NF

### Employees

| EmpID | Employee | DepartmentID |
| ----- | -------- | ------------ |
| 1     | Ali      | 1            |
| 2     | Sara     | 1            |
| 3     | John     | 2            |

---

### Departments

| DepartmentID | Department | Manager |
| ------------ | ---------- | ------- |
| 1            | IT         | Ahmed   |
| 2            | HR         | Bilal   |

Now:

* Each employee stores only which department they belong to.
* Each department stores its manager once.

If the IT manager changes, you update a single row.

---

# 2NF vs 3NF (The Difference)

Suppose you see a table.

Ask these questions in order:

### Is every cell atomic?

If **No**, fix it → **1NF**.

---

### Does every non-key column depend on the whole composite key?

If **No**, fix it → **2NF**.

This is about **partial dependencies**, and it only matters when the primary key has multiple columns.

---

### Does any non-key column depend on another non-key column?

If **Yes**, fix it → **3NF**.

This is about **transitive dependencies**.

---

# A Memory Trick

Imagine you're organizing a school:

* **1NF:** One fact per box. (One value per cell.)
* **2NF:** Put student facts with students, course facts with courses. (No partial dependency.)
* **3NF:** Don't store department details with employees; store them with departments. (No transitive dependency.)

Or remember this sentence:

> **1NF:** One value.
> **2NF:** Whole key.
> **3NF:** Only the key.

That captures the essence of the first three normal forms and is enough for most MySQL coursework and interviews.
