
# MySQL Joins — The Guide You'll Never Forget

## The core idea

Think of two guest lists for a wedding:

- **Bride's list** = Table A
- **Groom's list** = Table B

A **JOIN** is just a rule for deciding who gets invited, based on how the two lists overlap. Every join type below is just a different rule for combining two tables. Once that clicks, the syntax is just details.

---

## Step 0: The setup (run this first)

Every example in this guide uses the same two tables, so you can copy-paste and follow along in your own MySQL instance.

```sql
CREATE DATABASE join_demo;
USE join_demo;

CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(50)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  amount DECIMAL(10,2)
);

INSERT INTO customers (id, name) VALUES
  (1, 'Ali'),
  (2, 'Sara'),
  (3, 'Zain'),
  (4, 'Nadia');

INSERT INTO orders (id, customer_id, amount) VALUES
  (1, 1, 500.00),
  (2, 1, 200.00),
  (3, 3, 900.00),
  (4, 5, 150.00);  -- note: customer_id 5 doesn't exist!
```

**Why this data is designed this way — memorize this shape:**

| Situation | Who represents it |
|---|---|
| A customer with multiple orders | Ali (id 1) |
| A customer with zero orders | Sara, Nadia |
| An order with no matching customer | Order #4 (customer_id 5) |

These three cases are the *only* things that ever differ between join types. Every join type below is just a different answer to: **"what do I do with unmatched rows on each side?"**

---

## The four shapes at a glance

Every join type is just a different shaded region of the same two overlapping circles (`customers` and `orders`). Keep this picture in your head — the rest of this guide is just teaching you how to write the SQL for each shape.

<div align="center">
<svg width="600" height="320" viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="ovA"><circle cx="90" cy="80" r="50"/></clipPath>
    <clipPath id="ovB"><circle cx="150" cy="80" r="50"/></clipPath>
  </defs>

  <!-- INNER -->
  <text x="120" y="15" font-size="13" font-weight="600" text-anchor="middle" fill="#333">INNER JOIN</text>
  <circle cx="90" cy="80" r="50" fill="none" stroke="#999" stroke-width="1.5"/>
  <circle cx="150" cy="80" r="50" fill="none" stroke="#999" stroke-width="1.5"/>
  <g clip-path="url(#ovA)"><g clip-path="url(#ovB)"><rect x="0" y="0" width="240" height="160" fill="#d97706" opacity="0.75"/></g></g>
  <text x="90" y="148" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="150" y="148" font-size="11" text-anchor="middle" fill="#666">orders</text>

  <!-- LEFT -->
  <text x="420" y="15" font-size="13" font-weight="600" text-anchor="middle" fill="#333">LEFT JOIN</text>
  <circle cx="390" cy="80" r="50" fill="#2563eb" opacity="0.55" stroke="#999" stroke-width="1.5"/>
  <circle cx="450" cy="80" r="50" fill="none" stroke="#999" stroke-width="1.5"/>
  <text x="390" y="148" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="450" y="148" font-size="11" text-anchor="middle" fill="#666">orders</text>

  <!-- RIGHT -->
  <text x="120" y="185" font-size="13" font-weight="600" text-anchor="middle" fill="#333">RIGHT JOIN</text>
  <circle cx="90" cy="250" r="50" fill="none" stroke="#999" stroke-width="1.5"/>
  <circle cx="150" cy="250" r="50" fill="#dc2626" opacity="0.5" stroke="#999" stroke-width="1.5"/>
  <text x="90" y="318" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="150" y="318" font-size="11" text-anchor="middle" fill="#666">orders</text>

  <!-- FULL -->
  <text x="420" y="185" font-size="13" font-weight="600" text-anchor="middle" fill="#333">FULL OUTER JOIN</text>
  <circle cx="390" cy="250" r="50" fill="#7c3aed" opacity="0.45" stroke="#999" stroke-width="1.5"/>
  <circle cx="450" cy="250" r="50" fill="#7c3aed" opacity="0.45" stroke="#999" stroke-width="1.5"/>
  <text x="390" y="318" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="450" y="318" font-size="11" text-anchor="middle" fill="#666">orders</text>
</svg>
</div>

---

## Step 1: INNER JOIN — only the overlap

**Rule:** Return a row only when both tables have a match. Unmatched rows on either side are dropped entirely.

> **Analogy:** Only guests that *both* the bride and groom know get invited. Everyone else — sorry.

