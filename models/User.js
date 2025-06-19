const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    gender: String,
    dob: Date,
    personalityType: String,
    values: [String],
    interests: [String],
    habits: {
      sleep: String,
      smoking: Boolean,
      drinking: Boolean,
    },
    state: {
      type: String,
      enum: ["available", "matched", "pinned", "frozen"],
      default: "available",
    },
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
