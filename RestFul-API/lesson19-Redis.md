
# Redis — Chapter 1: Fundamentals

## Learning Objectives

By the end of this chapter, you should understand:

1. What Redis is.
2. Why Redis was developed.
3. What caching means.
4. RAM vs disk storage.
5. How Redis differs from MongoDB.
6. How key-value databases work.
7. How Redis improves API performance.
8. What cache hits and cache misses mean.
9. What the Cache-Aside Pattern is.
10. When Redis should and should not be used.

---

# 1. The Problem: Why Do We Need Redis?

Imagine we have developed a REST API using:

- Node.js
- Express.js
- MongoDB
- Mongoose

Our application has 100,000 registered users.

A client sends this request:

```http
GET /api/v1/users/123
```

Our Express controller executes:

```javascript
const user = await User.findById("123");
```

MongoDB searches for the user and returns the result.

Everything works correctly.

But imagine 10,000 clients request the same user's profile within a short period.

Our application might execute the same database query thousands of times.

### Without caching

```text
           10,000 Requests
                  |
                  |
                  v
             Express API
                  |
                  |
                  v
               MongoDB
                  |
          10,000 Similar Queries
```

We are repeatedly asking MongoDB for the same information.

Consider the following situation:

- User 123 has a profile.
- The profile changes only once per day.
- Thousands of users request that profile.
- Every request executes another database query.

Wouldn't it be better if we could temporarily store the result and reuse it?

Yes.

This is where caching becomes useful.

---

# 2. What Is Caching?

Caching means storing frequently accessed data temporarily so that future requests can retrieve it faster.

For example:

1. Client requests user 123.
2. Application checks the cache.
3. If the user exists in the cache, return the cached data.
4. Otherwise, retrieve the user from MongoDB.
5. Store the retrieved data in the cache.
6. Return the data to the client.

This approach avoids repeatedly querying MongoDB for the same information.

### With caching

```text
                 Client
                    |
                    v
                Express API
                    |
                    v
                Redis Cache
                    |
             +------+------+
             |             |
          Cache Hit     Cache Miss
             |             |
             v             v
        Return Data     MongoDB
                           |
                           v
                     Store in Redis
                           |
                           v
                      Return Data
```

The important idea:

**Check the cache first. Query the database only when the required data is not available in the cache.**

---

# 3. What Is Redis?

Redis is an in-memory data store.

Redis primarily keeps its working data in RAM (Random Access Memory).

It is commonly used for:

- Caching.
- Session storage.
- Rate limiting.
- Real-time counters.
- Queues.
- Pub/Sub messaging.
- Temporary data storage.
- Distributed coordination.

Redis is not simply a cache. It is a data structure server that supports multiple data types and operations.

## 3.1 What does in-memory mean?

To understand Redis, first understand how computers store information.

A computer has different types of storage.

Two important ones are:

1. RAM.
2. Disk storage, such as SSD or HDD.

### RAM — Random Access Memory

RAM is the computer's working memory.

When an application needs data quickly, RAM is commonly used.

Characteristics:

- Very fast access.
- Volatile storage.
- Data is normally lost when power is removed unless it has been persisted elsewhere.

### Disk Storage

Disk storage is used for long-term data storage.

Examples:

- SSD.
- HDD.

Characteristics:

- Persistent storage.
- Generally slower than RAM.
- Can store much larger amounts of data economically.

### Comparison

| Property | RAM | SSD |
|---|---|---|
| Speed | Very fast | Generally slower |
| Persistence | Volatile | Persistent |
| Cost per GB | Higher | Lower |
| Typical use | Working memory | Long-term storage |

Redis keeps its active dataset in memory, which is one reason it can serve many operations very quickly.

Important: Redis also supports persistence mechanisms. We'll study them in a later chapter.

---

# 4. Redis vs MongoDB

You might be thinking:

"We already have MongoDB. Why do we need another database?"

Good question.

MongoDB and Redis solve different problems and are often used together.

### MongoDB

MongoDB is a document-oriented database.

It stores documents in collections.

Example:

```json
{
  "_id": "123",
  "name": "Ali",
  "email": "ali@example.com",
  "role": "user",
  "age": 24
}
```

It is suitable for storing application data that needs to persist.

Examples:

- User accounts.
- Products.
- Orders.
- Posts.
- Comments.
- Transactions.

### Redis

Redis is an in-memory data structure store.

It commonly stores data as key-value entries.

Example:

```text
Key: user:123
Value: {"name":"Ali","email":"ali@example.com"}
```

It is particularly useful when we need fast access to frequently used data.

Examples:

- Cached user profiles.
- Login session information.
- Request counters.
- Temporary verification codes.
- Rate-limit counters.

### Comparison

| Feature | MongoDB | Redis |
|---|---|---|
| Primary storage model | Documents | Data structures |
| Main working storage | Disk-backed with memory caching | In-memory dataset |
| Persistence | Yes | Optional/configurable persistence |
| Complex document queries | Yes | Not its primary purpose |
| Caching | Possible | Common use case |
| Expiration | TTL indexes | Native key expiration |
| Relationships | References and embedding | Not relational |
| Typical use | Main application database | Cache and fast data operations |

