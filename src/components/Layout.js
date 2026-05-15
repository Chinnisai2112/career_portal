import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import api from "../lib/api";

const mainNav = [
  { to: "/", label: "Career Studio", mark: "01" },
  { to: "/ai", label: "Career Guidance", mark: "02" },
  { to: "/resume", label: "Resume Lab", mark: "03" },
  { to: "/interview", label: "Mock Interview", mark: "04" },
  { to: "/performance", label: "Performance", mark: "05" },
  { to: "/documents", label: "Documents", mark: "06" },
  { to: "/history", label: "History", mark: "07" },
];

function Layout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const refreshSession = () => {
    const token = localStorage.getItem("token");
    setHasSession(!!token);
    if (!token) {
      setIsAdmin(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setIsAdmin(!!r.data.isAdmin))
      .catch(() => setIsAdmin(false));
  };

  useEffect(() => {
    refreshSession();
    const onAuth = () => refreshSession();
    window.addEventListener("auth-change", onAuth);
    window.addEventListener("storage", onAuth);
    return () => {
      window.removeEventListener("auth-change", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // The local token should still be cleared if the server is unreachable.
    }
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
    setMobileOpen(false);
  };

  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
      isActive
        ? "bg-white text-slate-950 shadow-sm"
        : "text-slate-400 hover:bg-white/5 hover:text-white",
    ].join(" ");

  const links = isAdmin
    ? [...mainNav, { to: "/admin", label: "Admin Monitor", mark: "08" }]
    : mainNav;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950 px-4 py-6 transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-slate-950">
              CP
            </span>
            <div>
              <p className="font-display text-lg font-bold tracking-tight text-white">Career Portal</p>
              <p className="text-xs text-slate-500">One workspace for growth</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            Close
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto cp-scroll">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setMobileOpen(false)}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-bold group-hover:bg-white/10">
                {item.mark}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <NavLink to="/login" className={linkClass} onClick={() => setMobileOpen(false)}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[11px] font-bold">
              ID
            </span>
            {hasSession ? "Account" : "Sign in"}
          </NavLink>
          {hasSession && (
            <button type="button" onClick={handleLogout} className="cp-btn-danger w-full text-sm">
              Log out
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            className="cp-btn-secondary !px-3 !py-2 text-sm"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            Menu
          </button>
          <span className="font-display text-sm font-bold text-slate-800">Career Portal</span>
          <span className="w-14" />
        </header>

        <main className="cp-main flex-1">
          <div className="cp-inner animate-fade-up">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
