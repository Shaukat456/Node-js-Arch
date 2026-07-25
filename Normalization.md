Normalization in MySQL is the process of **organizing data** so that:

1. Data is **not repeated unnecessarily**.
2. Data is **consistent**.
3. It becomes easier to **update, insert, and delete** data without errors.

---

# Real-Life Analogy: School

Imagine you're managing a school.

You have a spreadsheet like this:

| StudentID | StudentName | Course | Teacher | Teacher Phone |
| --------- | ----------- | ------ | ------- | ------------- |
| 1         | Ali         | Python | Ahmed   | 03001234567   |
| 2         | Sara        | Python | Ahmed   | 03001234567   |
| 3         | John        | Java   | Bilal   | 03111234567   |
| 4         | Hamza       | Python | Ahmed   | 03001234567   |

Notice something?

Teacher Ahmed's phone number appears **3 times**.

Suppose Ahmed changes his phone number.

Now you have to update it in **3 rows**.

If you forget one row...

| Student | Teacher | Phone         |
| ------- | ------- | ------------- |
| Ali     | Ahmed   | 03009999999   |
| Sara    | Ahmed   | 03009999999   |
| Hamza   | Ahmed   | 03001234567 ❌ |

Now the database contains incorrect information.

This problem is exactly why normalization exists.

---

# Before Normalization

```
Students Table

+-------------------------------------------------------------+
| Student | Course | Teacher | Teacher Phone |
+-------------------------------------------------------------+
| Ali     | Python | Ahmed   | 0300...       |
| Sara    | Python | Ahmed   | 0300...       |
| John    | Java   | Bilal   | 0311...       |
| Hamza   | Python | Ahmed   | 0300...       |
+-------------------------------------------------------------+
```

Teacher information is duplicated.

---

# After Normalization

Separate the data.

### Teachers Table

| TeacherID | Teacher | Phone       |
| --------- | ------- | ----------- |
| 1         | Ahmed   | 03001234567 |
| 2         | Bilal   | 03111234567 |

---

### Courses Table

| CourseID | Course | TeacherID |
| -------- | ------ | --------- |
| 1        | Python | 1         |
| 2        | Java   | 2         |

---

### Students Table

| StudentID | Name  | CourseID |
| --------- | ----- | -------- |
| 1         | Ali   | 1        |
| 2         | Sara  | 1        |
| 3         | John  | 2        |
| 4         | Hamza | 1        |

Now if Ahmed changes his phone number...

Only **one row** changes.

---

# Why Normalize?

Without normalization:

* Duplicate data
* Wasted storage
* Update mistakes
* Delete mistakes
* Insert mistakes

With normalization:

* Less duplication
* Easy maintenance
* Faster updates
* Cleaner database

---

# Three Main Problems

## 1. Update Anomaly

Before

| Student | Teacher | Phone |
| ------- | ------- | ----- |
| Ali     | Ahmed   | 0300  |
| Sara    | Ahmed   | 0300  |
| Hamza   | Ahmed   | 0300  |

Ahmed changes number.

Need to update **3 rows**.

Miss one row.

Database becomes inconsistent.

---

## 2. Insert Anomaly

Suppose a new teacher joins.

Teacher: Hassan

Phone: 03331234567

But no students yet.

In the old table you **cannot insert Hassan** because there is no student.

Teacher information depends on student data.

Problem.

---

## 3. Delete Anomaly

Suppose only one student studies Java.

| Student | Course | Teacher |
| ------- | ------ | ------- |
| John    | Java   | Bilal   |

John leaves school.

Delete this row.

Oops...

You also lost information that Bilal teaches Java.

---

Normalization fixes all these problems.

---

# What are Normal Forms?

Think of them as **levels of cleanliness**.

```
Raw Data

↓

1NF

↓

2NF

↓

3NF

↓

BCNF

↓

4NF

↓

5NF
```

In practice, most applications stop at **3NF**.

---

# First Normal Form (1NF)

Rule:

> Every column should contain only ONE value.

Bad Table

| Student | Subjects     |
| ------- | ------------ |
| Ali     | Python, Java |

One cell has two values.

Not allowed.

---

Good Table

| Student | Subject |
| ------- | ------- |
| Ali     | Python  |
| Ali     | Java    |

Each cell contains exactly one value.

---

Another Example

Bad

| Name | Phones    |
| ---- | --------- |
| Ali  | 0300,0311 |

