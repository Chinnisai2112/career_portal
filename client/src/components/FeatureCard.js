import { Link } from "react-router-dom";
import AiProviderBadge from "./ui/AiProviderBadge";

const accents = {
  violet: "from-violet-500/15 to-indigo-500/5 border-violet-200/60",
  cyan: "from-cyan-500/15 to-sky-500/5 border-cyan-200/60",
  rose: "from-rose-500/15 to-orange-500/5 border-rose-200/60",
  emerald: "from-emerald-500/15 to-teal-500/5 border-emerald-200/60",
  amber: "from-amber-500/15 to-yellow-500/5 border-amber-200/60",
  slate: "from-slate-500/10 to-slate-500/5 border-slate-200",
};

export default function FeatureCard({ to, icon, title, description, accent = "slate", provider }) {
  return (
    <Link
      to={to}
      className={`group cp-feature-card bg-gradient-to-br ${accents[accent] || accents.slate}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200/80 transition group-hover:scale-105">
          {icon}
        </span>
        {provider && <AiProviderBadge provider={provider} configured={provider.configured} />}
      </div>
      <h3 className="mt-5 font-display text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
      <span className="mt-5 inline-flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-500">
        Open tool →
      </span>
    </Link>
  );
}
