import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api, { getApiError } from "../lib/api";

function Resume() {
  const location = useLocation();
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
      <header>
        <span className="cp-pill">Resume intelligence</span>
        <h1 className="cp-h1 mt-3">Resume lab</h1>
        <p className="cp-lead">ATS scoring, document ingest, and a tailored draft in one flow.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="cp-card-glow">
          <h2 className="font-display text-lg font-bold text-slate-900">ATS checker</h2>
          <p className="mt-1 text-sm text-slate-600">Upload PDF/TXT or paste text, then analyze.</p>
          <div className="mt-5">
            <label className="cp-label">Upload file</label>
            <input
              type="file"
              accept=".txt,.pdf,application/pdf,text/plain"
              onChange={uploadDocument}
              className="block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
            />
          </div>
          <div className="mt-5">
            <label className="cp-label" htmlFor="resume-body">
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
          </div>
          <button
            type="button"
            onClick={() => runAction("check")}
            disabled={loading === "check" || !resumeText.trim()}
            className="cp-btn-primary mt-4 w-full sm:w-auto"
          >
            {loading === "check" ? "Analyzing…" : "Run ATS analysis"}
          </button>
        </section>

        <section className="cp-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Resume builder</h2>
          <p className="mt-1 text-sm text-slate-600">Facts + optional job description → structured draft.</p>
          <div className="mt-5">
            <label className="cp-label" htmlFor="profile-notes">
              Your profile & bullets
            </label>
            <textarea
              id="profile-notes"
              rows={8}
              className="cp-textarea min-h-[160px]"
              placeholder="Roles, dates, metrics, stack, education…"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="cp-label" htmlFor="jd">
              Target job description (optional)
            </label>
            <textarea
              id="jd"
              rows={5}
              className="cp-textarea min-h-[100px]"
              placeholder="Paste a posting to tune keywords…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="cp-label" htmlFor="tone">
              Tone
            </label>
            <input
              id="tone"
              className="cp-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g. concise executive"
            />
          </div>
          <button
            type="button"
            onClick={() => runAction("build")}
            disabled={loading === "build" || !profile.trim()}
            className="cp-btn-primary mt-4 w-full sm:w-auto"
          >
            {loading === "build" ? "Building…" : "Generate resume draft"}
          </button>
        </section>
      </div>

      {loading === "upload" && (
        <p className="text-center text-sm font-medium text-brand-600">Extracting text from your file…</p>
      )}
      {error && <div className="cp-alert-error">{error}</div>}
      {result && (
        <section className="cp-card border-brand-200/60">
          <h2 className="font-display text-lg font-bold text-slate-900">Result</h2>
          <pre className="mt-4 max-h-[560px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-800 cp-scroll">
            {result}
          </pre>
        </section>
      )}
    </div>
  );
}

export default Resume;