<div align="center">
<svg width="260" height="170" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="innerA1"><circle cx="100" cy="80" r="55"/></clipPath>
    <clipPath id="innerB1"><circle cx="160" cy="80" r="55"/></clipPath>
  </defs>
  <circle cx="100" cy="80" r="55" fill="none" stroke="#999" stroke-width="1.5"/>
  <circle cx="160" cy="80" r="55" fill="none" stroke="#999" stroke-width="1.5"/>
  <g clip-path="url(#innerA1)"><g clip-path="url(#innerB1)"><rect x="0" y="0" width="260" height="170" fill="#d97706" opacity="0.75"/></g></g>
  <text x="100" y="155" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="160" y="155" font-size="11" text-anchor="middle" fill="#666">orders</text>
  <text x="130" y="80" font-size="10" text-anchor="middle" fill="#7c3a00" font-weight="600" dominant-baseline="middle">shaded</text>
</svg>
</div>

### Implementation

```sql
SELECT customers.name, orders.amount
FROM customers
INNER JOIN orders
  ON customers.id = orders.customer_id;
```

### Step-by-step what MySQL does

1. Takes every row in `customers`.
2. For each one, looks for `orders` rows where `orders.customer_id = customers.id`.
3. Keeps the pairing only if a match is found. No match → row is dropped, both sides.

### Result

```
+-------+--------+
| name  | amount |
+-------+--------+
| Ali   | 500.00 |
| Ali   | 200.00 |
| Zain  | 900.00 |
+-------+--------+
```

Sara and Nadia are gone (no orders). Order #4 is gone (no matching customer). Only the guaranteed-overlap rows survive.

**Memory hook:** `INNER` = *intersection*. If you know Venn diagrams, you already know `INNER JOIN`.

---

## Step 2: LEFT JOIN — keep everyone on the left

**Rule:** Return *every* row from the left table (the one right after `FROM`), attaching matching right-table data where it exists, or `NULL` where it doesn't.

> **Analogy:** It's the bride's wedding too. Everyone on *her* list is invited, whether or not the groom happens to know them.

<div align="center">
<svg width="260" height="170" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="80" r="55" fill="#2563eb" opacity="0.55" stroke="#999" stroke-width="1.5"/>
  <circle cx="160" cy="80" r="55" fill="none" stroke="#999" stroke-width="1.5"/>
  <text x="100" y="155" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="160" y="155" font-size="11" text-anchor="middle" fill="#666">orders</text>
  <text x="80" y="80" font-size="10" text-anchor="middle" fill="#1e3a8a" font-weight="600" dominant-baseline="middle">shaded</text>
</svg>
</div>

### Implementation

```sql
SELECT customers.name, orders.amount
FROM customers
LEFT JOIN orders
  ON customers.id = orders.customer_id;
```

### Step-by-step what MySQL does

1. Takes every row in `customers` — all four, no exceptions.
2. Attaches matching `orders` rows if any exist.
3. If no match exists, fills the `orders` columns with `NULL` instead of dropping the row.

### Result

```
+-------+--------+
| name  | amount |
+-------+--------+
| Ali   | 500.00 |
| Ali   | 200.00 |
| Sara  | NULL   |
| Zain  | 900.00 |
| Nadia | NULL   |
+-------+--------+
```

Sara and Nadia now appear with `NULL` amounts — visible proof they exist but never ordered anything.

### Real-world use case

This is the join you'll reach for constantly: **"show me all X, and their Y if they have any."**

```sql
-- All customers and their total spend, including customers who've never ordered
SELECT
  customers.name,
  COALESCE(SUM(orders.amount), 0) AS total_spent
FROM customers
LEFT JOIN orders ON customers.id = orders.customer_id
GROUP BY customers.id, customers.name;
```

```
+-------+-------------+
| name  | total_spent |
+-------+-------------+
| Ali   |     700.00  |
| Sara  |       0.00  |
| Zain  |     900.00  |
| Nadia |       0.00  |
+-------+-------------+
```

Notice `COALESCE(SUM(...), 0)` — without it, Sara and Nadia would show `NULL` instead of `0`, because `SUM()` of nothing is `NULL`, not zero.

**Memory hook:** *LEFT stays whole. RIGHT gets filled in or left blank.* The table named first in `FROM` is the "protected" one — it never loses rows.

---

## Step 3: RIGHT JOIN — the mirror image

**Rule:** Same idea as LEFT JOIN, flipped. Keep every row from the right table; fill `NULL` where the left table has no match.

