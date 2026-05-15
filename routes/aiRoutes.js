const express = require("express");
const path = require("path");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const {
  askAI,
  analyzeResume,
  buildResume,
  mockInterview,
  analyzePerformance,
  uploadDocument,
  getHistory,
  getAiConfig,
} = require("../controllers/aiController");

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, "../uploads"),
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.get("/config", getAiConfig);

router.post("/resume", authMiddleware, analyzeResume);
router.post("/resume/build", authMiddleware, buildResume);
router.post("/interview", authMiddleware, mockInterview);
router.post("/performance", authMiddleware, analyzePerformance);
router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);

router.post("/ask", authMiddleware, askAI);
router.post("/career", authMiddleware, askAI);

router.get("/history", authMiddleware, getHistory);

module.exports = router;
