const { createUser, findUserByUsername } = require("../models/userStore");
const { hashPassword, verifyPassword } = require("../utils/hash");
const { signToken } = require("../utils/jwt");

// Register a new user
async function registerHandler(req, res, body) {
  const { username, password, role } = body || {};
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ error: "username and password are required" })
    );
  }

  // Check if user exists
  const existing = findUserByUsername(username);
  if (existing) {
    res.writeHead(409, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "user already exists" }));
  }

  const { salt, hash } = await hashPassword(password);

  const user = createUser({
    username,
    passwordHash: hash,
    salt,
    role: role || "user",
  });

  res.writeHead(201, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({ id: user.id, username: user.username, role: user.role })
  );
}

// Login: verify credentials and return a signed token
async function loginHandler(req, res, body) {
  const { username, password } = body || {};
  if (!username || !password) {
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(
      JSON.stringify({ error: "username and password are required" })
    );
  }

  const user = findUserByUsername(username);
  if (!user) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid credentials" }));
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "invalid credentials" }));
  }

  // Minimal token payload — keep it small
  const payload = { sub: user.id, username: user.username, role: user.role };
  const token = signToken(payload);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ token }));
}

// Return profile info for authenticated user
async function profileHandler(req, res, user) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({ id: user.sub, username: user.username, role: user.role })
  );
}

// Example admin-only handler
async function adminHandler(req, res, user) {
  if (user.role !== "admin") {
    res.writeHead(403, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "forbidden: requires admin role" }));
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      message: "welcome, admin",
      user: { id: user.sub, username: user.username },
    })
  );
}

module.exports = {
  registerHandler,
  loginHandler,
  profileHandler,
  adminHandler,
};