<div align="center">
<svg width="260" height="170" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="80" r="55" fill="none" stroke="#999" stroke-width="1.5"/>
  <circle cx="160" cy="80" r="55" fill="#dc2626" opacity="0.5" stroke="#999" stroke-width="1.5"/>
  <text x="100" y="155" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="160" y="155" font-size="11" text-anchor="middle" fill="#666">orders</text>
  <text x="180" y="80" font-size="10" text-anchor="middle" fill="#7f1d1d" font-weight="600" dominant-baseline="middle">shaded</text>
</svg>
</div>

### Implementation

```sql
SELECT customers.name, orders.amount
FROM customers
RIGHT JOIN orders
  ON customers.id = orders.customer_id;
```

### Step-by-step what MySQL does

1. Takes every row in `orders` — all four, no exceptions.
2. Attaches matching `customers` rows if any exist.
3. If no match, fills the `customers` columns with `NULL`.

### Result

```
+------+--------+
| name | amount |
+------+--------+
| Ali  | 500.00 |
| Ali  | 200.00 |
| Zain | 900.00 |
| NULL | 150.00 |
+------+--------+
```

Order #4 (customer_id 5, which doesn't exist) now shows up with `NULL` for the name — orphaned data made visible.

### The swap trick

Any `RIGHT JOIN` can be rewritten as a `LEFT JOIN` by swapping the table order:

```sql
-- Identical result to the RIGHT JOIN above
SELECT customers.name, orders.amount
FROM orders
LEFT JOIN customers
  ON customers.id = orders.customer_id;
```

**Memory hook:** Most developers barely use `RIGHT JOIN` in practice — they just flip the tables and use `LEFT JOIN`, since it reads more naturally. If you know LEFT JOIN well, RIGHT JOIN is free knowledge.

---

## Step 4: FULL OUTER JOIN — nobody left behind

**Rule:** Keep everything from both sides. Matches join up; unmatched rows on *either* side show `NULL` for the missing columns.

> **Analogy:** Both families' entire guest lists attend — the bride's friends who don't know the groom, the groom's friends who don't know the bride, and everyone in between.

<div align="center">
<svg width="260" height="170" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="80" r="55" fill="#7c3aed" opacity="0.45" stroke="#999" stroke-width="1.5"/>
  <circle cx="160" cy="80" r="55" fill="#7c3aed" opacity="0.45" stroke="#999" stroke-width="1.5"/>
  <text x="100" y="155" font-size="11" text-anchor="middle" fill="#666">customers</text>
  <text x="160" y="155" font-size="11" text-anchor="middle" fill="#666">orders</text>
  <text x="130" y="140" font-size="10" text-anchor="middle" fill="#4c1d95" font-weight="600" dominant-baseline="middle">all shaded</text>
</svg>
</div>

### The MySQL gotcha (memorize this forever)

⚠️ **MySQL has no `FULL OUTER JOIN` keyword.** Unlike PostgreSQL or SQL Server, you have to build it yourself with `UNION`.

### Implementation

```sql
SELECT customers.name, orders.amount
FROM customers
LEFT JOIN orders
  ON customers.id = orders.customer_id

UNION

SELECT customers.name, orders.amount
FROM customers
RIGHT JOIN orders
  ON customers.id = orders.customer_id;
```

### Step-by-step what's happening

1. First query: LEFT JOIN → all customers, matched orders or `NULL`.
2. Second query: RIGHT JOIN → all orders, matched customers or `NULL`.
3. `UNION` stacks both result sets and **automatically removes exact duplicate rows** (the genuinely matched rows appear in both queries, so `UNION` collapses them to one copy).

### Result

```
+-------+--------+
| name  | amount |
+-------+--------+
| Ali   | 500.00 |
| Ali   | 200.00 |
| Sara  | NULL   |
| Zain  | 900.00 |
| Nadia | NULL   |
| NULL  | 150.00 |
+-------+--------+
```

Everyone shows up: matched pairs, customers with no orders, and the orphaned order with no customer.

**Important detail:** use `UNION`, not `UNION ALL`, or you may get true duplicate rows in edge cases where two unrelated rows happen to produce identical output. `UNION` deduplicates; `UNION ALL` doesn't.

**Memory hook:** *"MySQL forgot to invite FULL JOIN to the party — you build it yourself out of LEFT + RIGHT + UNION."*

---

## Step 5: CROSS JOIN — the wildcard

**Rule:** Every row from table A paired with every row from table B. No `ON` clause, no matching condition — just every possible combination.

> **Analogy:** A t-shirt shop with sizes `{S, M, L}` and colors `{Red, Blue}`. A CROSS JOIN produces every size-color combination — the entire product catalog — because "size" and "color" don't need to match on anything; you *want* every pairing.

