
# MongoDB Aggregation — From Zero

## 1. First: What problem does Aggregation solve?

Suppose we have a `students` collection:

```js
[
  { name: "Ali", department: "CS", marks: 85 },
  { name: "Ahmed", department: "CS", marks: 72 },
  { name: "Sara", department: "Physics", marks: 91 },
  { name: "Zain", department: "Physics", marks: 78 }
]
```

Now someone asks:

> "What is the average marks of each department?"

This isn't simply:

```js
find()
```

We need to:

1. Group students by department
2. Calculate average marks
3. Produce a new result

MongoDB's **Aggregation Framework** is designed for exactly this.

---

# 2. The Main Analogy: Factory Assembly Line 🏭

Think of MongoDB aggregation as a **factory assembly line**.

![Image](https://images.openai.com/static-rsc-4/vOFdEhEemPdgxhy5tiezOjhh7__e-Wr-fZOCV2q5w3TzNK3cukyUox-8pBYiR2w-qraggShDa5PBtTYky5oZ5qBMiqK4w0CTcVr5mmmRgipdTe1RKGDD9HS4Boh779SCGpbopa9w3u5LiNC7GcNkQioXdbH8xDk1XDjG4nQ_CbwHg0tfaXCnrGrCoyoeKbC1?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/6UDeMQh8IsAta2pzaJmBOzBgNFkVsppQnxk23a9WC86HLjO6Fht6tpYE5TVVooL92UPw7WvJEpx-plhkO2WVIOksLXjQaosKjnhnjPP1__eZ2-MRh-qCUr2_z5OlYD2xQuOZQ8RufmaYYRqo3yUqePPve0f1H4SS4yKKAHZlwQvccEN9ZE3WlKNifQykKgZ-?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/JfOM0sHuXeG6N-terYL7kFINksFXJFi83R-1mTBp2op__4JCjkMKUlo-FDL-zGzjtsPeIJ7dvbXquktdH3a3vr3X_WChIPO1Q2PdOLQqWdyd8-k9Ampv1GGXBgJh2MsdpbW5JNYS_Zexz15eCjEPY3PbcZZBcyseRT_6sUSghhT69ekqQCDo5c_V02hsrujj?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/9MWEhZOoUvCEAQvQjl88-3KRea2ysVQaJSkbiQpBO2AivwY145mMZVNes0NDslUQdyN07WYjfMsi8nimVCkZnndspFfVKDKFQRRJ6_7B6Is7ReN4X2wA8UxECI9hDu539qkaIKFkzXQkVnRjx1-N80Z2HD_hJ3jVdtd2DaQC4shaXdyYsYNCq_dyUPJ9ah8O?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/9VIkNlyEeZINp4KUzxZG0A55Ls297IRK0gsb2jeEwHfG_WtHpVvdvePU4jMkZ3vYX2a6KRKh4MACFDRnTLkC_PxQ_FjWIZE1D4Wwq1B0yKN3Y0KNd4Eof9m5zjc2Ko7iYfXUIO_oUXICTDZYM9oY66ov7BzaDda_Zs4Bk5qdF5lYkpEtG0T27terMnavuDW2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/bghmS-fDEMYJV7dB4QAzoL0Snu6INIAKariXXMxn_IkM1xskbThDnjr_3VOj89MMURgkkT3nCB7RLOYReKy7Xd2bgrxgCLeoCay57BgrdJoMPbNJR3XzJllpXyK7tFwFkBtGqZWzRlGz9l2gh88eMgJcKNZFyCOvb5XPlwKqi5XERw7eJZFr1aP-f7YDZHKi?purpose=fullsize)

Imagine raw products entering a factory:

```text
Products
   ↓
[Filter]
   ↓
[Sort]
   ↓
[Group]
   ↓
[Calculate]
   ↓
Finished Products
```

MongoDB works similarly:

```text
Documents
   ↓
$match
   ↓
$sort
   ↓
$group
   ↓
$project
   ↓
Result
```

This is called an:

# Aggregation Pipeline

---

# 3. What is a Pipeline?

A pipeline is simply:

> A sequence of stages where the output of one stage becomes the input of the next stage.

For example:

```js
db.students.aggregate([
    { $match: { department: "CS" } },

    { $sort: { marks: -1 } }
])
```

Think:

```text
All Students
     ↓
Filter CS students
     ↓
Sort by marks
     ↓
Final result
```

Each stage does **one job**.

That's the most important concept.

---

# 4. Basic Syntax

The general structure is:

```js
db.collection.aggregate([
    {
        $stage1: {
            // instructions
        }
    },
    {
        $stage2: {
            // instructions
        }
    }
])
```

For example:

```js
db.students.aggregate([
    {
        $match: {
            department: "CS"
        }
    },
    {
        $sort: {
            marks: -1
        }
    }
])
```

Notice:

```js
[
   stage1,
   stage2,
   stage3
]
```

The array represents the **pipeline**.

---

# 5. Our Example Database

Let's use this throughout the tutorial.

### `students`

```js
[
    {
        name: "Ali",
        department: "CS",
        age: 22,
        marks: 85
    },
    {
        name: "Ahmed",
        department: "CS",
        age: 23,
        marks: 72
    },
    {
        name: "Sara",
        department: "Physics",
        age: 21,
        marks: 91
    },
    {
        name: "Zain",
        department: "Physics",
        age: 22,
        marks: 78
    },
    {
        name: "Usman",
        department: "CS",
        age: 24,
        marks: 95
    }
]
```

---

# 6. `$match` — Filtering Documents

`$match` is basically MongoDB's:

```text
WHERE
```

from SQL.

SQL:

```sql
SELECT *
FROM students
WHERE department = 'CS';
```

MongoDB:

```js
db.students.aggregate([
    {
        $match: {
            department: "CS"
        }
    }
])
```

Result:

```text
Ali
Ahmed
Usman
```

### Analogy

Imagine a university entrance gate.

```text
100 students
     ↓
[Gate]
     ↓
Only CS students
```

`$match` is that gate.

---

# 7. `$sort` — Sorting Documents

SQL:

```sql
ORDER BY marks DESC
```

MongoDB:

```js
{
    $sort: {
        marks: -1
    }
}
```

`1` means ascending:

```js
$sort: { marks: 1 }
```

`-1` means descending:

```js
$sort: { marks: -1 }
```

Example:

```js
db.students.aggregate([
    {
        $sort: {
            marks: -1
        }
    }
])
```

Result:

```text
Usman    95
Sara     91
Ali      85
Zain     78
Ahmed    72
```

---

# 8. Combining `$match` + `$sort`

Now:

> Show CS students from highest marks to lowest.

```js
db.students.aggregate([
    {
        $match: {
            department: "CS"
        }
    },
    {
        $sort: {
            marks: -1
        }
    }
])
```

Pipeline:

```text
All Students
     │
     ▼
  $match
 department = CS
     │
     ▼
3 students
     │
     ▼
  $sort
 marks DESC
     │
     ▼
Usman 95
Ali   85
Ahmed 72
```

This is the core idea of aggregation.

---

# 9. `$project` — Choosing/Creating Fields

`$project` controls what fields appear in the output.

Suppose we only want:

```text
name
marks
```

Then:

```js
db.students.aggregate([
    {
        $project: {
            name: 1,
            marks: 1
        }
    }
])
```

Result:

```js
{
    name: "Ali",
    marks: 85
}
```

---

## Why is it called Project?

Think of a **camera** 📷.

Your document contains:

```text
name
department
age
marks
address
phone
email
```

You point the camera at:

```text
name
marks
```

Everything else disappears from the result.

---

# 10. `$project` Can Also Create Fields

This is where aggregation becomes really powerful.

Suppose:

```js
{
    name: "Ali",
    marks: 85
}
```

We want:

```text
percentage
```

Maybe marks are out of 100, so:

```js
{
    $project: {
        name: 1,
        percentage: "$marks"
    }
}
```

Here:

```js
"$marks"
```

means:

> Get the value of the `marks` field from the current document.

---

# 11. `$group` — The Most Important Stage

If you understand `$group`, you're halfway through aggregation.

Think of `$group` like this:

### University analogy

You have:

```text
Ali       CS
Ahmed     CS
Usman     CS

Sara      Physics
Zain      Physics
```

You put students into separate boxes:

```text
┌─────────────┐
│     CS      │
│ Ali         │
│ Ahmed       │
│ Usman       │
└─────────────┘

┌─────────────┐
│   Physics   │
│ Sara        │
│ Zain        │
└─────────────┘
```

That's `$group`.

---

# 12. Group Students by Department

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department"
        }
    }
])
```

Result:

```js
[
    { _id: "CS" },
    { _id: "Physics" }
]
```

### Why `_id`?

In `$group`, `_id` means:

> What should MongoDB group by?

So:

```js
_id: "$department"
```

means:

> Create one group for every unique department.

---

# 13. `$group` + `$sum`

Now we can count students.

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department",
            totalStudents: {
                $sum: 1
            }
        }
    }
])
```

