const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const User = require("../models/User");
const {
  groqChat,
  geminiChat,
  openRouterChat,
  resumeGroqKey,
  performanceGroqKey,
  interviewGeminiKey,
  careerGeminiKey,
  openRouterKey,
  env,
} = require("../services/aiClient");

const RESUME_MODEL = () => env("GROQ_RESUME_MODEL", []) || "llama-3.1-8b-instant";
const PERFORMANCE_OPENROUTER_MODEL =
  () => env("OPENROUTER_PERFORMANCE_MODEL", []) || "google/gemma-2-9b-it:free";
const PERFORMANCE_GROQ_MODEL =
  () => env("GROQ_PERFORMANCE_MODEL", []) || "llama-3.1-8b-instant";
const INTERVIEW_GEMINI_MODEL = () => env("GEMINI_INTERVIEW_MODEL", []) || "gemini-2.0-flash";
const CAREER_GEMINI_MODEL = () => env("GEMINI_CAREER_MODEL", []) || "gemini-2.0-flash";

async function runPerformanceAi(messages) {
  const orKey = openRouterKey();
  if (orKey) {
    return openRouterChat(messages, {
      apiKey: orKey,
      model: PERFORMANCE_OPENROUTER_MODEL(),
    });
  }
  const gKey = performanceGroqKey();
  return groqChat(messages, { apiKey: gKey, model: PERFORMANCE_GROQ_MODEL() });
}

const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("history");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ history: user.history || [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ message: "Question is required" });
    }

    const key = careerGeminiKey();
    if (!key) {
      return res.status(503).json({
        message:
          "Career guidance needs a Gemini API key. Set GEMINI_API_KEY_CAREER or GEMINI_API_KEY in your .env (Google AI Studio free tier).",
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a practical career coach. Give structured, actionable advice. Use short sections and bullet points where helpful. Do not fabricate credentials or job offers.",
      },
      { role: "user", content: question },
    ];

    const answer = await geminiChat({
      apiKey: key,
      model: CAREER_GEMINI_MODEL(),
      messages,
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { history: { question, answer, category: "career" } },
    });

    res.json({ answer });
  } catch (error) {
    console.error("Career AI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Career guidance failed",
    });
  }
};

const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText || typeof resumeText !== "string") {
      return res.status(400).json({ message: "resumeText is required" });
    }

    const key = resumeGroqKey();
    if (!key) {
      return res.status(503).json({
        message:
          "Resume ATS needs a Groq API key. Set GROQ_API_KEY_RESUME or GROQ_API_KEY (Groq free tier).",
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are an expert ATS (applicant tracking system) resume reviewer. Be honest and specific. Output markdown with these sections: ## ATS score (0-100), ## Strengths, ## Gaps / risks, ## Keyword suggestions, ## Rewrites (2-4 bullet improvements).",
      },
      {
        role: "user",
        content: `Analyze this resume for ATS compatibility and overall impact:\n\n${resumeText}`,
      },
    ];

    const result = await groqChat(messages, { apiKey: key, model: RESUME_MODEL() });
    res.json({ result });
  } catch (error) {
    console.error("Resume ATS ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Resume analysis failed",
    });
  }
};

const buildResume = async (req, res) => {
  try {
    const { profile, jobDescription, tone } = req.body;
    if (!profile || typeof profile !== "string") {
      return res.status(400).json({ message: "profile is required (experience, skills, education as text)" });
    }

    const key = resumeGroqKey();
    if (!key) {
      return res.status(503).json({
        message: "Resume builder uses the same Groq keys as ATS. Set GROQ_API_KEY_RESUME or GROQ_API_KEY.",
      });
    }

    const jd =
      jobDescription && String(jobDescription).trim()
        ? `\nTarget job description:\n${jobDescription}\n`
        : "";

    const messages = [
      {
        role: "system",
        content:
          "You are a resume writer optimized for ATS and human recruiters. Produce a complete resume in markdown with: # Name (placeholder if unknown), ## Summary, ## Skills, ## Experience (bullets with metrics when possible), ## Education, ## Optional certifications. Keep it truthful—only elaborate professionally from the facts given.",
      },
      {
        role: "user",
        content: `Tone: ${tone || "professional and concise"}.\nCandidate profile / notes:\n${profile}${jd}`,
      },
    ];

    const result = await groqChat(messages, { apiKey: key, model: RESUME_MODEL() });
    res.json({ result });
  } catch (error) {
    console.error("Resume build ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Resume build failed",
    });
  }
};