<div align="center">
<svg width="260" height="170" viewBox="0 0 260 170" xmlns="http://www.w3.org/2000/svg">
  <circle cx="90" cy="80" r="45" fill="none" stroke="#999" stroke-width="1.5" stroke-dasharray="4 3"/>
  <circle cx="180" cy="80" r="45" fill="none" stroke="#999" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="90" y="150" font-size="11" text-anchor="middle" fill="#666">sizes</text>
  <text x="180" y="150" font-size="11" text-anchor="middle" fill="#666">colors</text>
  <text x="135" y="20" font-size="10" text-anchor="middle" fill="#666">no overlap needed — every pair kept</text>
  <line x1="70" y1="65" x2="160" y2="65" stroke="#059669" stroke-width="1"/>
  <line x1="70" y1="80" x2="160" y2="80" stroke="#059669" stroke-width="1"/>
  <line x1="70" y1="95" x2="160" y2="95" stroke="#059669" stroke-width="1"/>
</svg>
</div>

### Implementation

```sql
CREATE TABLE sizes (size VARCHAR(5));
CREATE TABLE colors (color VARCHAR(10));

INSERT INTO sizes (size) VALUES ('S'), ('M'), ('L');
INSERT INTO colors (color) VALUES ('Red'), ('Blue');

SELECT sizes.size, colors.color
FROM sizes
CROSS JOIN colors;
```

### Step-by-step what MySQL does

1. Takes every row in `sizes` (3 rows).
2. Pairs each one with every row in `colors` (2 rows).
3. No filtering happens — output is always `rows(A) × rows(B)`.

### Result

```
+------+-------+
| size | color |
+------+-------+
| S    | Red   |
| S    | Blue  |
| M    | Red   |
| M    | Blue  |
| L    | Red   |
| L    | Blue  |
+------+-------+
```

3 sizes × 2 colors = 6 rows, every combination represented.

**Warning:** CROSS JOIN on large tables explodes fast — 1,000 rows × 1,000 rows = 1,000,000 rows. Only use it when you genuinely want the full combinatorial set (product variants, calendar date × store combinations, etc.).

**Memory hook:** *CROSS = combinatorics, not comparison.* There's no `ON` clause because there's nothing to match — that's the whole point.

---

## Step 6: Self joins — joining a table to itself (bonus, but common)

Sometimes the two "tables" you're comparing are actually the same table — e.g., finding employees and their managers, both stored in one `employees` table.

```sql
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  manager_id INT
);

INSERT INTO employees VALUES
  (1, 'Hina', NULL),
  (2, 'Bilal', 1),
  (3, 'Omar', 1),
  (4, 'Fatima', 2);

SELECT
  staff.name  AS employee,
  manager.name AS manager
FROM employees AS staff
LEFT JOIN employees AS manager
  ON staff.manager_id = manager.id;
```

### Result

```
+----------+---------+
| employee | manager |
+----------+---------+
| Hina     | NULL    |
| Bilal    | Hina    |
| Omar     | Hina    |
| Fatima   | Bilal   |
+----------+---------+
```

**Memory hook:** A self join is just a normal `LEFT JOIN`/`INNER JOIN` where both sides happen to be the same table — you just alias it twice (`staff`, `manager`) so MySQL can tell the two "copies" apart.

---

## The cheat sheet

| Join | Keeps | MySQL keyword | Analogy |
|---|---|---|---|
| INNER | Only matched rows | `INNER JOIN` | Guests both families know |
| LEFT | All of left + matches | `LEFT JOIN` | Bride's full list |
| RIGHT | All of right + matches | `RIGHT JOIN` | Groom's full list |
| FULL OUTER | Everything, both sides | `LEFT JOIN ... UNION ... RIGHT JOIN` (no native keyword) | Both families' full lists |
| CROSS | Every combination | `CROSS JOIN` | Every size × every color |
| SELF | Table joined to itself | any join type + two aliases | Employee ↔ manager |

## The one sentence that ties it all together

> **"FROM table A, JOIN table B, ON the condition that connects them."**

Read any join out loud in that order and it explains itself:
`FROM customers LEFT JOIN orders ON customers.id = orders.customer_id`
→ *"Starting from customers, keeping all of them, attach orders where the id matches."*

## The trick to never forget this

Picture two overlapping circles. Ask yourself which parts you want shaded:

- Only the overlap → `INNER`
- Left circle, overlap included → `LEFT`
- Right circle, overlap included → `RIGHT`
- Both circles, entirely → `FULL` (build with `UNION` in MySQL)
- No overlap needed, just every combination → `CROSS`
