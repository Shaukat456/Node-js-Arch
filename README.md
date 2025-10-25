# Node.js Boilerplate

This repository now includes a minimal Node.js boilerplate.

Quick start

1. Run the app:

```bash
node Index.js
```

2. Start in watch mode (auto-restart on changes):

```bash
node --watch Index.js
```

Endpoints

- GET / -> Welcome text
- GET /health -> JSON health check

Files added

- `package.json` - project meta and scripts
- `.gitignore` - ignores node_modules and env files
- `src/server.js` - basic HTTP server entry
- `Index.js` - wired to start the server
