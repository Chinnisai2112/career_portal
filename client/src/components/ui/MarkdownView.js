function renderInline(text) {
  const parts = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match;
  let key = 0;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(<span key={key++}>{text.slice(last, match.index)}</span>);
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      parts.push(
        <code key={key++} className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push(<span key={key++}>{text.slice(last)}</span>);
  }

  return parts.length ? parts : text;
}

function renderBlock(block, index) {
  const trimmed = block.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("### ")) {
    return (
      <h4 key={index} className="mt-5 font-display text-base font-bold text-slate-900">
        {renderInline(trimmed.slice(4))}
      </h4>
    );
  }

  if (trimmed.startsWith("## ")) {
    return (
      <h3 key={index} className="mt-6 font-display text-lg font-bold text-slate-950 first:mt-0">
        {renderInline(trimmed.slice(3))}
      </h3>
    );
  }

  if (trimmed.startsWith("# ")) {
    return (
      <h2 key={index} className="mt-6 font-display text-xl font-bold text-slate-950 first:mt-0">
        {renderInline(trimmed.slice(2))}
      </h2>
    );
  }

  const lines = trimmed.split("\n");
  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return (
      <ul key={index} className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
        {lines.map((line, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(line.replace(/^[-*]\s+/, ""))}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p key={index} className="mt-3 leading-relaxed text-slate-700">
      {renderInline(trimmed)}
    </p>
  );
}

export default function MarkdownView({ content, className = "" }) {
  if (!content) return null;

  const blocks = String(content).split(/\n\n+/);

  return (
    <div className={`cp-prose text-sm sm:text-[15px] ${className}`}>
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
