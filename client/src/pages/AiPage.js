import { useState } from "react";
import api, { getApiError } from "../lib/api";
import PageHeader from "../components/ui/PageHeader";
import AuthGate from "../components/ui/AuthGate";
import AiProviderBadge from "../components/ui/AiProviderBadge";
import LoadingDots from "../components/ui/LoadingDots";
import ResultPanel from "../components/ui/ResultPanel";
import { useAuth } from "../hooks/useAuth";
import { useAiConfig } from "../hooks/useAiConfig";

const prompts = [
  "Build a 90-day roadmap to become a full stack developer.",
  "Which projects should I add for an entry-level software role?",
  "How do I negotiate my first job offer without burning bridges?",
  "What skills matter most for a data analyst role in 2026?",
];

function AiPage() {
  const { signedIn } = useAuth();
  const { config } = useAiConfig();
  const provider = config?.career;

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
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        pill="AI coach"
        title="Career guidance"
        lead="Roadmaps, role clarity, learning plans, and job-search strategy — powered by Google Gemini (separate free API key)."
      >
        {provider && (
          <div className="mt-4">
            <AiProviderBadge provider={provider} configured={provider.configured} />
          </div>
        )}
      </PageHeader>

      <AuthGate signedIn={signedIn}>
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="cp-card-glow">
            <label className="cp-label" htmlFor="career-q">
              Your question
            </label>
            <textarea
              id="career-q"
              rows={6}
              className="cp-textarea min-h-[160px]"
              placeholder="What should I focus on next quarter to reach senior engineer?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            {error && <div className="cp-alert-error mt-4">{error}</div>}
            {loading && (
              <div className="mt-4">
                <LoadingDots label="Gemini is thinking" />
              </div>
            )}

            <button
              type="button"
              className="cp-btn-primary mt-5 w-full sm:w-auto"
              onClick={askAI}
              disabled={loading || !question.trim()}
            >
              {loading ? "Thinking…" : "Get guidance"}
            </button>
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Quick prompts</p>
            <div className="mt-3 space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-600 transition hover:border-brand-300 hover:text-slate-900"
                  onClick={() => setQuestion(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </aside>
        </div>

        <ResultPanel title="Career answer" content={answer} onClear={() => setAnswer("")} />
      </AuthGate>
    </div>
  );
}

export default AiPage;
