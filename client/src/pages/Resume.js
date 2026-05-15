import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { getApiError } from "../lib/api";
import PageHeader from "../components/ui/PageHeader";
import AuthGate from "../components/ui/AuthGate";
import AiProviderBadge from "../components/ui/AiProviderBadge";
import LoadingDots from "../components/ui/LoadingDots";
import ResultPanel from "../components/ui/ResultPanel";
import { useAuth } from "../hooks/useAuth";
import { useAiConfig } from "../hooks/useAiConfig";

function Resume() {
  const location = useLocation();
  const { signedIn } = useAuth();
  const { config } = useAiConfig();
  const atsProvider = config?.resumeChecker;
  const builderProvider = config?.resumeBuilder;

  const [mode, setMode] = useState("check");
  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("professional and concise");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.resumeText) {
      setResumeText(location.state.resumeText);
      setProfile((p) => p || location.state.resumeText);
    }
  }, [location.state]);

  const runAction = async (action) => {
    setError("");
    setResult("");
    setLoading(action);
    setMode(action === "check" ? "check" : "build");

    try {
      if (action === "check") {
        const res = await api.post("/ai/resume", { resumeText });
        setResult(res.data.result);
      } else {
        const res = await api.post("/ai/resume/build", {
          profile,
          jobDescription,
          tone,
        });
        setResult(res.data.result);
      }
    } catch (err) {
      setError(getApiError(err, "Resume request failed"));
    } finally {
      setLoading("");
    }
  };

  const uploadDocument = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setLoading("upload");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/ai/upload", formData);
      setResumeText(res.data.text);
      setProfile(res.data.text);
    } catch (err) {
      setError(getApiError(err, "Could not upload document"));
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        pill="Resume intelligence"
        title="Resume lab"
        lead="ATS checker uses Groq (fast, free tier). Resume builder uses Gemini (separate key = more daily quota)."
      />

      <AuthGate signedIn={signedIn}>
        <div className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
          <TabButton active={mode === "check"} onClick={() => setMode("check")}>
            ATS checker · Groq
          </TabButton>
          <TabButton active={mode === "build"} onClick={() => setMode("build")}>
            Builder · Gemini
          </TabButton>
        </div>

        {mode === "check" ? (
          <section className="cp-card-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-slate-900">ATS checker</h2>
              {atsProvider && <AiProviderBadge provider={atsProvider} configured={atsProvider.configured} />}
            </div>
            <p className="mt-1 text-sm text-slate-600">Upload PDF/TXT or paste text, then analyze.</p>

            <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-6">
              <input
                type="file"
                accept=".txt,.pdf,application/pdf,text/plain"
                onChange={uploadDocument}
                className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-500"
              />
              {loading === "upload" && (
                <p className="mt-3">
                  <LoadingDots label="Extracting text" />
                </p>
              )}
            </div>

            <label className="cp-label mt-5" htmlFor="resume-body">
              Resume text
            </label>
            <textarea
              id="resume-body"
              rows={12}
              className="cp-textarea min-h-[220px] font-mono text-sm"
              placeholder="Paste your resume here…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            {error && <div className="cp-alert-error mt-4">{error}</div>}
            {loading === "check" && (
              <div className="mt-4">
                <LoadingDots label="Groq is analyzing" />
              </div>
            )}
            <button
              type="button"
              onClick={() => runAction("check")}
              disabled={loading === "check" || !resumeText.trim()}
              className="cp-btn-primary mt-4"
            >
              {loading === "check" ? "Analyzing…" : "Run ATS analysis"}
            </button>
          </section>
        ) : (
          <section className="cp-card-glow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-slate-900">Resume builder</h2>
              {builderProvider && (
                <AiProviderBadge provider={builderProvider} configured={builderProvider.configured} />
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">Your facts + optional job description → structured draft.</p>

            <label className="cp-label mt-5" htmlFor="profile-notes">
              Profile & bullets
            </label>
            <textarea
              id="profile-notes"
              rows={8}
              className="cp-textarea min-h-[160px]"
              placeholder="Roles, dates, metrics, stack, education…"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
            <label className="cp-label mt-4" htmlFor="jd">
              Target job description (optional)
            </label>
            <textarea
              id="jd"
              rows={4}
              className="cp-textarea"
              placeholder="Paste a posting to tune keywords…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <label className="cp-label mt-4" htmlFor="tone">
              Tone
            </label>
            <input id="tone" className="cp-input" value={tone} onChange={(e) => setTone(e.target.value)} />
            {error && <div className="cp-alert-error mt-4">{error}</div>}
            {loading === "build" && (
              <div className="mt-4">
                <LoadingDots label="Gemini is writing" />
              </div>
            )}
            <button
              type="button"
              onClick={() => runAction("build")}
              disabled={loading === "build" || !profile.trim()}
              className="cp-btn-primary mt-4"
            >
              {loading === "build" ? "Building…" : "Generate resume draft"}
            </button>
          </section>
        )}

        <ResultPanel
          title={mode === "check" ? "ATS report" : "Resume draft"}
          content={result}
          onClear={() => setResult("")}
        />
      </AuthGate>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export default Resume;