Good

| Name | Phone |
| ---- | ----- |
| Ali  | 0300  |
| Ali  | 0311  |

One phone per row.

---

## SQL Example

Bad

```sql
CREATE TABLE students(
    id INT,
    name VARCHAR(50),
    courses VARCHAR(100)
);
```

Data

```
1
Ali
Python,Java,C++
```

Not normalized.

---

Better

```sql
StudentCourses

StudentID
Course
```

```
1 Python
1 Java
1 C++
```

---

# Second Normal Form (2NF)

Rule:

Already in 1NF

AND

Every non-key column depends on the **entire primary key**, not just part of it.

This mostly matters when you have a **composite primary key**.

---

Example

Imagine

```
Enrollment

StudentID
CourseID
StudentName
CourseName
```

Primary Key

```
(StudentID, CourseID)
```

Data

| StudentID | CourseID | StudentName | CourseName |
| --------- | -------- | ----------- | ---------- |
| 1         | 101      | Ali         | Python     |
| 1         | 102      | Ali         | Java       |
| 2         | 101      | Sara        | Python     |

Problem:

StudentName depends only on StudentID.

Not on CourseID.

CourseName depends only on CourseID.

Not on StudentID.

This violates 2NF.

---

Solution

Students

| StudentID | StudentName |
| --------- | ----------- |
| 1         | Ali         |
| 2         | Sara        |

Courses

| CourseID | CourseName |
| -------- | ---------- |
| 101      | Python     |
| 102      | Java       |

Enrollment

| StudentID | CourseID |
| --------- | -------- |
| 1         | 101      |
| 1         | 102      |
| 2         | 101      |

Now every attribute belongs in the correct table.

---

# Third Normal Form (3NF)

Rule

Already in 2NF

AND

No non-key column should depend on another non-key column.

---

Example

Employees

| EmpID | Name | Department | Manager |
| ----- | ---- | ---------- | ------- |
| 1     | Ali  | IT         | Ahmed   |
| 2     | Sara | IT         | Ahmed   |
| 3     | John | HR         | Bilal   |

Problem

Manager depends on Department.

Not Employee.

```
EmpID

↓

Department

↓

Manager
```

This is called a **transitive dependency**.

---

Solution

Employees

| EmpID | Name | DepartmentID |
| ----- | ---- | ------------ |
| 1     | Ali  | 1            |
| 2     | Sara | 1            |
| 3     | John | 2            |

Departments

| DepartmentID | Department | Manager |
| ------------ | ---------- | ------- |
| 1            | IT         | Ahmed   |
| 2            | HR         | Bilal   |

Now manager information is stored once.

---

# Complete School Database (3NF)

## Students

| StudentID | Name |
| --------- | ---- |
| 1         | Ali  |
| 2         | Sara |

---

## Teachers

| TeacherID | Name  |
| --------- | ----- |
| 1         | Ahmed |
| 2         | Bilal |

---

## Courses

| CourseID | Course | TeacherID |
| -------- | ------ | --------- |
| 1        | Python | 1         |
| 2        | Java   | 2         |

---

## Enrollment

| StudentID | CourseID |
| --------- | -------- |
| 1         | 1        |
| 1         | 2        |
| 2         | 1        |

Everything is connected using foreign keys.

---

# Analogy: Wardrobe

Imagine your wardrobe.

❌ Clothes thrown together:

* Shirts
* Shoes
* Socks
* Jackets

Finding anything takes time.

Normalized wardrobe:

Drawer 1 → Shirts

Drawer 2 → Socks

Rack → Shoes

Shelf → Jackets

Same clothes, better organization.

A normalized database is the same idea: each type of information has its own place.

---

# Remember These Rules

| Normal Form | Rule                                                 |
| ----------- | ---------------------------------------------------- |
| 1NF         | One value per cell (atomic values)                   |
| 2NF         | Remove partial dependency on part of a composite key |
| 3NF         | Remove transitive dependency (non-key → non-key)     |

---

# Exam Tip

A simple way to remember the progression is:

* **1NF:** "One value in each cell."
* **2NF:** "Every non-key attribute depends on the whole key."
* **3NF:** "Non-key attributes depend only on the key, not on other non-key attributes."

So you can remember it as:

> **1NF = Atomic values**
> **2NF = Whole key**
> **3NF = Nothing but the key**
