// backend/server.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const matchRoutes = require("./routes/matchRoutes");
const messageRoutes = require("./routes/messageRoutes"); // ✅ new
const Message = require("./models/Message");
const Match = require("./models/Match");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/message", messageRoutes); // ✅ added

app.get("/", (req, res) => {
  res.send("📡 Lone Town API running...");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://vercel-frontend-lonetown.vercel.app", // Replace with your frontend domain in production
    methods: ["GET", "POST"],
  },
});

// Socket.IO Events
io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Join chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`👥 Client ${socket.id} joined room ${roomId}`);
  });

  // Handle new message
  socket.on("sendMessage", async ({ roomId, sender, content }) => {
    try {
      const message = await Message.create({
        matchId: roomId,
        sender,
        content,
      });

      // Increment messageCount in Match
      await Match.findByIdAndUpdate(roomId, {
        $inc: { messageCount: 1 },
      });

      // Emit message to room
      io.to(roomId).emit("receiveMessage", {
        ...message.toObject(),
        sender: { _id: sender }, // minimal sender info
      });
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
