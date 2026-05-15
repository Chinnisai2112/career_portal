export default function AiProviderBadge({ provider, configured }) {
  if (!provider) return null;

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        configured
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-amber-200 bg-amber-50 text-amber-900",
      ].join(" ")}
      title={configured ? `${provider.engine} · ${provider.model}` : `Set ${provider.envHint} in .env`}
    >
      <span
        className={`h-2 w-2 rounded-full ${configured ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}
      />
      {configured ? `${provider.engine}` : "API key needed"}
    </span>
  );
}
