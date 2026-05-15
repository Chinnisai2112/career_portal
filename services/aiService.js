const { geminiChat, careerGeminiKey, env } = require("./aiClient");

async function generateCareerAdvice(input) {
  const apiKey = careerGeminiKey();
  if (!apiKey) {
    throw new Error("Set GEMINI_API_KEY_CAREER or GEMINI_API_KEY for career advice");
  }

  return geminiChat({
    apiKey,
    model: env("GEMINI_CAREER_MODEL", []) || "gemini-2.0-flash",
    messages: [
      {
        role: "system",
        content: "You are a practical career coach. Give clear, actionable guidance.",
      },
      {
        role: "user",
        content: input,
      },
    ],
  });
}

module.exports = { generateCareerAdvice };
