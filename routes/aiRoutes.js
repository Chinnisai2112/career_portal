const { analyzeResume } = require("../controllers/aiController");
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { askAI } = require("../controllers/aiController");
router.post("/resume", authMiddleware, analyzeResume);
router.get("/history", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ history: user.history });
});
// protected route
router.post("/ask", authMiddleware, askAI);

module.exports = router;