import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Use the port Render provides, or default to 3000 for local dev
const PORT = process.env.PORT || 3000;

// Serve static files from docs folder
app.use(express.static("docs"));

let userCount = 0;
const userSides = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);
  
  // Assign side to user (left or right)
  userCount++;
  const side = userCount % 2 === 1 ? "left" : "right";
  userSides.set(socket.id, side);
  
  // Send the user their assigned side
  socket.emit("assignSide", side);
  console.log(`User ${socket.id} assigned to ${side} side`);

  socket.on("draw", (data) => {
    // rebroadcast to everyone except the sender
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", () => {
    socket.broadcast.emit("clear");
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    userSides.delete(socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
