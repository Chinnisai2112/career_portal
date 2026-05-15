export default function LoadingDots({ label = "Thinking" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
      <span className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.2s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500 [animation-delay:-0.1s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-brand-500" />
      </span>
      {label}…
    </span>
  );
}
