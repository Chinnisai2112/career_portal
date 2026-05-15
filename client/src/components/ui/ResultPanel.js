import { useState } from "react";
import MarkdownView from "./MarkdownView";

export default function ResultPanel({ title, content, onClear }) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="cp-result-panel animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
        <div className="flex gap-2">
          <button type="button" className="cp-btn-secondary !px-3 !py-2 text-xs" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
          {onClear && (
            <button type="button" className="cp-btn-ghost !px-3 !py-2 text-xs" onClick={onClear}>
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="max-h-[560px] overflow-y-auto px-5 py-5 sm:px-6 cp-scroll">
        <MarkdownView content={content} />
      </div>
    </section>
  );
}
