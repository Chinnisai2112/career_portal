const User = require("../models/User");
const { isAdminUser } = require("../lib/adminAccess");

/**
 * After authMiddleware. Ensures the caller is host (ADMIN_HOST_EMAIL) or has isAdmin on the user document.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("email isAdmin");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (!isAdminUser(user)) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = adminMiddleware;
