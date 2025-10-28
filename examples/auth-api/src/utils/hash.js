const crypto = require("crypto");

// Hash a password using PBKDF2. Returns { salt, hash }.
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 32, "sha256", (err, derivedKey) => {
      if (err) return reject(err);
      resolve({ salt, hash: derivedKey.toString("hex") });
    });
  });
}

// Verify a password using stored salt and hash
function verifyPassword(password, salt, expectedHash) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, "sha256", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey.toString("hex") === expectedHash);
    });
  });
}

module.exports = { hashPassword, verifyPassword };