Result:

```js
[
    {
        _id: "CS",
        totalStudents: 3
    },
    {
        _id: "Physics",
        totalStudents: 2
    }
]
```

---

# 14. Why `$sum: 1`?

This confuses almost everyone initially.

Suppose:

```text
CS students:

Ali
Ahmed
Usman
```

MongoDB sees:

```text
$sum: 1
$sum: 1
$sum: 1
```

Therefore:

```text
1 + 1 + 1 = 3
```

So:

```js
$sum: 1
```

means:

> Count each document as 1.

Very useful trick.

---

# 15. `$sum` Can Also Add a Field

Suppose we have:

```js
{
    product: "Laptop",
    price: 1000
}
```

We can calculate total price:

```js
{
    $group: {
        _id: null,
        totalSales: {
            $sum: "$price"
        }
    }
}
```

If prices are:

```text
1000
1500
500
```

Result:

```text
3000
```

---

# 16. `$avg`

Calculate average marks:

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department",

            averageMarks: {
                $avg: "$marks"
            }
        }
    }
])
```

Result:

```js
[
    {
        _id: "CS",
        averageMarks: 84
    },
    {
        _id: "Physics",
        averageMarks: 84.5
    }
]
```

---

# 17. `$max`

Highest marks per department:

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department",

            highestMarks: {
                $max: "$marks"
            }
        }
    }
])
```

