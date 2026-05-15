import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiError } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setMessage("");
    setError("");

    try {
      if (mode === "register") {
        await api.post("/auth/register", { name, email, password });
        setMessage("Account created. You can log in now.");
        setMode("login");
        return;
      }

      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/");
    } catch (err) {
      setError(getApiError(err, "Authentication failed"));
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 lg:flex-row lg:items-stretch">
      <div className="relative hidden flex-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-700 via-indigo-800 to-slate-900 p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-8 top-24 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">Career Portal</p>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
            One login. Every tool you need to stand out.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-indigo-100/90">
            Resume scoring, interview reps, performance coaching, and saved AI history — all tied to your account on
            this stack.
          </p>
        </div>
        <ul className="relative mt-10 space-y-3 text-sm text-indigo-100/85">
          <li className="flex gap-2">
            <span className="text-cyan-300">✓</span> JWT sessions with secure logout
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-300">✓</span> Same-origin friendly API defaults
          </li>
          <li className="flex gap-2">
            <span className="text-cyan-300">✓</span> Ready for single-server deploy
          </li>
        </ul>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        <div className="cp-card-glow mx-auto w-full max-w-md p-8 sm:p-10">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {mode === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {mode === "login" ? "Use the account you registered on this portal." : "Join and start using the tools."}
            </p>
          </div>

          {mode === "register" && (
            <div className="mb-4">
              <label className="cp-label" htmlFor="reg-name">
                Name
              </label>
              <input
                id="reg-name"
                className="cp-input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="cp-label" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className="cp-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="mb-6">
            <label className="cp-label" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className="cp-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {message && <div className="cp-alert-success mb-4">{message}</div>}
          {error && <div className="cp-alert-error mb-4">{error}</div>}

          <button type="button" className="cp-btn-primary w-full" onClick={submit}>
            {mode === "login" ? "Sign in" : "Register"}
          </button>

          <button
            type="button"
            className="cp-btn-ghost mt-3 w-full text-sm"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setMessage("");
            }}
          >
            {mode === "login" ? "Need an account? Register" : "Already registered? Sign in"}
          </button>

          <p className="mt-8 text-center text-xs text-slate-500">
            <Link to="/" className="font-medium text-brand-600 hover:text-brand-500">
              ← Back to overview
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
