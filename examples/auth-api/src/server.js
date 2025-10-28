/*
  Minimal HTTP server using Node core `http` module.
  Routes implemented manually for clarity (no Express) so the example runs without npm installs.

  Endpoints:
  - POST /register
  - POST /login
  - GET  /profile  (requires Authorization: Bearer <token>)
  - GET  /admin    (requires admin role)
*/

const http = require("http");
const { parse } = require("url");
const {
  registerHandler,
  loginHandler,
  profileHandler,
  adminHandler,
} = require("./controllers/authController");
const { authenticate } = require("./middleware/auth");

// Simple JSON body parser for POST requests
function jsonBodyParser(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const router = async (req, res) => {
  const { pathname } = parse(req.url || "", true);
  try {
    if (req.method === "POST" && pathname === "/register") {
      const body = await jsonBodyParser(req);
      return registerHandler(req, res, body);
    }

    if (req.method === "POST" && pathname === "/login") {
      const body = await jsonBodyParser(req);
      return loginHandler(req, res, body);
    }

    if (req.method === "GET" && pathname === "/profile") {
      // Authenticate first
      const user = await authenticate(req, res);
      if (!user) return; // authenticate already wrote response on failure
      return profileHandler(req, res, user);
    }

    if (req.method === "GET" && pathname === "/admin") {
      const user = await authenticate(req, res);
      if (!user) return;
      return adminHandler(req, res, user);
    }

    // Not found
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  } catch (err) {
    console.error("Server error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};

const server = http.createServer(router);

module.exports = server;
