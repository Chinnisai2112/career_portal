import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiError } from "../lib/api";

export default function Documents() {
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const upload = async () => {
    if (!file) {
      setError("Choose a .txt or .pdf file first.");
      return;
    }
    setBusy(true);
    setExtracted("");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/ai/upload", fd);
      setExtracted(res.data.text);
      setName(res.data.name || file.name);
    } catch (e) {
      setError(getApiError(e, "Upload failed"));
    } finally {
      setBusy(false);
    }
  };

  const goResume = () => {
    navigate("/resume", { state: { resumeText: extracted } });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <span className="cp-pill">Ingest</span>
        <h1 className="cp-h1 mt-3">Documents</h1>
        <p className="cp-lead">
          Upload a resume or notes as PDF or plain text. Text is extracted on the server — the file is not stored.
        </p>
      </header>

      <section className="cp-card-glow">
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center transition hover:border-brand-300 hover:bg-brand-50/20">
          <p className="text-sm font-medium text-slate-700">Drop-ready picker</p>
          <p className="mt-1 text-xs text-slate-500">.pdf or .txt — max size enforced on server</p>
          <input
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="mt-6 block w-full cursor-pointer text-sm text-slate-600 file:mx-auto file:mr-0 file:rounded-xl file:border-0 file:bg-brand-600 file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-500"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && <p className="mt-3 text-xs font-medium text-slate-600">Selected: {file.name}</p>}
        </div>

        {error && <div className="cp-alert-error mt-4">{error}</div>}

        <button type="button" disabled={busy} onClick={upload} className="cp-btn-primary mt-6 w-full sm:w-auto">
          {busy ? "Extracting…" : "Extract text"}
        </button>
      </section>

      {extracted && (
        <section className="cp-card">
          <h2 className="font-display text-lg font-bold text-slate-900">Extracted text</h2>
          <p className="mt-1 text-sm text-slate-600">
            From <span className="font-semibold text-slate-800">{name}</span>
          </p>
          <textarea
            readOnly
            className="cp-textarea mt-4 min-h-[220px] bg-slate-50/80 font-mono text-xs sm:text-sm"
            value={extracted}
          />
          <button type="button" onClick={goResume} className="cp-btn-primary mt-4">
            Open in resume lab →
          </button>
        </section>
      )}
    </div>
  );
}
