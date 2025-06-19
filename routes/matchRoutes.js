const express = require("express");
const router = express.Router();
const { generateDailyMatch, unpinMatch, getCurrentMatch } = require("../controllers/matchController");
const protect = require("../middleware/authMiddleware");

router.post("/daily", protect, generateDailyMatch);
router.post("/unpin", protect, unpinMatch);
router.get("/current/:userId", protect, getCurrentMatch);
module.exports = router;
