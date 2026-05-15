const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  tokenVersion: {
    type: Number,
    default: 0,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  history: [
    {
      question: String,
      answer: String,
      category: { type: String, default: "career" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true,
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function generateAuthToken() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      id: String(this._id),
      tv: this.tokenVersion || 0,
      isAdmin: !!this.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

module.exports = mongoose.model("User", userSchema);
