require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("FAIL: MONGO_URI is missing in .env (file empty or not saved?)");
    process.exit(1);
  }

  console.log("Checking MongoDB...");
  console.log("URI:", uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@"));

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    const dbName = mongoose.connection.db.databaseName;
    const users = await mongoose.connection.db.collection("users").countDocuments();
    const withHistory = await mongoose.connection.db
      .collection("users")
      .countDocuments({ "history.0": { $exists: true } });

    console.log("OK: Connected to database:", dbName);
    console.log("OK: Users registered:", users);
    console.log("OK: Users with AI history:", withHistory);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("FAIL:", err.message);
    if (err.message.includes("ECONNREFUSED")) {
      console.error("\nTip: MongoDB is not running on this PC.");
      console.error("  Option A: Install MongoDB Community Server, or");
      console.error("  Option B: Use free MongoDB Atlas — see SETUP.md");
    }
    process.exit(1);
  }
}

main();
