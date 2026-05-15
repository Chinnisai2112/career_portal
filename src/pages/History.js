import { useEffect, useState } from "react";
import api, { getApiError } from "../lib/api";

export default function History() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/ai/history");
        setHistory(res.data.history || []);
      } catch (err) {
        setError(getApiError(err, "Could not load history"));
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <span className="cp-pill">Your archive</span>
        <h1 className="cp-h1 mt-3">History</h1>
        <p className="cp-lead">Every career question you saved with the AI coach.</p>
      </header>

      {error && <div className="cp-alert-error">{error}</div>}

      {!error && history.length === 0 && (
        <div className="cp-card text-center text-slate-600">
          <p className="font-medium text-slate-800">No entries yet</p>
          <p className="mt-2 text-sm">Ask something in Career guidance — it will show up here.</p>
        </div>
      )}

      <div className="relative space-y-6 before:absolute before:left-4 before:top-2 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-brand-200 before:via-slate-200 before:to-transparent sm:before:left-5">
        {history.map((item, index) => (
          <article
            key={index}
            className="relative pl-12 sm:pl-14"
          >
            <span className="absolute left-2 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-500 text-[10px] font-bold text-white shadow-md sm:left-3 sm:top-4 sm:h-7 sm:w-7">
              {index + 1}
            </span>
            <div className="cp-card">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  {item.category || "career"}
                </span>
              </div>
              <p className="font-display text-base font-semibold text-slate-900">{item.question}</p>
              <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-700">
                {item.answer}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
