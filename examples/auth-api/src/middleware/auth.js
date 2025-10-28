const { verifyToken } = require("../utils/jwt");

// Authenticate request by validating Authorization header and token.
// On success returns the token payload (user info). On failure writes response and returns null.
async function authenticate(req, res) {
  const auth =
    req.headers && (req.headers.authorization || req.headers.Authorization);
  if (!auth) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "missing Authorization header" }));
    return null;
  }

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "malformed Authorization header" }));
    return null;
  }

  const token = parts[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "invalid or expired token" }));
    return null;
  }

  // payload is small object: { sub, username, role, iat }
  return payload;
}

module.exports = { authenticate };