const mockInterview = async (req, res) => {
  try {
    const { messages, jobRole } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "messages[] is required with {role, content}" });
    }

    const key = interviewGeminiKey();
    if (!key) {
      return res.status(503).json({
        message:
          "Mock interview uses Gemini. Set GEMINI_API_KEY_INTERVIEW or GEMINI_API_KEY (Google AI Studio free tier).",
      });
    }

    const system = {
      role: "system",
      content: `You are an interviewer${jobRole ? ` for the role: ${jobRole}` : ""}.
Ask one question at a time, then wait for the candidate's answer (the user message).
Be concise. After an answer, give brief feedback (2-4 bullets) and ask the next question.
If the candidate says "end", wrap up with strengths, improvements, and a sample strong answer for the last question.`,
    };

    const normalized = [system, ...messages.map((m) => ({ role: m.role, content: String(m.content ?? "") }))];

    const reply = await geminiChat({
      apiKey: key,
      model: INTERVIEW_GEMINI_MODEL(),
      messages: normalized,
    });

    res.json({ reply });
  } catch (error) {
    console.error("Interview AI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Mock interview failed",
    });
  }
};

const analyzePerformance = async (req, res) => {
  try {
    const { goals, wins, blockers, timeframe } = req.body;
    const blob = [goals, wins, blockers, timeframe].filter(Boolean).join("\n");
    if (!blob.trim()) {
      return res.status(400).json({ message: "Provide goals, wins, and/or blockers as text fields" });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a performance coach for individual contributors. Output markdown: ## Summary, ## What went well, ## Growth areas, ## 30-day plan (3-5 actions), ## Metrics to track. Be direct and kind.",
      },
      {
        role: "user",
        content: `Review this performance snapshot and coach me:\n\n${blob}`,
      },
    ];

    const result = await runPerformanceAi(messages);
    res.json({ result });
  } catch (error) {
    console.error("Performance AI ERROR:", error.response?.data || error.message);
    res.status(500).json({
      message: error.response?.data?.error?.message || error.message || "Performance analysis failed",
    });
  }
};

const uploadDocument = async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "file field is required (multipart/form-data)" });
    }

    filePath = req.file.path;
    const original = req.file.originalname || "";
    const mime = req.file.mimetype || "";

    let text = "";
    if (mime === "text/plain" || original.toLowerCase().endsWith(".txt")) {
      text = await fs.readFile(filePath, "utf8");
    } else if (mime === "application/pdf" || original.toLowerCase().endsWith(".pdf")) {
      const buf = await fs.readFile(filePath);
      const parsed = await pdfParse(buf);
      text = parsed.text || "";
    } else {
      await fs.unlink(filePath).catch(() => {});
      return res.status(400).json({ message: "Only .txt and .pdf files are supported" });
    }

    await fs.unlink(filePath).catch(() => {});

    const trimmed = text.replace(/\u0000/g, "").trim();
    if (!trimmed) {
      return res.status(422).json({ message: "Could not extract text from the file" });
    }

    res.json({ text: trimmed, name: original });
  } catch (e) {
    if (filePath) await fs.unlink(filePath).catch(() => {});
    console.error("Upload ERROR:", e);
    res.status(500).json({ message: e.message || "Upload failed" });
  }
};

module.exports = {
  askAI,
  analyzeResume,
  buildResume,
  mockInterview,
  analyzePerformance,
  uploadDocument,
  getHistory,
};
