import { useState } from "react";
import api, { getApiError } from "../lib/api";

function AiPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    setAnswer("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/ai/career", { question });
      setAnswer(res.data.answer);
    } catch (err) {
      setError(getApiError(err, "Career guidance failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <span className="cp-pill">AI coach</span>
        <h1 className="cp-h1 mt-3">Career guidance</h1>
        <p className="cp-lead">Ask about offers, learning plans, switching lanes, or how to tell your story.</p>
      </header>

      <section className="cp-card-glow">
        <label className="cp-label" htmlFor="career-q">
          Your question
        </label>
        <textarea
          id="career-q"
          rows={5}
          className="cp-textarea"
          placeholder="What should I focus on next quarter to reach senior engineer?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {error && <div className="cp-alert-error mt-4">{error}</div>}

        <button
          type="button"
          className="cp-btn-primary mt-5 w-full sm:w-auto"
          onClick={askAI}
          disabled={loading || !question.trim()}
        >
          {loading ? "Thinking…" : "Get guidance"}
        </button>
      </section>

      {answer && (
        <section className="cp-card border-violet-200/50 bg-gradient-to-b from-white to-violet-50/30">
          <h2 className="font-display text-lg font-bold text-slate-900">Answer</h2>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700">{answer}</p>
        </section>
      )}
    </div>
  );
}

export default AiPage;