Result:

```text
CS       95
Physics  91
```

---

# 18. `$min`

```js
{
    $group: {
        _id: "$department",

        lowestMarks: {
            $min: "$marks"
        }
    }
}
```

---

# 19. Important Group Accumulators

You should memorize these:

| Operator    | Purpose                      |
| ----------- | ---------------------------- |
| `$sum`      | Add/count                    |
| `$avg`      | Average                      |
| `$min`      | Minimum                      |
| `$max`      | Maximum                      |
| `$first`    | First value                  |
| `$last`     | Last value                   |
| `$push`     | Put values into array        |
| `$addToSet` | Put unique values into array |

These are called **accumulators**.

Why?

Because MongoDB processes multiple documents and **accumulates** information from them.

---

# 20. `$push` — Creating Arrays

Suppose we group students by department.

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department",

            students: {
                $push: "$name"
            }
        }
    }
])
```

Result:

```js
{
    _id: "CS",
    students: [
        "Ali",
        "Ahmed",
        "Usman"
    ]
}
```

Think:

```text
CS box

Ali
Ahmed
Usman

        ↓ $push

["Ali", "Ahmed", "Usman"]
```

---

# 21. `$addToSet`

Difference:

```js
$push
```

can contain duplicates.

```js
$addToSet
```

removes duplicates.

Example:

```js
{
    $group: {
        _id: "$department",
        ages: {
            $addToSet: "$age"
        }
    }
}
```

If ages are:

```text
22
22
23
24
```

result:

```text
[22, 23, 24]
```

---

# 22. `$count`

MongoDB can also count documents.

```js
db.students.aggregate([
    {
        $count: "totalStudents"
    }
])
```

Result:

```js
{
    totalStudents: 5
}
```

---

# 23. `$limit`

Only return first N documents.

```js
db.students.aggregate([
    {
        $limit: 3
    }
])
```

---

# 24. `$skip`

Skip documents.

```js
db.students.aggregate([
    {
        $skip: 2
    }
])
```

Very useful for pagination.

For example:

```text
Page 1:
skip 0
limit 10

Page 2:
skip 10
limit 10

Page 3:
skip 20
limit 10
```

---

# 25. `$unwind` — Very Important

Suppose we have:

```js
{
    name: "Ali",

    skills: [
        "JavaScript",
        "MongoDB",
        "React"
    ]
}
```

`$unwind` turns one document into multiple documents.

```js
db.students.aggregate([
    {
        $unwind: "$skills"
    }
])
```

Before:

```text
Ali
 ├── JavaScript
 ├── MongoDB
 └── React
```

After:

```text
Ali → JavaScript

Ali → MongoDB

Ali → React
```

Result:

```js
{
    name: "Ali",
    skills: "JavaScript"
}

