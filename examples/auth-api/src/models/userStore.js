/*
  In-memory user store for example purposes.
  Replace with a real DB in production.
*/
const crypto = require("crypto");

const users = new Map();
let idCounter = 1;

function createUser({ username, passwordHash, salt, role = "user" }) {
  const id = String(idCounter++);
  const user = { id, username, passwordHash, salt, role };
  users.set(id, user);
  return user;
}

function findUserByUsername(username) {
  for (const user of users.values()) {
    if (user.username === username) return user;
  }
  return null;
}

function findUserById(id) {
  return users.get(id) || null;
}

// Seed an admin user for convenience (username: admin password: admin123)
(function seedAdmin() {
  const username = "admin";
  if (!findUserByUsername(username)) {
    // derive a trivial hash with pbkdf2 (not using utils here to avoid circular require)
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync("admin123", salt, 100000, 32, "sha256")
      .toString("hex");
    createUser({ username, passwordHash: hash, salt, role: "admin" });
    console.log("Seeded admin user: username=admin password=admin123");
  }
})();

module.exports = { createUser, findUserByUsername, findUserById };
