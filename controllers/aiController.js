const axios = require("axios");
const User = require("../models/User");

const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ message: "Question is required" });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "user", content: question }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const answer = response.data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(502).json({ message: "AI provider returned an unexpected response" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $push: { history: { question, answer } },
    });

    res.json({ answer });

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",   // updated working model
        messages: [
          {
            role: "system",
            content: "You are an ATS resume analyzer."
          },
          {
            role: "user",
            content: `Analyze this resume and give:
            1. ATS score out of 100
            2. Strengths
            3. Weaknesses
            4. Suggestions

            Resume:
            ${resumeText}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({ result });

  } catch (error) {
    console.log("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Resume analysis failed" });
  }
};



module.exports = { askAI, analyzeResume };
