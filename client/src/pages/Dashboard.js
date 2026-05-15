import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import FeatureCard from "../components/FeatureCard";
import { useAuth } from "../hooks/useAuth";
import { useAiConfig } from "../hooks/useAiConfig";
import AiProviderBadge from "../components/ui/AiProviderBadge";

const features = [
  {
    to: "/resume",
    icon: "📄",
    title: "Resume Lab",
    description: "ATS scoring with Groq, AI resume drafts with Gemini, and PDF/TXT upload.",
    accent: "violet",
    providerKey: "resumeChecker",
  },
  {
    to: "/interview",
    icon: "🎤",
    title: "Mock Interview",
    description: "Role-based practice with feedback after every answer.",
    accent: "cyan",
    providerKey: "interview",
  },
  {
    to: "/performance",
    icon: "📈",
    title: "Performance Analysis",
    description: "Turn goals, wins, and blockers into a 30-day growth plan.",
    accent: "emerald",
    providerKey: "performance",
  },
  {
    to: "/ai",
    icon: "🧭",
    title: "Career Guidance",
    description: "Roadmaps, job search strategy, skill plans, and interview prep.",
    accent: "rose",
    providerKey: "career",
  },
  {
    to: "/documents",
    icon: "📎",
    title: "Documents",
    description: "Upload PDF or TXT — extract text and send it to the resume workflow.",
    accent: "amber",
    providerKey: null,
  },
  {
    to: "/history",
    icon: "🗂️",
    title: "History",
    description: "Every AI session saved to your account when signed in.",
    accent: "slate",
    providerKey: null,
  },
];

function Dashboard() {
  const { signedIn } = useAuth();
  const { config, loading: configLoading } = useAiConfig();
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!signedIn) {
      setHistory([]);
      return;
    }
    setHistoryLoading(true);
    api
      .get("/ai/history")
      .then((res) => setHistory((res.data.history || []).slice(0, 4)))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [signedIn]);

  const configuredCount = config
    ? Object.values(config).filter((p) => p?.configured).length
    : 0;
  const totalProviders = config ? Object.keys(config).length : 5;

  return (
    <div className="space-y-10">
      <section className="cp-hero">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10 p-8 sm:p-10 lg:p-12">
            <p className="cp-pill">Career development portal</p>
            <h1 className="cp-h1 mt-5 max-w-2xl">
              Grow faster with AI tools built for your job search.
            </h1>
            <p className="cp-lead">
              Each feature uses its own free-tier API key so you get more daily quota — Groq for ATS checks,
              Gemini for coaching and interviews, OpenRouter or Gemini for performance reviews.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/resume" className="cp-btn-primary">
                Start with resume
              </Link>
              <Link to="/interview" className="cp-btn-secondary">
                Practice interview
              </Link>
              {!signedIn && (
                <Link to="/login" className="cp-btn-ghost">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="relative border-t border-slate-200 bg-slate-950 p-8 text-white lg:border-l lg:border-t-0 lg:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Live status</p>
            <ul className="mt-6 space-y-3">
              <StatusLine label="AI providers ready" value={`${configuredCount}/${totalProviders}`} ok={configuredCount > 0} />
              <StatusLine label="Session" value={signedIn ? "Signed in" : "Guest"} ok={signedIn} />
              <StatusLine label="Backend" value="Express + MongoDB" ok />
              <StatusLine label="Config" value={configLoading ? "Checking…" : "Loaded"} ok={!configLoading} />
            </ul>
            {config && (
              <div className="mt-6 flex flex-wrap gap-2">
                {Object.entries(config).map(([key, provider]) => (
                  <AiProviderBadge key={key} provider={provider} configured={provider.configured} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="cp-h2">Your toolkit</h2>
            <p className="mt-1 text-slate-600">Pick a module — each page is focused on one workflow.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.to}
              {...feature}
              provider={feature.providerKey && config ? config[feature.providerKey] : null}
            />
          ))}
        </div>
      </section>

      {signedIn && (
        <section className="cp-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="cp-h2">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-600">Latest saved AI responses from your account.</p>
            </div>
            <Link to="/history" className="cp-btn-secondary text-sm">
              View all history
            </Link>
          </div>

          {historyLoading && <p className="mt-6 text-sm text-slate-500">Loading history…</p>}

          {!historyLoading && history.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No saved sessions yet. Try career guidance or resume ATS check.
            </p>
          )}

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {history.map((item, index) => (
              <article key={index} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
                  {item.category || "career"}
                </span>
                <p className="mt-2 font-semibold text-slate-900 line-clamp-2">{item.question}</p>
                <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {!signedIn && (
        <section className="cp-card-glow flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900">Save your progress</h3>
            <p className="mt-1 text-sm text-slate-600">
              Register to store AI history, run all tools, and access the admin monitor if you are the host.
            </p>
          </div>
          <Link to="/login" className="cp-btn-primary shrink-0">
            Create free account
          </Link>
        </section>
      )}
    </div>
  );
}

function StatusLine({ label, value, ok }) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-amber-400"}`} />
        {value}
      </span>
    </li>
  );
}

export default Dashboard;
