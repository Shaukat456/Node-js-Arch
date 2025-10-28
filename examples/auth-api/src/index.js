// Entry: start the HTTP server
const server = require("./server");

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Auth example server listening on http://localhost:${PORT}`);
});
