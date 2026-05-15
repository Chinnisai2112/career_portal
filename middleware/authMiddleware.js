const jwt = require("jsonwebtoken");
const User = require("../models/User");

function extractBearerToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") return null;
  const token = headerValue.trim();
  if (token.toLowerCase().startsWith("bearer ")) {
    return token.slice(7).trim();
  }
  return token;
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("tokenVersion isAdmin");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const expectedTokenVersion = user.tokenVersion ?? 0;
    const tokenVersion = typeof decoded.tv === "number" ? decoded.tv : 0;
    if (tokenVersion !== expectedTokenVersion) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = {
      id: String(userId),
      tv: tokenVersion,
      isAdmin: !!user.isAdmin,
    };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authMiddleware;
