// server.js

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // allow all origins, or set a specific one
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    // List of events
    socket.on("noteUpdated", ({ noteId }) => {
      socket.broadcast.emit("noteUpdated", { noteId });
    });

    socket.on("collaboratorAdded", ({ noteId, userId }) => {
      socket.broadcast.emit("collaboratorAdded", { noteId, userId });
    });

    socket.on("collaboratorRemoved", ({ noteId, userId }) => {
      socket.broadcast.emit("collaboratorRemoved", { noteId, userId });
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  server.listen(3001, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3001");
  });
});
