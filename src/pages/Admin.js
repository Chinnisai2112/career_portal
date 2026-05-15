import { useCallback, useEffect, useState } from "react";
import api, { getApiError } from "../lib/api";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsResponse, usersResponse] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users", { params: appliedQuery ? { q: appliedQuery } : {} }),
      ]);
      setStats(statsResponse.data);
      setUsers(usersResponse.data.users || []);
    } catch (e) {
      setError(getApiError(e, "Failed to load admin data"));
      setStats(null);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [appliedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const openUser = async (id) => {
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
      return;
    }

    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);

    try {
      const res = await api.get(`/admin/users/${id}`);
      setDetail(res.data);
    } catch (e) {
      setError(getApiError(e, "Could not load user details"));
      setSelectedId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const applyFilter = () => {
    setAppliedQuery(searchInput.trim());
  };

  return (
    <div className="space-y-8">
      <header>
        <span className="cp-pill bg-amber-50 text-amber-800 ring-amber-600/20">Host</span>
        <h1 className="cp-h1 mt-3">Admin monitor</h1>
        <p className="cp-lead">Users, signups, and stored career Q&amp;A volume (previews only).</p>
      </header>

      {error && <div className="cp-alert-error">{error}</div>}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Total users" value={stats.totalUsers} tone="slate" />
          <Metric label="New (7 days)" value={stats.newUsersLast7Days} tone="emerald" />
          <Metric label="With AI history" value={stats.usersWithCareerHistory} tone="violet" />
          <Metric label="DB admin flag" value={stats.adminUsers} tone="amber" />
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50/80 p-4 sm:p-5">
          <div className="min-w-0 flex-1 sm:min-w-[240px]">
            <label className="cp-label" htmlFor="admin-search">
              Search users
            </label>
            <input
              id="admin-search"
              className="cp-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Name or email"
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilter();
              }}
            />
          </div>
          <button type="button" onClick={applyFilter} className="cp-btn-secondary">
            Apply filter
          </button>
          <button type="button" onClick={load} disabled={loading} className="cp-btn-primary">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        <div className="overflow-x-auto cp-scroll">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Privileged</th>
                <th className="px-4 py-3">AI uses</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="bg-white transition hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">{user.isAdmin ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">{user.historyCount}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-500" title={user.lastActivity || ""}>
                    {user.lastActivity || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="font-semibold text-brand-600 hover:text-brand-500"
                      onClick={() => openUser(user.id)}
                    >
                      {selectedId === user.id ? "Close" : "Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && users.length === 0 && !error && (
          <p className="p-8 text-center text-sm text-slate-500">No users match this filter.</p>
        )}
      </section>

      {selectedId && (
        <section className="cp-card-glow">
          <h2 className="font-display text-lg font-bold text-slate-900">User detail</h2>
          {detailLoading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}
          {detail && !detailLoading && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <Detail label="Name" value={detail.name} />
                <Detail label="Email" value={detail.email} mono />
                <Detail label="History count" value={detail.historyCount} />
              </div>

              <div className="max-h-96 space-y-4 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-4 cp-scroll">
                {(detail.history || []).length === 0 && (
                  <p className="text-sm text-slate-500">No stored AI history yet.</p>
                )}
                {(detail.history || []).map((item) => (
                  <div key={item.index} className="border-b border-slate-200 pb-4 text-sm last:border-0 last:pb-0">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      #{item.index} · {item.category} · {item.answerLength || 0} chars
                    </p>
                    <p className="font-semibold text-slate-900">Q: {item.question}</p>
                    <p className="mt-2 whitespace-pre-wrap text-slate-600">A: {item.answerPreview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function Metric({ label, value, tone }) {
  const tones = {
    slate: "from-slate-700 to-slate-900",
    emerald: "from-emerald-600 to-teal-700",
    violet: "from-violet-600 to-indigo-700",
    amber: "from-amber-500 to-orange-600",
  };
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl ${tones[tone]}`} />
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 font-medium text-slate-900 ${mono ? "font-mono text-xs break-all" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
