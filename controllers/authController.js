const User = require("../models/User");
const { isHostAdminEmail, isAdminUser } = require("../lib/adminAccess");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    await User.create({
      name,
      email,
      password,
      isAdmin: isHostAdminEmail(email),
    });

    res.json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // check user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const admin = isAdminUser(user);
    user.isAdmin = admin;
    user.lastLoginAt = new Date();
    await user.save();
    const token = user.generateAuthToken();

    res.json({
      message: "Login successful",
      token,
      isAdmin: admin,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email isAdmin createdAt lastLoginAt");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      name: user.name,
      email: user.email,
      isAdmin: isAdminUser(user),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    res.json({ message: "Logged out" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = { register, login, getMe, logout };
