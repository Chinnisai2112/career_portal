import { useState } from "react";
import axios from "axios";

function Resume() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const analyze = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/ai/resume",
        { resumeText: text },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResult(res.data.result);
    } catch (err) {
      console.log(err);
      alert("Error analyzing resume");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Resume Analyzer</h1>

      <textarea
        rows="10"
        className="w-full border p-3 rounded-lg"
        placeholder="Paste your resume here..."
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={analyze}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        Analyze Resume
      </button>

      {result && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Analysis Result:</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default Resume;