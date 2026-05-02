import React, { useState } from "react";
import axios from "axios";

function AiPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askAI = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ai/ask",
        { question },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      setAnswer(res.data.answer);
    } catch (error) {
      console.log(error);
      alert("Error getting AI response ❌");
    }
  };

 return (
  <div>
    <h2 className="text-2xl font-bold mb-4 text-gray-700">
      AI Career Assistant
    </h2>

    <input
      className="border p-3 w-full mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
      placeholder="Ask your career question..."
      onChange={(e) => setQuestion(e.target.value)}
    />

    <button
      className="bg-purple-500 text-white w-full py-3 rounded-lg hover:bg-purple-600 transition"
      onClick={askAI}
    >
      Ask AI
    </button>

    <div className="mt-5 p-4 bg-gray-100 rounded-lg shadow-inner">
      <b className="text-gray-700">Answer:</b>
      <p className="mt-2 text-gray-600">{answer}</p>
    </div>
  </div>
);
}

export default AiPage;