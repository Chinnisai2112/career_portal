const mongoose = require("mongoose");
const User = require("../models/User");
const { isAdminUser } = require("../lib/adminAccess");

const MAX_HISTORY_PREVIEW = 120;

function truncate(str, n) {
  if (!str || typeof str !== "string") return "";
  if (str.length <= n) return str;
  return `${str.slice(0, n)}...`;
}

const listUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? {
          $or: [
            { email: { $regex: q, $options: "i" } },
            { name: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter)
      .select("name email createdAt isAdmin history")
      .sort({ createdAt: -1 })
      .lean();

    const rows = users.map((u) => {
      const history = Array.isArray(u.history) ? u.history : [];
      const last = history.length ? history[history.length - 1] : null;

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        isAdmin: isAdminUser(u),
        historyCount: history.length,
        lastActivity: last ? truncate(last.question || last.category || "AI activity", MAX_HISTORY_PREVIEW) : null,
      };
    });

    res.json({ users: rows });
  } catch (e) {
    console.error("admin listUsers", e);
    res.status(500).json({ message: e.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id)
      .select("name email createdAt isAdmin history")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const history = (user.history || []).map((h, i) => ({
      index: i + 1,
      category: h.category || "career",
      question: h.question,
      answerPreview: truncate(h.answer, MAX_HISTORY_PREVIEW),
      answerLength: (h.answer && String(h.answer).length) || 0,
    }));

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      isAdmin: isAdminUser(user),
      historyCount: history.length,
      history,
    });
  } catch (e) {
    console.error("admin getUser", e);
    res.status(500).json({ message: e.message });
  }
};

const stats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: weekAgo } });
    const usersWithCareerHistory = await User.countDocuments({ "history.0": { $exists: true } });
    const adminUsers = await User.countDocuments({ isAdmin: true });

    res.json({
      totalUsers,
      newUsersLast7Days,
      usersWithCareerHistory,
      adminUsers,
    });
  } catch (e) {
    console.error("admin stats", e);
    res.status(500).json({ message: e.message });
  }
};

module.exports = { listUsers, getUser, stats };
