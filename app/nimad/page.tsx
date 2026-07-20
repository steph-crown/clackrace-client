"use client";

import { useCallback, useEffect, useState } from "react";
import { authClient, signOut, useSession } from "@/lib/auth/client";
import {
  fetchAdminEntity,
  fetchAdminMe,
  fetchAdminOverview,
  type AdminMe,
  type AdminOverview,
  type EntityPage,
} from "@/lib/api/admin";

const ENTITIES = [
  { id: "events", label: "Events" },
  { id: "users", label: "Users" },
  { id: "sessions", label: "Sessions" },
  { id: "races", label: "Races" },
  { id: "participants", label: "Participants" },
  { id: "personal_bests", label: "Personal bests" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "elo", label: "ELO" },
  { id: "streaks", label: "Streaks" },
  { id: "champions", label: "Champions" },
  { id: "passages", label: "Passages" },
  { id: "shadow_holds", label: "Shadow holds" },
] as const;

type Tab = "overview" | "browse";

function cell(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

export default function NimadPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [admin, setAdmin] = useState<AdminMe["user"] | null>(null);
  const [checking, setChecking] = useState(true);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [entity, setEntity] = useState<(typeof ENTITIES)[number]["id"]>("events");
  const [q, setQ] = useState("");
  const [filterName, setFilterName] = useState("");
  const [page, setPage] = useState(1);
  const [entityData, setEntityData] = useState<EntityPage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshAdmin = useCallback(async () => {
    setChecking(true);
    const me = await fetchAdminMe();
    if (me.ok) {
      setAdmin(me.data.user);
    } else {
      setAdmin(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    if (sessionPending) return;
    void refreshAdmin();
  }, [sessionPending, session?.user?.id, refreshAdmin]);

  useEffect(() => {
    if (!admin) return;
    void (async () => {
      const ov = await fetchAdminOverview();
      if (ov.ok) setOverview(ov.data);
    })();
  }, [admin]);

  useEffect(() => {
    if (!admin || tab !== "browse") return;
    let cancelled = false;
    void (async () => {
      setLoadError(null);
      const res = await fetchAdminEntity(entity, {
        page,
        limit: 40,
        q: q.trim() || undefined,
        name: entity === "events" && filterName.trim() ? filterName.trim() : undefined,
      });
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.message);
        setEntityData(null);
        return;
      }
      setEntityData(res.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [admin, tab, entity, page, q, filterName]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setBusy(true);
    try {
      const username = loginUser.trim().toLowerCase();
      const res = await authClient.signIn.username({
        username,
        password: loginPass,
      });
      if (res.error) {
        setLoginError(res.error.message ?? "Sign in failed");
        setBusy(false);
        return;
      }
      await refreshAdmin();
      setBusy(false);
    } catch {
      setLoginError("Something went wrong.");
      setBusy(false);
    }
  };

  if (checking || sessionPending) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-asphalt px-5 text-sm text-chalk-muted">
        Checking access…
      </main>
    );
  }

  if (!admin) {
    return (
      <main className="asphalt-grain flex min-h-dvh flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-chalk-muted">
            Internal
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold uppercase tracking-wide text-chalk">
            Sign in
          </h1>
          <form onSubmit={onLogin} className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs text-chalk-muted">Username</span>
              <input
                className="mt-1 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2 text-sm text-chalk outline-none focus:border-cyan/50"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs text-chalk-muted">Password</span>
              <input
                type="password"
                className="mt-1 w-full rounded-sm border border-lane bg-asphalt-raised px-3 py-2 text-sm text-chalk outline-none focus:border-cyan/50"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? (
              <p className="text-sm text-danger">{loginError}</p>
            ) : null}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-sm bg-cyan px-4 py-2.5 font-heading text-xs font-bold uppercase tracking-wider text-asphalt disabled:opacity-50"
            >
              {busy ? "…" : "Enter"}
            </button>
          </form>
          {session?.user && !admin ? (
            <p className="mt-4 text-xs text-chalk-muted">
              Signed in, but not an admin.{" "}
              <button
                type="button"
                className="text-cyan underline-offset-2 hover:underline"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  const columns =
    entityData?.rows[0] != null ? Object.keys(entityData.rows[0]) : [];
  const totalPages = entityData
    ? Math.max(1, Math.ceil(entityData.total / entityData.limit))
    : 1;

  return (
    <main className="asphalt-grain min-h-dvh px-4 py-8 sm:px-6">
      <header className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.22em] text-chalk-muted">
            Ops
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold uppercase tracking-wide text-chalk">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-chalk-muted">
            {admin.username ?? admin.email}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`rounded-sm px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider ${
              tab === "overview"
                ? "bg-cyan text-asphalt"
                : "border border-lane text-chalk-muted hover:text-chalk"
            }`}
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setTab("browse")}
            className={`rounded-sm px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider ${
              tab === "browse"
                ? "bg-cyan text-asphalt"
                : "border border-lane text-chalk-muted hover:text-chalk"
            }`}
          >
            Data
          </button>
          <button
            type="button"
            onClick={() => void signOut().then(() => setAdmin(null))}
            className="rounded-sm border border-lane px-3 py-1.5 font-heading text-[10px] font-bold uppercase tracking-wider text-chalk-muted hover:text-chalk"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-6xl">
        {tab === "overview" ? (
          <section>
            {overview ? (
              <>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {(
                    [
                      ["Users", overview.counts.users],
                      ["Sessions", overview.counts.sessions],
                      ["Races", overview.counts.races],
                      ["Events", overview.counts.events],
                      ["Events 7d", overview.counts.events7d],
                    ] as const
                  ).map(([label, n]) => (
                    <li
                      key={label}
                      className="rounded-sm border border-lane bg-asphalt-raised/80 px-3 py-3"
                    >
                      <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                        {label}
                      </p>
                      <p className="mt-1 font-mono text-xl text-chalk">{n}</p>
                    </li>
                  ))}
                </ul>
                <h2 className="mt-10 font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
                  Top events (7 days)
                </h2>
                <ul className="mt-3 divide-y divide-lane/60 rounded-sm border border-lane">
                  {overview.topEvents7d.length === 0 ? (
                    <li className="px-3 py-4 text-sm text-chalk-muted">
                      No events yet.
                    </li>
                  ) : (
                    overview.topEvents7d.map((ev) => (
                      <li
                        key={ev.name}
                        className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm"
                      >
                        <button
                          type="button"
                          className="font-mono text-cyan hover:underline"
                          onClick={() => {
                            setEntity("events");
                            setFilterName(ev.name);
                            setQ("");
                            setPage(1);
                            setTab("browse");
                          }}
                        >
                          {ev.name}
                        </button>
                        <span className="font-mono text-chalk-muted">
                          {ev.count}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </>
            ) : (
              <p className="text-sm text-chalk-muted">Loading overview…</p>
            )}
          </section>
        ) : (
          <section>
            <div className="flex flex-wrap gap-2">
              {ENTITIES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    setEntity(e.id);
                    setPage(1);
                    setFilterName("");
                  }}
                  className={`rounded-sm px-2.5 py-1 font-heading text-[10px] font-bold uppercase tracking-wider ${
                    entity === e.id
                      ? "bg-signal text-asphalt"
                      : "border border-lane text-chalk-muted hover:text-chalk"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter / search…"
                className="min-w-[12rem] flex-1 rounded-sm border border-lane bg-asphalt-raised px-3 py-2 text-sm text-chalk outline-none focus:border-cyan/50"
              />
              {entity === "events" ? (
                <input
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Exact event name"
                  className="min-w-[10rem] rounded-sm border border-lane bg-asphalt-raised px-3 py-2 font-mono text-sm text-chalk outline-none focus:border-cyan/50"
                />
              ) : null}
            </div>

            {loadError ? (
              <p className="mt-4 text-sm text-danger">{loadError}</p>
            ) : null}

            <div className="mt-4 overflow-x-auto rounded-sm border border-lane">
              {!entityData ? (
                <p className="px-3 py-6 text-sm text-chalk-muted">Loading…</p>
              ) : entityData.rows.length === 0 ? (
                <p className="px-3 py-6 text-sm text-chalk-muted">No rows.</p>
              ) : (
                <table className="w-full min-w-[40rem] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-lane bg-asphalt-raised/90">
                      {columns.map((c) => (
                        <th
                          key={c}
                          className="px-2 py-2 font-heading text-[10px] font-semibold uppercase tracking-wider text-chalk-muted"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entityData.rows.map((row, i) => (
                      <tr
                        key={String(row.id ?? i)}
                        className="border-b border-lane/50 odd:bg-track/20"
                      >
                        {columns.map((c) => (
                          <td
                            key={c}
                            className="max-w-[14rem] truncate px-2 py-1.5 font-mono text-chalk"
                            title={cell(row[c])}
                          >
                            {cell(row[c])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {entityData ? (
              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-chalk-muted">
                <span>
                  {entityData.total} row{entityData.total === 1 ? "" : "s"} · page{" "}
                  {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-sm border border-lane px-2 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-sm border border-lane px-2 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