### Can Redis replace MongoDB?

Not automatically.

Imagine our application has 100,000 users.

We need their information to remain available after:

- Application restarts.
- Server restarts.
- Cache expiration.
- Redis failures.

MongoDB is a suitable primary database for this application.

Redis can store temporary copies of frequently accessed information.

**MongoDB can remain our source of truth, while Redis acts as a fast-access layer.**

---

# 5. Understanding Key-Value Storage

One of the fundamental Redis concepts is key-value storage.

A key-value store associates a key with a value.

Think of a dictionary in Python or an object in JavaScript.

### JavaScript example

```javascript
const users = {
  "123": {
    name: "Ali",
    email: "ali@example.com"
  },

  "456": {
    name: "Ahmed",
    email: "ahmed@example.com"
  }
};
```

Here:

- `"123"` is a key.
- The user object is its value.

Redis follows a similar basic idea.

For example:

```text
Key: user:123
Value: {"name":"Ali","email":"ali@example.com"}
```

We can retrieve the value using the key.

Conceptually:

```text
GET user:123
```

Redis returns the associated value.

### Why use meaningful keys?

Instead of:

```text
123
456
789
```

We can use:

```text
user:123
user:456
user:789
```

For cached posts:

```text
post:101
post:102
```

For product information:

```text
product:500
product:501
```

For user sessions:

```text
session:abc123
```

A naming convention makes Redis keys easier to organize and maintain.

---

# 6. Cache Hit and Cache Miss

These two terms are essential.

## 6.1 Cache Hit

A cache hit occurs when the requested information already exists in Redis.

Example:

```text
Client requests user:123
          |
          v
     Check Redis
          |
          v
     user:123 exists
          |
          v
      Cache Hit
          |
          v
    Return cached data
```

No MongoDB query is necessary.

## 6.2 Cache Miss

A cache miss occurs when the requested information does not exist in Redis.

Example:

```text
Client requests user:123
          |
          v
     Check Redis
          |
          v
     user:123 missing
          |
          v
      Cache Miss
          |
          v
    Query MongoDB
          |
          v
    Receive user data
          |
          v
    Store in Redis
          |
          v
      Return data
```

The application retrieves the information from MongoDB and then caches it.

### Example

Suppose the first request takes 80 ms because MongoDB must be queried.

The next request may take significantly less time if the cached result is available.

These are illustrative timings, not guaranteed Redis or MongoDB performance numbers. Actual performance depends on network latency, server configuration, query complexity, and workload.

---

# 7. Cache-Aside Pattern

Now let's understand the actual caching strategy we will use in our Express application.

It is called **Cache-Aside**.

It is also known as Lazy Loading.

The application itself manages the cache.

### Step-by-step process

Suppose the client requests:

```http
GET /api/v1/users/123
```

**Step 1: Check Redis**

```javascript
const cachedUser = await redis.get("user:123");
```

**Step 2: Check whether cached data exists**

```javascript
if (cachedUser) {
  return JSON.parse(cachedUser);
}
```

**Step 3: If not found, query MongoDB**

```javascript
const user = await User.findById("123");
```

**Step 4: Store the result in Redis**

```javascript
await redis.set(
  "user:123",
  JSON.stringify(user)
);
```

**Step 5: Return the result**

```javascript
return user;
```

### Complete conceptual code

```javascript
async function getUser(userId) {
  const cacheKey = `user:${userId}`;

  // 1. Check Redis
  const cachedUser = await redis.get(cacheKey);

  // 2. Cache hit
  if (cachedUser) {
    return JSON.parse(cachedUser);
  }

  // 3. Cache miss: query MongoDB
  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  // 4. Store result in Redis
  await redis.set(
    cacheKey,
    JSON.stringify(user)
  );

  // 5. Return database result
  return user;
}
```

This is conceptual code. We'll build the actual Redis connection and Express integration in upcoming chapters.

---

# 8. What Happens When Data Changes?

There is an important problem with caching.

Imagine:

1. User 123 has the name "Ali".
2. Redis stores the cached profile.
3. The user changes their name to "Ahmed".
4. MongoDB now contains "Ahmed".
5. Redis still contains "Ali".

Now our API might return outdated information.

This problem is called **Cache Invalidation** or cache consistency.

### Example

Before update:

```text
MongoDB:
user:123 -> Ali

Redis:
user:123 -> Ali
```

After updating MongoDB:

```text
MongoDB:
user:123 -> Ahmed

Redis:
user:123 -> Ali
```

The two stores disagree.

A common solution is to invalidate the cached entry after a successful database update.

```javascript
await User.findByIdAndUpdate(
  userId,
  { name: "Ahmed" },
  { new: true }
);

await redis.del(`user:${userId}`);
```

Now the next request will miss the cache, retrieve the updated user from MongoDB, and populate Redis again.

This is called **cache invalidation**.

We'll study cache invalidation strategies in detail later.

---

# 9. What Is TTL?

