# Auth API Example — Node core (no external deps)

This is a minimal authentication & authorization example implemented using Node's core modules only. It demonstrates:

- User registration with password hashing (PBKDF2)
- Login that returns an HMAC-signed token (simple JWT-like token)
- Middleware to protect routes and perform role-based authorization

Why no external deps? This keeps the example self-contained so you can run it quickly with:

```cmd
cd examples\auth-api
node src\index.js
```

Endpoints

- POST /register — body: { "username", "password", "role" } (role optional, default: "user")
- POST /login — body: { "username", "password" } — returns { token }
- GET /profile — protected; returns the current user's info
- GET /admin — protected; only role "admin" can access

Notes

- This is a teaching example. For production use prefer battle-tested libraries (express, jsonwebtoken, bcrypt, helmet) and persistent storage.