{
    name: "Ali",
    skills: "MongoDB"
}

{
    name: "Ali",
    skills: "React"
}
```

### Analogy

Imagine a shopping cart:

```text
Order #101

[
  Laptop,
  Mouse,
  Keyboard
]
```

`$unwind` takes the cart apart:

```text
Order #101 → Laptop
Order #101 → Mouse
Order #101 → Keyboard
```

This becomes extremely useful with `$lookup`.

---

# 26. `$lookup` — MongoDB's JOIN

This is one of the most important aggregation stages.

Suppose we have:

### `orders`

```js
{
    productId: 101,
    quantity: 2
}
```

### `products`

```js
{
    _id: 101,
    name: "Laptop",
    price: 1000
}
```

We want:

```text
Order
+
Product information
```

That's a JOIN.

SQL:

```sql
SELECT *
FROM orders
JOIN products
ON orders.productId = products.id;
```

MongoDB:

```js
{
    $lookup: {
        from: "products",
        localField: "productId",
        foreignField: "_id",
        as: "product"
    }
}
```

Result:

```js
{
    productId: 101,
    quantity: 2,

    product: [
        {
            _id: 101,
            name: "Laptop",
            price: 1000
        }
    ]
}
```

Notice something important:

### `$lookup` normally produces an array.

That's why you often see:

```js
$lookup
   ↓