TTL stands for Time To Live.

It determines how long a Redis key should exist.

For example:

```text
user:123
TTL = 300 seconds
```

This means the key will expire after five minutes.

Why is this useful?

Suppose we cache a user's profile.

We don't necessarily want the cached data to remain forever.

We can give it an expiration time.

Conceptually:

```text
SET user:123 "Ali"
EXPIRE user:123 300
```

Redis automatically expires the key after the specified duration.

We can also set a value and its expiration together:

```text
SET user:123 "Ali" EX 300
```

Here:

- `SET` stores the value.
- `EX` specifies expiration in seconds.
- `300` means five minutes.

TTL is particularly useful for:

- Cached API responses.
- Temporary verification codes.
- Login-related temporary data.
- Rate-limit counters.
- Short-lived sessions.

Important: TTL does not replace proper invalidation. If data changes, you may need to invalidate it immediately rather than waiting for expiration.

---

# 10. Where Can We Use Redis in Our REST API?

Let's connect the concepts to our existing Secure API Platform.

## Use Case 1: Cache User Profiles

Endpoint:

```http
GET /api/v1/users/123
```

Instead of querying MongoDB on every request, retrieve the profile from Redis when available.

## Use Case 2: Rate Limiting

Suppose we allow a user to make 100 requests per minute.

We can maintain a counter in Redis.

Conceptually:

```text
rate-limit:user:123 = 45
```

After each request, increase the counter.

When the counter reaches the limit, reject further requests during the active window.

## Use Case 3: Session Storage

Redis can store session information.

For example:

```text
session:abc123
```

This is useful when multiple Node.js servers need access to the same session data.

## Use Case 4: Temporary Password Reset Data

We can temporarily store password-reset-related information with expiration.

However, sensitive reset tokens must be handled carefully, and should not be stored in plaintext unnecessarily.

## Use Case 5: Background Jobs

Suppose a user uploads an image.

We may need to:

1. Process the image.
2. Generate thumbnails.
3. Send a notification.
4. Update file metadata.

Instead of doing everything inside the HTTP request, we can enqueue background jobs.

Redis is commonly used as the backing store for job queues such as BullMQ.

## Use Case 6: Real-Time Counters

Suppose we want to track how many times a post has been viewed.

Redis supports atomic counter operations, which are useful for this type of workload.

---

# 11. Important: Redis Is Not Always Necessary

Do not use Redis simply because it is popular.

For example, if our application has:

- 100 users.
- A few API requests per minute.
- Simple database queries.
- No major performance problems.

MongoDB alone may be sufficient.

Adding Redis introduces:

- Another service to operate.
- Another network connection.
- Cache invalidation problems.
- Additional failure scenarios.
- More infrastructure costs.

Use Redis when it solves a real problem.

Examples include:

- Repeated expensive queries.
- High request volume.
- Distributed rate limiting.
- Shared session storage.
- Background job processing.

---

# 12. Summary

Let's revise the essential concepts.

| Concept | Meaning |
|---|---|
| Redis | In-memory data structure store |
| Cache | Temporary storage of frequently accessed data |
| Cache hit | Requested data exists in cache |
| Cache miss | Requested data does not exist in cache |
| Key-value | Data stored using a key and associated value |
| Cache-Aside | Application checks cache before database |
| Cache invalidation | Removing or updating outdated cached data |
| TTL | Time until a key expires |
| Persistence | Mechanisms for saving Redis data beyond memory |

### Remember this architecture

```text
             CLIENT
                |
                v
            EXPRESS API
                |
                v
             REDIS
                |
          +-----+-----+
          |           |
       HIT           MISS
          |           |
          v           v
       RETURN      MONGODB
                      |
                      v
                 STORE IN REDIS
                      |
                      v
                    RETURN
```

---

# 13. Exercises

Try answering these questions without looking at the notes.

### Conceptual Questions

1. What is Redis?
2. What does in-memory mean?
3. What is the difference between RAM and SSD?
4. Why might we use Redis alongside MongoDB?
5. What is a key-value store?
6. What is a cache hit?
7. What is a cache miss?
8. Explain the Cache-Aside Pattern.
9. What problem does cache invalidation solve?
10. What is TTL?
11. Why shouldn't we cache every database query?
12. Give three practical Redis use cases in a REST API.

### Scenario-Based Questions

**Scenario 1**

A user requests the same product information 5,000 times.

The product rarely changes.

How can Redis help?

**Scenario 2**

A user changes their profile name, but the API continues returning the old name.

What is the likely problem?

**Scenario 3**

A password reset code should expire after five minutes.

Which Redis feature can help?

**Scenario 4**

Your API runs on three separate Node.js servers. You want all servers to enforce the same rate limit for a user.

Why is a shared Redis instance useful?

---

# Next Chapter

## Chapter 2 — Redis Data Types

We'll study the data structures Redis provides:

1. Strings.
2. Lists.
3. Sets.
4. Hashes.
5. Sorted Sets.

We'll understand each structure, its commands, examples, and practical backend use cases before connecting Redis to Node.js.
