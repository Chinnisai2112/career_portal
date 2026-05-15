import { useState } from "react";
import api, { getApiError } from "../lib/api";

export default function Interview() {
  const [jobRole, setJobRole] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    const trimmed = input.trim();
    const nextMessages = trimmed
      ? [...messages, { role: "user", content: trimmed }]
      : messages.length
        ? messages
        : [{ role: "user", content: "Start the mock interview." }];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/ai/interview", { jobRole, messages: nextMessages });
      setMessages([...nextMessages, { role: "assistant", content: res.data.reply }]);
    } catch (err) {
      setError(getApiError(err, "Mock interview failed"));
      setMessages((prev) => (prev.length && prev[prev.length - 1]?.role === "user" ? prev.slice(0, -1) : prev));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <span className="cp-pill">Live practice</span>
        <h1 className="cp-h1 mt-3">Mock interview</h1>
        <p className="cp-lead">One question at a time — answer, get feedback, then go deeper.</p>
      </header>

      <section className="cp-card overflow-hidden p-0 sm:p-0">
        <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <label className="cp-label mb-0" htmlFor="role">
            Target role
          </label>
          <input
            id="role"
            className="cp-input mt-2 max-w-xl"
            placeholder="e.g. Product designer, L5 backend engineer"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            disabled={messages.length > 0}
          />
        </div>

        <div className="max-h-[420px] space-y-4 overflow-y-auto bg-slate-50/50 px-6 py-6 cp-scroll">
          {messages.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-8 text-center text-sm text-slate-500">
              Set a role (optional), then start — we&apos;ll open with a strong first question.
            </p>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[75%] sm:text-[15px] ${
                  message.role === "assistant"
                    ? "border border-slate-200/80 bg-white text-slate-800"
                    : "bg-gradient-to-br from-brand-600 to-indigo-700 text-white"
                }`}
              >
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-80">
                  {message.role === "assistant" ? "Interviewer" : "You"}
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white p-6">
          <textarea
            rows={3}
            className="cp-textarea min-h-[88px]"
            placeholder="Type your answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!loading) sendMessage();
              }
            }}
          />
          {error && <div className="cp-alert-error mt-3">{error}</div>}
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={sendMessage} disabled={loading} className="cp-btn-primary">
              {loading ? "Sending…" : messages.length ? "Send answer" : "Start interview"}
            </button>
            <button
              type="button"
              className="cp-btn-secondary"
              disabled={loading}
              onClick={() => {
                setMessages([]);
                setInput("");
                setError("");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
