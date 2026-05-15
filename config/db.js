const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Set MONGO_URI or MONGODB_URI in .env");
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
