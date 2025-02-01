import { Server } from "socket.io"; // Import Socket.IO
import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect"; // Use next-connect to handle API requests

// Next.js doesn't have a custom server out of the box, so we use next-connect to handle WebSocket connections
const handler = nextConnect();

handler.use((req, res) => {
  res.socket.server.io = new Server(res.socket.server, {
    cors: {
      origin: "*", // Allow all origins (adjust in production)
      methods: ["GET", "POST"],
    },
  });

  // Handle WebSocket connections inside Next.js
  res.socket.server.io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Handle real-time updates, e.g., note editing, adding/removing collaborators
    socket.on("noteUpdated", ({ noteId, content }) => {
      socket.broadcast.emit("noteUpdated", { noteId, content });
    });

    socket.on("collaboratorAdded", ({ noteId, userId }) => {
      socket.broadcast.emit("collaboratorAdded", { noteId, userId });
    });

    socket.on("collaboratorRemoved", ({ noteId, userId }) => {
      socket.broadcast.emit("collaboratorRemoved", { noteId, userId });
    });

    socket.on("noteDeleted", ({ noteId }) => {
      socket.broadcast.emit("noteDeleted", { noteId });
    });

    // Handling disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  res.end();
});

export default handler;
