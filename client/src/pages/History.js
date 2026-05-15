import { useEffect, useState } from "react";
import api, { getApiError } from "../lib/api";
import PageHeader from "../components/ui/PageHeader";
import AuthGate from "../components/ui/AuthGate";
import MarkdownView from "../components/ui/MarkdownView";
import { useAuth } from "../hooks/useAuth";

const categoryLabels = {
  career: "Career",
  "resume-ats": "ATS Check",
  "resume-build": "Resume Build",
  interview: "Interview",
  performance: "Performance",
};

export default function History() {
  const { signedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/ai/history");
      setHistory(res.data.history || []);
    } catch (err) {
      setError(getApiError(err, "Could not load history"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signedIn) load();
    else setLoading(false);
  }, [signedIn]);

  const categories = ["all", ...new Set(history.map((h) => h.category || "career"))];
  const filtered =
    filter === "all" ? history : history.filter((h) => (h.category || "career") === filter);

  return (
    <div className="space-y-8">
      <PageHeader
        pill="Your archive"
        title="History"
        lead="Resume checks, interviews, performance reviews, and career Q&A saved to your MongoDB account."
      />

      <AuthGate signedIn={signedIn}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition",
                  filter === cat
                    ? "bg-slate-950 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                {cat === "all" ? "All" : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
          <button type="button" className="cp-btn-secondary text-sm" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        {error && <div className="cp-alert-error">{error}</div>}
        {loading && <p className="text-sm text-slate-500">Loading history…</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="cp-card text-center text-slate-600">
            <p className="font-medium text-slate-800">No entries yet</p>
            <p className="mt-2 text-sm">Use any AI tool — results appear here automatically.</p>
          </div>
        )}

        <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-brand-200 before:via-slate-200 before:to-transparent sm:before:left-5">
          {filtered.map((item, index) => (
            <article key={index} className="relative pl-12 sm:pl-14">
              <span className="absolute left-2 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-[10px] font-bold text-white shadow-md sm:left-3 sm:top-4 sm:h-7 sm:w-7">
                {index + 1}
              </span>
              <div className="cp-card">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {categoryLabels[item.category] || item.category || "career"}
                </span>
                <p className="mt-3 font-display text-base font-semibold text-slate-900">{item.question}</p>
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <MarkdownView content={item.answer} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </AuthGate>
    </div>
  );
}
