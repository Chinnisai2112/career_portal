import { useState } from "react";
import api, { getApiError } from "../lib/api";
import PageHeader from "../components/ui/PageHeader";
import AuthGate from "../components/ui/AuthGate";
import AiProviderBadge from "../components/ui/AiProviderBadge";
import LoadingDots from "../components/ui/LoadingDots";
import ResultPanel from "../components/ui/ResultPanel";
import { useAuth } from "../hooks/useAuth";
import { useAiConfig } from "../hooks/useAiConfig";

export default function Performance() {
  const { signedIn } = useAuth();
  const { config } = useAiConfig();
  const provider = config?.performance;

  const [form, setForm] = useState({
    goals: "",
    wins: "",
    blockers: "",
    timeframe: "Last 30 days",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const analyze = async () => {
    setError("");
    setResult("");
    setLoading(true);

    try {
      const res = await api.post("/ai/performance", form);
      setResult(res.data.result);
    } catch (err) {
      setError(getApiError(err, "Performance analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.goals.trim() || form.wins.trim() || form.blockers.trim();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        pill="Growth"
        title="Performance analysis"
        lead="OpenRouter free models first, then Gemini, then Groq — three fallbacks so you rarely hit quota limits."
      >
        {provider && (
          <div className="mt-4">
            <AiProviderBadge provider={provider} configured={provider.configured} />
          </div>
        )}
      </PageHeader>

      <AuthGate signedIn={signedIn}>
        <section className="cp-card-glow space-y-5">
          <div>
            <label className="cp-label" htmlFor="timeframe">
              Timeframe
            </label>
            <input
              id="timeframe"
              className="cp-input"
              value={form.timeframe}
              onChange={(e) => update("timeframe", e.target.value)}
              placeholder="e.g. Q2 2026"
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="goals">
              Goals & expectations
            </label>
            <textarea
              id="goals"
              rows={4}
              className="cp-textarea"
              value={form.goals}
              onChange={(e) => update("goals", e.target.value)}
              placeholder="What outcomes are you responsible for?"
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="wins">
              Wins & impact
            </label>
            <textarea
              id="wins"
              rows={4}
              className="cp-textarea"
              value={form.wins}
              onChange={(e) => update("wins", e.target.value)}
              placeholder="Shipped work, revenue, reliability, collaboration…"
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="blockers">
              Blockers & risks
            </label>
            <textarea
              id="blockers"
              rows={4}
              className="cp-textarea"
              value={form.blockers}
              onChange={(e) => update("blockers", e.target.value)}
              placeholder="Dependencies, unclear scope, tech debt…"
            />
          </div>

          {error && <div className="cp-alert-error">{error}</div>}
          {loading && <LoadingDots label="Building your plan" />}

          <button
            type="button"
            onClick={analyze}
            disabled={loading || !canSubmit}
            className="cp-btn-primary"
          >
            {loading ? "Analyzing…" : "Build growth plan"}
          </button>
        </section>

        <ResultPanel title="Your growth plan" content={result} onClear={() => setResult("")} />
      </AuthGate>
    </div>
  );
}
