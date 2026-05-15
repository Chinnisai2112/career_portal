const fs = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");

dotenv.config();

const connectDB = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const uploadsDir = path.join(__dirname, "uploads");

connectDB();

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.send("Career portal API is working");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
