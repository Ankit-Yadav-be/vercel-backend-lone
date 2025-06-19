const User = require("../models/User");
const Match = require("../models/Match");
const calculateCompatibility = require("../utils/mathAlgorithm");

exports.generateDailyMatch = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user);
    if (!currentUser || currentUser.state !== "available") {
      return res.status(400).json({ message: "User is not in available state" });
    }

    const allUsers = await User.find({
      _id: { $ne: currentUser._id },
      state: "available",
    });

    let bestMatch = null;
    let bestScore = -1;

    for (let candidate of allUsers) {
      const score = calculateCompatibility(currentUser, candidate);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = candidate;
      }
    }

    if (!bestMatch || bestScore < 25) {
      return res.status(404).json({ message: "No compatible match found" });
    }

    const match = await Match.create({
      user1: currentUser._id,
      user2: bestMatch._id,
    });

   
    currentUser.state = "matched";
    currentUser.matchId = match._id;
    await currentUser.save();

    bestMatch.state = "matched";
    bestMatch.matchId = match._id;
    await bestMatch.save();

    const populatedMatch = await Match.findById(match._id)
      .populate("user1", "-password")
      .populate("user2", "-password");


    res.status(201).json({ message: "Match created", match: populatedMatch });
  } catch (error) {
    console.error("Match error:", error);
    res.status(500).json({ message: "Failed to match", error });
  }
};


exports.unpinMatch = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user;

    const user = await User.findById(userId).populate("matchId");
    const match = user.matchId;

    if (!match || !match.pinned) {
      return res.status(400).json({ message: "No pinned match to unpin" });
    }

    const otherUserId =
      match.user1.toString() === userId
        ? match.user2.toString()
        : match.user1.toString();

    const freezeEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); 
    const delayEnd = new Date(Date.now() + 2 * 60 * 60 * 1000); 

    await User.findByIdAndUpdate(userId, {
      state: "frozen",
      matchId: null
    });


    await User.findByIdAndUpdate(otherUserId, {
      state: "available",
      matchId: null,
      freezeUntil: delayEnd
    });

  
    await Match.findByIdAndUpdate(match._id, {
      pinned: false,
      unpinnedBy: userId,
      unpinReason: reason,
      freezeUntil: freezeEnd
    });

    res.status(200).json({ message: "Unpinned successfully, freeze started." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unpin failed", error });
  }
};

exports.getCurrentMatch = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("matchId");

    

    if (!user || !user.matchId) {
      return res.status(404).json({ message: "No active match found" });
    }

    const match = await Match.findById(user.matchId)
      .populate("user1", "-password")
      .populate("user2", "-password");


    res.status(200).json({ match });
  } catch (error) {
    console.error("getCurrentMatch error:", error);
    res.status(500).json({ message: "Failed to fetch match", error });
  }
};
