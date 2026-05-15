import { useEffect, useState } from "react";
import api, { getApiError } from "../lib/api";

const tabs = [
  { id: "career", label: "Career" },
  { id: "resume", label: "Resume" },
  { id: "interview", label: "Interview" },
  { id: "performance", label: "Performance" },
  { id: "documents", label: "Documents" },
  { id: "history", label: "History" },
];

const starters = [
  "Build a 90-day roadmap to become a full stack developer.",
  "Which projects should I add for an entry-level software role?",
  "How should I prepare for a JavaScript interview this week?",
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("career");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState("");
  const [history, setHistory] = useState([]);

  const [careerQuestion, setCareerQuestion] = useState(starters[0]);
  const [careerAnswer, setCareerAnswer] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [profile, setProfile] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeResult, setResumeResult] = useState("");

  const [jobRole, setJobRole] = useState("Full Stack Developer");
  const [interviewInput, setInterviewInput] = useState("");
  const [interviewMessages, setInterviewMessages] = useState([]);

  const [performance, setPerformance] = useState({
    timeframe: "Last 30 days",
    goals: "",
    wins: "",
    blockers: "",
  });
  const [performanceResult, setPerformanceResult] = useState("");

  const [sessionSignedIn, setSessionSignedIn] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    const sync = () => {
      const t = !!localStorage.getItem("token");
      setSessionSignedIn(t);
      if (t) refreshHistory();
    };
    sync();
    window.addEventListener("auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const clearStatus = () => {
    setError("");
    setSuccess("");
  };

  const refreshHistory = async () => {
    try {
      const res = await api.get("/ai/history");
      setHistory(res.data.history || []);
    } catch {
      setHistory([]);
    }
  };

  const askCareer = async () => {
    clearStatus();
    setLoading("career");
    setCareerAnswer("");

    try {
      const res = await api.post("/ai/career", { question: careerQuestion });
      setCareerAnswer(res.data.answer);
      refreshHistory();
    } catch (e) {
      setError(getApiError(e, "Career guidance failed"));
    } finally {
      setLoading("");
    }
  };

  const analyzeResume = async () => {
    clearStatus();
    setLoading("resume-check");
    setResumeResult("");

    try {
      const res = await api.post("/ai/resume", { resumeText });
      setResumeResult(res.data.result);
      refreshHistory();
    } catch (e) {
      setError(getApiError(e, "Resume analysis failed"));
    } finally {
      setLoading("");
    }
  };

  const buildResume = async () => {
    clearStatus();
    setLoading("resume-build");
    setResumeResult("");

    try {
      const res = await api.post("/ai/resume/build", {
        profile,
        jobDescription,
        tone: "professional and concise",
      });
      setResumeResult(res.data.result);
      refreshHistory();
    } catch (e) {
      setError(getApiError(e, "Resume builder failed"));
    } finally {
      setLoading("");
    }
  };

  const uploadDocument = async (file) => {
    if (!file) return;
    clearStatus();
    setLoading("document");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/ai/upload", formData);
      setResumeText(res.data.text);
      setProfile(res.data.text);
      setSuccess(`Extracted text from ${res.data.name || file.name}`);
      setActiveTab("resume");
    } catch (e) {
      setError(getApiError(e, "Document upload failed"));
    } finally {
      setLoading("");
    }
  };

  const sendInterview = async () => {
    clearStatus();
    const nextMessages = interviewInput.trim()
      ? [...interviewMessages, { role: "user", content: interviewInput.trim() }]
      : interviewMessages.length
        ? interviewMessages
        : [{ role: "user", content: "Start the mock interview." }];

    setInterviewMessages(nextMessages);
    setInterviewInput("");
    setLoading("interview");

    try {
      const res = await api.post("/ai/interview", { jobRole, messages: nextMessages });
      setInterviewMessages([...nextMessages, { role: "assistant", content: res.data.reply }]);
      refreshHistory();
    } catch (e) {
      setError(getApiError(e, "Mock interview failed"));
      setInterviewMessages((prev) =>
        prev.length && prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev
      );
    } finally {
      setLoading("");
    }
  };

  const analyzePerformance = async () => {
    clearStatus();
    setLoading("performance");
    setPerformanceResult("");

    try {
      const res = await api.post("/ai/performance", performance);
      setPerformanceResult(res.data.result);
      refreshHistory();
    } catch (e) {
      setError(getApiError(e, "Performance analysis failed"));
    } finally {
      setLoading("");
    }
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-7 sm:p-10">
            <p className="cp-pill">Unified career workspace</p>
            <h1 className="cp-h1 mt-5 max-w-3xl">Everything you need to grow your career, on one screen.</h1>
            <p className="cp-lead">
              Ask for career guidance, test your resume, build a stronger version, practice interviews, upload
              documents, and track your history without jumping between different apps.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" className="cp-btn-primary" onClick={() => setActiveTab("resume")}>
                Improve resume
              </button>
              <button type="button" className="cp-btn-secondary" onClick={() => setActiveTab("interview")}>
                Practice interview
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-950 p-7 text-white lg:border-l lg:border-t-0">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Portal status</p>
            <div className="mt-6 grid gap-3">
              <StatusRow label="Frontend" value="React dashboard" tone="green" />
              <StatusRow label="Backend" value="Express APIs" tone="blue" />
              <StatusRow label="Database" value="MongoDB Atlas ready" tone="amber" />
              <StatusRow label="Session" value={sessionSignedIn ? "Signed in" : "Login required"} tone="rose" />
            </div>
          </div>
        </div>
      </section>

      <section className="cp-panel overflow-hidden">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 p-3 cp-scroll">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                activeTab === tab.id
                  ? "bg-slate-950 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-7">
          {error && <div className="cp-alert-error mb-5">{error}</div>}
          {success && <div className="cp-alert-success mb-5">{success}</div>}

          {activeTab === "career" && (
            <ToolGrid
              title="Career Guidance"
              description="Use this for roadmaps, job-search strategy, skill planning, role clarity, and project ideas."
              side={<PromptList prompts={starters} onPick={setCareerQuestion} />}
            >
              <label className="cp-label">Your question</label>
              <textarea
                className="cp-textarea min-h-[180px]"
                value={careerQuestion}
                onChange={(e) => setCareerQuestion(e.target.value)}
              />
              <button
                type="button"
                className="cp-btn-primary mt-4"
                onClick={askCareer}
                disabled={loading === "career" || !careerQuestion.trim()}
              >
                {loading === "career" ? "Thinking..." : "Get guidance"}
              </button>
              {careerAnswer && <Result title="Career Answer" value={careerAnswer} />}
            </ToolGrid>
          )}

          {activeTab === "resume" && (
            <ToolGrid
              title="Resume Lab"
              description="Paste or upload your resume, run ATS analysis, then generate a recruiter-ready version."
              side={<UploadBox loading={loading === "document"} onFile={uploadDocument} />}
            >
              <div className="grid gap-4 xl:grid-cols-2">
                <div>
                  <label className="cp-label">Resume text for ATS check</label>
                  <textarea
                    className="cp-textarea min-h-[260px]"
                    value={resumeText}
                    placeholder="Paste resume text here..."
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cp-btn-primary mt-4"
                    onClick={analyzeResume}
                    disabled={loading === "resume-check" || !resumeText.trim()}
                  >
                    {loading === "resume-check" ? "Checking..." : "Run ATS check"}
                  </button>
                </div>
                <div>
                  <label className="cp-label">Profile notes for builder</label>
                  <textarea
                    className="cp-textarea min-h-[150px]"
                    value={profile}
                    placeholder="Experience, education, skills, projects, achievements..."
                    onChange={(e) => setProfile(e.target.value)}
                  />
                  <label className="cp-label mt-4">Target job description</label>
                  <textarea
                    className="cp-textarea min-h-[94px]"
                    value={jobDescription}
                    placeholder="Optional job description..."
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                  <button
                    type="button"
                    className="cp-btn-secondary mt-4"
                    onClick={buildResume}
                    disabled={loading === "resume-build" || !profile.trim()}
                  >
                    {loading === "resume-build" ? "Building..." : "Build resume"}
                  </button>
                </div>
              </div>
              {resumeResult && <Result title="Resume Result" value={resumeResult} />}
            </ToolGrid>
          )}

          {activeTab === "interview" && (
            <ToolGrid
              title="Mock Interview"
              description="Start a role-based interview, answer one question at a time, and get feedback."
              side={<InterviewTips />}
            >
              <label className="cp-label">Target role</label>
              <input className="cp-input" value={jobRole} onChange={(e) => setJobRole(e.target.value)} />

              <div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 cp-scroll">
                {interviewMessages.length === 0 && (
                  <p className="text-sm text-slate-500">Start the interview when you are ready.</p>
                )}
                {interviewMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl p-4 text-sm ${
                      message.role === "assistant" ? "bg-white text-slate-700" : "bg-slate-950 text-white"
                    }`}
                  >
                    <p className="mb-1 text-xs font-bold uppercase opacity-60">
                      {message.role === "assistant" ? "AI interviewer" : "You"}
                    </p>
                    <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                  </div>
                ))}
              </div>

              <label className="cp-label mt-4">Your answer</label>
              <textarea
                className="cp-textarea"
                value={interviewInput}
                placeholder="Type your answer here..."
                onChange={(e) => setInterviewInput(e.target.value)}
              />
              <button
                type="button"
                className="cp-btn-primary mt-4"
                onClick={sendInterview}
                disabled={loading === "interview"}
              >
                {loading === "interview" ? "Thinking..." : interviewMessages.length ? "Send answer" : "Start interview"}
              </button>
            </ToolGrid>
          )}

          {activeTab === "performance" && (
            <ToolGrid
              title="Performance Analysis"
              description="Turn your goals, wins, and blockers into a clear growth plan."
              side={<PerformanceSnapshot />}
            >
              <label className="cp-label">Timeframe</label>
              <input
                className="cp-input"
                value={performance.timeframe}
                onChange={(e) => setPerformance({ ...performance, timeframe: e.target.value })}
              />
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <TextAreaField
                  label="Goals"
                  value={performance.goals}
                  onChange={(value) => setPerformance({ ...performance, goals: value })}
                />
                <TextAreaField
                  label="Wins"
                  value={performance.wins}
                  onChange={(value) => setPerformance({ ...performance, wins: value })}
                />
                <TextAreaField
                  label="Blockers"
                  value={performance.blockers}
                  onChange={(value) => setPerformance({ ...performance, blockers: value })}
                />
              </div>
              <button
                type="button"
                className="cp-btn-primary mt-4"
                onClick={analyzePerformance}
                disabled={
                  loading === "performance" ||
                  (!performance.goals.trim() && !performance.wins.trim() && !performance.blockers.trim())
                }
              >
                {loading === "performance" ? "Analyzing..." : "Create growth plan"}
              </button>
              {performanceResult && <Result title="Growth Plan" value={performanceResult} />}
            </ToolGrid>
          )}

          {activeTab === "documents" && (
            <ToolGrid
              title="Documents"
              description="Upload a PDF or plain text document, extract content, and send it into the resume workflow."
              side={<DocumentRules />}
            >
              <UploadBox loading={loading === "document"} onFile={uploadDocument} large />
            </ToolGrid>
          )}

          {activeTab === "history" && (
            <ToolGrid
              title="History"
              description="Review saved AI responses from this account."
              side={<HistoryStats count={history.length} onRefresh={refreshHistory} />}
            >
              <div className="space-y-3">
                {history.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
                    No saved history yet. Use any AI tool after logging in and it will appear here.
                  </div>
                )}
                {history.map((item, index) => (
                  <article key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {item.category || "career"}
                    </p>
                    <h3 className="mt-1 font-semibold text-slate-950">{item.question}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </ToolGrid>
          )}
        </div>
      </section>
    </div>
  );
}

function ToolGrid({ title, description, children, side }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <div>
        <h2 className="cp-h2">{title}</h2>
        <p className="mb-5 mt-2 max-w-3xl text-slate-600">{description}</p>
        {children}
      </div>
      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">{side}</aside>
    </div>
  );
}

function Result({ title, value }) {
  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h3 className="mb-3 font-semibold text-slate-950">{title}</h3>
      <pre className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</pre>
    </section>
  );
}

function PromptList({ prompts, onPick }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-slate-900">Quick prompts</p>
      <div className="space-y-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-600 hover:border-slate-300 hover:text-slate-950"
            onClick={() => onPick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

function UploadBox({ loading, onFile, large }) {
  return (
    <div className={`rounded-2xl border border-dashed border-slate-300 bg-white p-5 ${large ? "min-h-[260px]" : ""}`}>
      <p className="font-semibold text-slate-950">Upload document</p>
      <p className="mt-1 text-sm text-slate-500">PDF and TXT files are supported.</p>
      <input
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        className="mt-5 block w-full text-sm text-slate-600"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {loading && <p className="mt-3 text-sm font-medium text-slate-600">Extracting text...</p>}
    </div>
  );
}

function TextAreaField({ label, value, onChange }) {
  return (
    <div>
      <label className="cp-label">{label}</label>
      <textarea className="cp-textarea min-h-[150px]" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function StatusRow({ label, value, tone }) {
  const tones = {
    green: "bg-emerald-400",
    blue: "bg-sky-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span className={`h-2.5 w-2.5 rounded-full ${tones[tone]}`} />
        {value}
      </span>
    </div>
  );
}

function InterviewTips() {
  return (
    <div>
      <p className="font-semibold text-slate-950">Practice loop</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>Answer in 60 to 90 seconds.</li>
        <li>Use situation, action, result.</li>
        <li>Type "end" to request a wrap-up.</li>
      </ul>
    </div>
  );
}

function PerformanceSnapshot() {
  return (
    <div>
      <p className="font-semibold text-slate-950">Best inputs</p>
      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        <li>Measurable goals.</li>
        <li>Recent wins with numbers.</li>
        <li>Specific blockers or feedback.</li>
      </ul>
    </div>
  );
}

function DocumentRules() {
  return (
    <div>
      <p className="font-semibold text-slate-950">Document handling</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Files are sent to the backend for text extraction, then you can use the extracted content in the resume tools.
      </p>
    </div>
  );
}

function HistoryStats({ count, onRefresh }) {
  return (
    <div>
      <p className="font-semibold text-slate-950">Saved responses</p>
      <p className="mt-2 text-4xl font-black text-slate-950">{count}</p>
      <button type="button" className="cp-btn-secondary mt-4 w-full" onClick={onRefresh}>
        Refresh history
      </button>
    </div>
  );
}

export default Dashboard;
