import { useState } from "react";
import api, { getApiError } from "../lib/api";

export default function Performance() {
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
      <header>
        <span className="cp-pill">Growth</span>
        <h1 className="cp-h1 mt-3">Performance analysis</h1>
        <p className="cp-lead">Turn goals, wins, and blockers into a focused plan and measurable habits.</p>
      </header>

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

        <button type="button" onClick={analyze} disabled={loading || !canSubmit} className="cp-btn-primary">
          {loading ? "Analyzing…" : "Build growth plan"}
        </button>
      </section>

      {result && (
        <section className="cp-card border-indigo-200/50">
          <h2 className="font-display text-lg font-bold text-slate-900">Your plan</h2>
          <pre className="mt-4 max-h-[520px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50/90 p-4 text-sm leading-relaxed text-slate-800 cp-scroll">
            {result}
          </pre>
        </section>
      )}
    </div>
  );
}
