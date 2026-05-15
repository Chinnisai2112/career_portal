import { Link } from "react-router-dom";

export default function AuthGate({ signedIn, children }) {
  if (signedIn) return children;

  return (
    <div className="cp-card border-amber-200/80 bg-gradient-to-br from-amber-50 to-white">
      <p className="font-display text-lg font-bold text-slate-900">Sign in to use AI tools</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Create a free account to run resume checks, mock interviews, performance coaching, and save your history in
        MongoDB.
      </p>
      <Link to="/login" className="cp-btn-primary mt-5 inline-flex">
        Sign in or register
      </Link>
    </div>
  );
}
