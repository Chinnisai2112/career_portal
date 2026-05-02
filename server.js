const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const app = express();
app.use(cors());
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");

const connectDB = require("./config/db");
connectDB();


app.use(express.json()); // VERY IMPORTANT
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);


app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

