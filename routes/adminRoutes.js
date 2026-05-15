const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { listUsers, getUser, stats } = require("../controllers/adminController");

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/stats", stats);
router.get("/users", listUsers);
router.get("/users/:id", getUser);

module.exports = router;
