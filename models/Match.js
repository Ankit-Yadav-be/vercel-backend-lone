const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pinned: { type: Boolean, default: true },
  freezeUntil: Date,
  unpinnedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  unpinReason: String,
  messageCount: { type: Number, default: 0 }, 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Match", matchSchema);