$unwind
```

together.

---

# 27. Real-World Aggregation Example

Let's build a small e-commerce example.

### Orders

```js
[
    {
        customer: "Ali",
        product: "Laptop",
        category: "Electronics",
        price: 1000,
        quantity: 2
    },

    {
        customer: "Ahmed",
        product: "Mouse",
        category: "Electronics",
        price: 50,
        quantity: 3
    },

    {
        customer: "Sara",
        product: "Book",
        category: "Books",
        price: 30,
        quantity: 5
    }
]
```

Question:

> How much revenue did each category generate?

We need:

```text
price × quantity
```

Then group by category.

---

# 28. `$project` for Calculations

```js
db.orders.aggregate([
    {
        $project: {
            category: 1,

            revenue: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    }
])
```

Result:

```text
Electronics → 2000
Electronics → 150
Books       → 150
```

---

# 29. Now `$group`

```js
db.orders.aggregate([
    {
        $project: {
            category: 1,

            revenue: {
                $multiply: [
                    "$price",
                    "$quantity"
                ]
            }
        }
    },

    {
        $group: {
            _id: "$category",

            totalRevenue: {
                $sum: "$revenue"
            }
        }
    }
])
```

Result:

```js
[
    {
        _id: "Electronics",
        totalRevenue: 2150
    },

    {
        _id: "Books",
        totalRevenue: 150
    }
]
```

This is **real aggregation**.

---

# 30. Pipeline Thinking

Whenever you receive an aggregation problem, think:

```text
What documents?
      ↓
Do I need filtering?
      ↓
Do I need to transform data?
      ↓
Do I need to group?
      ↓
Do I need calculations?
      ↓
Do I need sorting?
      ↓
What final fields should appear?
```

For example:

> Find top 5 departments by average marks.

Think:

```text
Students
   ↓
$group
   ↓
average marks
   ↓
$sort
   ↓
descending
   ↓
$limit
   ↓
5
```

Code:

```js
db.students.aggregate([
    {
        $group: {
            _id: "$department",

            averageMarks: {
                $avg: "$marks"
            }
        }
    },

    {
        $sort: {
            averageMarks: -1
        }
    },

    {
        $limit: 5
    }
])
```

---

# 31. `$set` / `$addFields`

You can create a new field without using `$project`.

```js
{
    $set: {
        passed: {
            $gte: ["$marks", 50]
        }
    }
}
```

If:

```text
marks = 85
```

you get:

```js
{
    marks: 85,
    passed: true
}
```

Think:

```text
Existing document
      +
New information
      ↓
Updated document
```

---

# 32. Conditional Logic with `$cond`

Suppose we want:

```text
marks >= 50 → Pass
marks < 50  → Fail
```

MongoDB:

```js
{
    $set: {
        result: {
            $cond: [
                { $gte: ["$marks", 50] },
                "Pass",
                "Fail"
            ]
        }
    }
}
```

This is basically:

```js
if (marks >= 50) {
    result = "Pass";
} else {
    result = "Fail";
}
```

---

# 33. `$match` + `$set` + `$group`

Now a more realistic example.

> Calculate how many students passed in each department.

```js
db.students.aggregate([
    {
        $set: {
            passed: {
                $gte: ["$marks", 50]
            }
        }
    },

    {
        $group: {
            _id: "$department",

            totalStudents: {
                $sum: 1
            },

            passedStudents: {
                $sum: {
                    $cond: [
                        "$passed",
                        1,
                        0
                    ]
                }
            }
        }
    }
])
```

Result could be:

```js
{
    _id: "CS",
    totalStudents: 3,
    passedStudents: 3
}
```

---

# 34. Aggregation vs `find()`

This is extremely important.

### `find()`

Used primarily to:

```text
retrieve documents
```

Example:

```js
db.students.find({
    department: "CS"
})
```

### Aggregation

Used to:

```text
process
transform
calculate
group
join
analyze
```

Example:

```js
db.students.aggregate([
    {
        $match: {
            department: "CS"
        }
    },
    {
        $group: {
            _id: null,
            average: {
                $avg: "$marks"
            }
        }
    }
])
```

Think:

```text
find()
   ↓
"Give me these documents."

aggregate()
   ↓
"Process these documents and give me a meaningful result."
```

---

# 35. SQL → MongoDB Aggregation Mapping

This is extremely useful if you know MySQL.

| SQL        | MongoDB              |
| ---------- | -------------------- |
| `WHERE`    | `$match`             |
| `SELECT`   | `$project`           |
| `GROUP BY` | `$group`             |
| `ORDER BY` | `$sort`              |
| `LIMIT`    | `$limit`             |
| `OFFSET`   | `$skip`              |
| `JOIN`     | `$lookup`            |
| `COUNT()`  | `$count` / `$sum: 1` |
| `AVG()`    | `$avg`               |
| `SUM()`    | `$sum`               |
| `MAX()`    | `$max`               |
| `MIN()`    | `$min`               |

But don't think MongoDB is just SQL with different syntax.

The **document-oriented data model** changes how you design queries.

---

# 36. A Complete Example

Question:

> Find the average marks of students in each department, show only departments whose average is above 80, and sort them from highest to lowest.

Pipeline:

```js
db.students.aggregate([
    // 1. Group by department
    {
        $group: {
            _id: "$department",

            averageMarks: {
                $avg: "$marks"
            }
        }
    },

    // 2. Keep only average > 80
    {
        $match: {
            averageMarks: {
                $gt: 80
            }
        }
    },

    // 3. Sort highest first
    {
        $sort: {
            averageMarks: -1
        }
    }
])
```

Pipeline visualization:

```text
              STUDENTS
                  │
                  ▼
             ┌─────────┐
             │ $group  │
             └─────────┘
                  │
           Department averages
                  │
                  ▼
             ┌─────────┐
             │ $match  │
             │ avg >80 │
             └─────────┘
                  │
                  ▼
             ┌─────────┐
             │ $sort   │
             └─────────┘
                  │
                  ▼
               RESULT
```

---

# 37. Order of Stages Matters

This:

```js
$match
→ $sort
→ $group
```

is NOT necessarily equivalent to:

```js
$group
→ $match
→ $sort
```

because each stage receives the output of the previous stage.

Think about water flowing through pipes:

```text
Water
 ↓
Filter
 ↓
Heater
 ↓
Container
```

You can't randomly rearrange the pipes and expect the same result.

---

# 38. Performance Tip ⭐

Usually, filter as early as possible.

Prefer:

```js
[
    {
        $match: {
            department: "CS"
        }
    },

    {
        $group: {
            _id: "$department",
            average: {
                $avg: "$marks"
            }
        }
    }
]
```

rather than unnecessarily processing every document first.

Why?

Suppose you have:

```text
10,000,000 documents
```

but only:

```text
50,000 CS students
```

If `$match` happens first:

```text
10,000,000
      ↓
   $match
      ↓
50,000
      ↓
$group
```

Much less data reaches later stages.

---

# 39. Aggregation in Mongoose

Since you're using Express + Mongoose, you'll normally write:

```js
const students = await Student.aggregate([
    {
        $match: {
            department: "CS"
        }
    },

    {
        $group: {
            _id: "$department",

            averageMarks: {
                $avg: "$marks"
            }
        }
    }
]);
```

Notice:

```js
Student.aggregate(...)
```

rather than:

```js
Student.find(...)
```

---

# 40. A Real Express API

For example:

```js
app.get("/students/stats", async (req, res) => {
    try {
        const stats = await Student.aggregate([
            {
                $group: {
                    _id: "$department",

                    totalStudents: {
                        $sum: 1
                    },

                    averageMarks: {
                        $avg: "$marks"
                    },

                    highestMarks: {
                        $max: "$marks"
                    }
                }
            },

            {
                $sort: {
                    averageMarks: -1
                }
            }
        ]);

        res.json(stats);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});
```

The API could return:

```json
[
    {
        "_id": "Physics",
        "totalStudents": 2,
        "averageMarks": 84.5,
        "highestMarks": 91
    },
    {
        "_id": "CS",
        "totalStudents": 3,
        "averageMarks": 84,
        "highestMarks": 95
    }
]
```

Now you're doing something an ordinary CRUD API usually doesn't do:

> **Generating analytics from raw data.**

---

# 41. The Aggregation Operators You Should Learn

Don't try to memorize 100+ operators at once.

Learn them in this order:

### Level 1 — Essential

```text
$match
$project
$group
$sort
$limit
$skip
```

### Level 2 — Very important

```text
$unwind
$lookup
$set
$addFields
$count
```

### Level 3 — Calculations

```text
$sum
$avg
$min
$max
$multiply
$divide
$subtract
$add
```

### Level 4 — Conditions

```text
$cond
$ifNull
$and
$or
$not
$eq
$gt
$gte
$lt
$lte
```

### Level 5 — Arrays

```text
$push
$addToSet
$size
$arrayElemAt
$filter
$map
```

---

# 42. The Most Important Mental Model

Whenever you see:

```js
aggregate([
    stage1,
    stage2,
    stage3,
    stage4
])
```

read it as a sentence:

> **Take the documents → do this → then do this → then do this → finally give me the result.**

For example:

```js
db.orders.aggregate([
    {
        $match: {
            status: "completed"
        }
    },

    {
        $group: {
            _id: "$customer",

            totalSpent: {
                $sum: "$amount"
            }
        }
    },

    {
        $sort: {
            totalSpent: -1
        }
    },

    {
        $limit: 10
    }
])
```

Read it in English:

> Take completed orders → group them by customer → calculate how much each customer spent → sort customers by spending → give me the top 10.

**That's aggregation.**

---

# 43. One Final Real-World Analogy

Imagine a restaurant manager.

Raw orders:

```text
Ali → Biryani → Rs. 500
Sara → Burger → Rs. 700
Ali → Burger → Rs. 700
Ahmed → Biryani → Rs. 500
```

The manager asks:

### "How much did each customer spend?"

You do:

```text
Orders
  ↓
$group by customer
  ↓
$sum amount
  ↓
Customer spending
```

Then:

### "Who spent the most?"

```text
$sort
  ↓
$limit
```

Then:

### "Only show customers spending > Rs. 1000"

```text
$match
```

Then:

### "Which food category generated the most revenue?"

```text
$group by category
  ↓
$sum revenue
  ↓
$sort
```

That entire style of **business/data analysis directly inside MongoDB** is what the Aggregation Framework is for.

---

## 🧠 Your Aggregation Cheat Sheet

```text
                  AGGREGATION
                       │
             ┌─────────┴─────────┐
             │                   │
          FILTER              TRANSFORM
          $match              $project
                               $set
                               $addFields
             │                   │
             └─────────┬─────────┘
                       │
                     GROUP
                     $group
                       │
             ┌─────────┼─────────┐
             │         │         │
           $sum      $avg      $max
           $min      $push     $addToSet
                       │
                       ▼
                    ARRAYS
                   $unwind
                       │
                       ▼
                    JOIN
                   $lookup
                       │
                       ▼
                    SORT
                   $sort
                       │
                       ▼
                  PAGINATION
                $skip + $limit
```

### If you remember only 7 things:

```text
$match    → filter
$project  → choose/create fields
$set      → add fields
$group    → group documents
$sort     → sort
$unwind   → break arrays apart
$lookup   → join collections
```

And the **golden rule**:

> **Aggregation is not one operation. It is a pipeline of small operations, where each stage transforms the data for the next stage.**

Since you're learning MongoDB specifically for backend development, the natural next step is to build a **complete Express + MongoDB CRUD + Aggregation API** and use aggregation for things like **sales reports, top customers, monthly revenue, `$lookup` joins, pagination, and dashboards**.
