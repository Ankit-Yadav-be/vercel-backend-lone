// backend/routes/messageRoutes.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const protect = require("../middleware/authMiddleware");

router.get("/:matchId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ matchId: req.params.matchId })
      .sort({ timestamp: 1 })
      .populate("sender", "name");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

module.exports = router;
