const axios = require("axios");

/**
 * OpenAI-compatible chat (Groq, OpenRouter).
 */
async function openAiCompatibleChat({ baseUrl, apiKey, model, messages, extraHeaders = {} }) {
  if (!apiKey) {
    throw new Error("Missing API key for AI request");
  }
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const { data } = await axios.post(
    url,
    { model, messages, temperature: 0.6 },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...extraHeaders,
      },
      timeout: 120000,
    }
  );
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("AI returned an empty response");
  }
  return text;
}

function openAiMessagesToGeminiContents(messages) {
  const contents = [];
  for (const m of messages) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" ? "model" : "user";
    contents.push({ role, parts: [{ text: String(m.content ?? "") }] });
  }
  return contents;
}

function firstSystemPrompt(messages) {
  const sys = messages.find((m) => m.role === "system");
  return sys ? String(sys.content ?? "") : undefined;
}

/**
 * Google Gemini generateContent (free tier friendly).
 * @see https://ai.google.dev/gemini-api/docs
 */
async function geminiChat({ apiKey, model, messages }) {
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }
  const systemInstruction = firstSystemPrompt(messages);
  const nonSystem = messages.filter((m) => m.role !== "system");
  const contents = openAiMessagesToGeminiContents(nonSystem);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  const { data } = await axios.post(url, body, {
    params: { key: apiKey },
    headers: { "Content-Type": "application/json" },
    timeout: 120000,
  });
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p) => p.text || "").join("") : "";
  if (!text) {
    const block = data?.promptFeedback?.blockReason;
    throw new Error(block ? `Gemini blocked the prompt: ${block}` : "Gemini returned an empty response");
  }
  return text;
}

async function groqChat(messages, { apiKey, model }) {
  return openAiCompatibleChat({
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey,
    model,
    messages,
  });
}

async function openRouterChat(messages, { apiKey, model }) {
  return openAiCompatibleChat({
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey,
    model,
    messages,
    extraHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_APP_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_APP_NAME || "Career Portal",
    },
  });
}

function env(name, fallbacks = []) {
  const v = process.env[name];
  if (v && String(v).trim()) return String(v).trim();
  for (const f of fallbacks) {
    const x = process.env[f];
    if (x && String(x).trim()) return String(x).trim();
  }
  return "";
}

function resumeCheckerGroqKey() {
  return env("GROQ_API_KEY_RESUME_CHECKER", ["GROQ_API_KEY_RESUME", "GROQ_API_KEY"]);
}

function resumeBuilderGeminiKey() {
  return env("GEMINI_API_KEY_RESUME_BUILDER", ["GEMINI_API_KEY_RESUME", "GEMINI_API_KEY"]);
}

function performanceGroqKey() {
  return env("GROQ_API_KEY_PERFORMANCE", ["GROQ_API_KEY_RESUME", "GROQ_API_KEY"]);
}

function interviewGeminiKey() {
  return env("GEMINI_API_KEY_INTERVIEW", ["GEMINI_API_KEY"]);
}

function careerGeminiKey() {
  return env("GEMINI_API_KEY_CAREER", ["GEMINI_API_KEY"]);
}

function openRouterKey() {
  return env("OPENROUTER_API_KEY", []);
}

module.exports = {
  groqChat,
  geminiChat,
  openRouterChat,
  resumeCheckerGroqKey,
  resumeBuilderGeminiKey,
  performanceGroqKey,
  interviewGeminiKey,
  careerGeminiKey,
  openRouterKey,
  env,
};
