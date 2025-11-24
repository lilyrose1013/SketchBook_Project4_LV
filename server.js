import express from "express";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
const io = new Server(server);

// Serve static files from docs folder
app.use(express.static("docs"));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

const userSides = new Map();

io.on("connection", (socket) => {
  console.log("🟢 New user connected:", socket.id);
  
  // Assign side based on current number of connected users
  const currentUserCount = userSides.size;
  const side = currentUserCount % 2 === 0 ? "left" : "right";
  userSides.set(socket.id, side);
  
  // assigned side to user
  socket.emit("assignSide", side);
  console.log(`User ${socket.id} assigned to ${side} side`);

  socket.on("draw", (data) => {
    socket.broadcast.emit("draw", data);
  });

  socket.on("clear", (data) => {
    socket.broadcast.emit("clear", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    userSides.delete(socket.id);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
