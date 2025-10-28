/*
  Minimal token signing/verification using HMAC-SHA256. This is a tiny JWT-like
  implementation for teaching. For production, use `jsonwebtoken` and proper
  token expiry, refresh tokens, and secure secret management.
*/
const crypto = require("crypto");

// Keep the secret within this example. In real apps store secrets in env/config.
const SECRET = process.env.AUTH_EXAMPLE_SECRET || "dev-secret-key-change-me";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function signToken(payload) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(
    JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
  );
  const toSign = `${header}.${body}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(toSign)
    .digest("base64");
  const signature = sig
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `${toSign}.${signature}`;
}

function verifyToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const toSign = `${header}.${body}`;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(toSign)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    if (signature !== expected) return null;
    const payloadJson = Buffer.from(body, "base64").toString("utf8");
    return JSON.parse(payloadJson);
  } catch (err) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
