"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authClient, signOut, useSession } from "@/lib/auth/client";
import {
  describeEvent,
  EVENT_CATALOG,
} from "@/lib/analytics/event-catalog";
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

type EntityId = (typeof ENTITIES)[number]["id"];
type Tab = "overview" | "browse";

const ENTITY_IDS = new Set<string>(ENTITIES.map((e) => e.id));

function parseTab(raw: string | null): Tab {
  return raw === "browse" ? "browse" : "overview";
}

function parseEntity(raw: string | null): EntityId {
  if (raw && ENTITY_IDS.has(raw)) return raw as EntityId;
  return "events";
}

function parsePage(raw: string | null): number {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

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

function EventNameCell({ name }: { name: string }) {
  const meta = describeEvent(name);
  return (
    <div className="min-w-[12rem] max-w-[18rem]">
      <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-chalk-muted">
        {meta.group}
      </p>
      <p className="text-sm text-chalk">{meta.title}</p>
      <p className="mt-0.5 font-mono text-[10px] text-cyan/80">{name}</p>
      <p className="mt-1 text-[11px] leading-snug text-chalk-muted">
        {meta.description}
      </p>
    </div>
  );
}

function NimadInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: session, isPending: sessionPending } = useSession();
  const sessionKey = sessionPending
    ? null
    : (session?.user?.id ?? "anon");
  const [admin, setAdmin] = useState<AdminMe["user"] | null>(null);
  const [resolvedKey, setResolvedKey] = useState<string | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tab = parseTab(searchParams.get("tab"));
  const entity = parseEntity(searchParams.get("entity"));
  const q = searchParams.get("q") ?? "";
  const filterName = searchParams.get("name") ?? "";
  const page = parsePage(searchParams.get("page"));

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [entityData, setEntityData] = useState<EntityPage | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showDictionary, setShowDictionary] = useState(false);

  const checking = sessionKey == null || resolvedKey !== sessionKey;

  const patchParams = (
    patch: Record<string, string | null | undefined>,
    mode: "push" | "replace" = "push",
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") next.delete(key);
      else next.set(key, value);
    }
    if (next.get("tab") === "overview") next.delete("tab");
    if (next.get("page") === "1") next.delete("page");

    // Stable compare so param order doesn't create duplicate history entries.
    const stable = (params: URLSearchParams) =>
      [...params.keys()]
        .sort()
        .map((k) => `${k}=${params.getAll(k).join(",")}`)
        .join("&");
    if (stable(next) === stable(new URLSearchParams(searchParams.toString()))) {
      return;
    }

    const qs = next.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    if (mode === "replace") {
      router.replace(href, { scroll: false });
    } else {
      router.push(href, { scroll: false });
    }
  };

  const setTab = (next: Tab) => {
    if (next === "overview") {
      patchParams({ tab: null });
      return;
    }
    patchParams({
      tab: "browse",
      entity,
      page: page > 1 ? String(page) : null,
      q: q || null,
      name: filterName || null,
    });
  };

  useEffect(() => {
    if (sessionKey == null) return;
    let cancelled = false;
    void fetchAdminMe().then((me) => {
      if (cancelled) return;
      setAdmin(me.ok ? me.data.user : null);
      setResolvedKey(sessionKey);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionKey]);

  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    void fetchAdminOverview().then((ov) => {
      if (cancelled || !ov.ok) return;
      setOverview(ov.data);
    });
    return () => {
      cancelled = true;
    };
  }, [admin]);

  useEffect(() => {
    if (!admin || tab !== "browse") return;
    let cancelled = false;
    void fetchAdminEntity(entity, {
      page,
      limit: 40,
      q: q.trim() || undefined,
      name:
        entity === "events" && filterName.trim()
          ? filterName.trim()
          : undefined,
    }).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setLoadError(res.message);
        setEntityData(null);
        return;
      }
      setLoadError(null);
      setEntityData(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [admin, tab, entity, page, q, filterName]);

  const dictionaryEntries = useMemo(
    () =>
      Object.entries(EVENT_CATALOG).sort(([a], [b]) => a.localeCompare(b)),
    [],
  );

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
      const me = await fetchAdminMe();
      if (me.ok) {
        setAdmin(me.data.user);
        setResolvedKey(me.data.user.id);
      } else {
        setAdmin(null);
        setLoginError("Signed in, but this account is not an admin.");
      }
      setBusy(false);
    } catch {
      setLoginError("Something went wrong.");
      setBusy(false);
    }
  };

  if (checking) {
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
            onClick={() =>
              void signOut().then(() => {
                setAdmin(null);
                setResolvedKey(null);
              })
            }
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

                <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
                  <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
                    Top events (7 days)
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowDictionary((v) => !v)}
                    className="font-heading text-[10px] font-bold uppercase tracking-wider text-cyan hover:underline"
                  >
                    {showDictionary ? "Hide" : "Event"} dictionary
                  </button>
                </div>

                {showDictionary ? (
                  <ul className="mt-3 max-h-80 overflow-y-auto divide-y divide-lane/60 rounded-sm border border-lane">
                    {dictionaryEntries.map(([name, meta]) => (
                      <li key={name} className="px-3 py-2.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="text-sm text-chalk">{meta.title}</p>
                          <span className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                            {meta.group}
                          </span>
                        </div>
                        <p className="mt-0.5 font-mono text-[10px] text-cyan/80">
                          {name}
                        </p>
                        <p className="mt-1 text-[11px] text-chalk-muted">
                          {meta.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <ul className="mt-3 divide-y divide-lane/60 rounded-sm border border-lane">
                  {overview.topEvents7d.length === 0 ? (
                    <li className="px-3 py-4 text-sm text-chalk-muted">
                      No events yet.
                    </li>
                  ) : (
                    overview.topEvents7d.map((ev) => {
                      const meta = describeEvent(ev.name);
                      return (
                        <li
                          key={ev.name}
                          className="flex items-start justify-between gap-4 px-3 py-3 text-sm"
                        >
                          <button
                            type="button"
                            className="min-w-0 flex-1 text-left hover:opacity-90"
                            onClick={() =>
                              patchParams({
                                tab: "browse",
                                entity: "events",
                                name: ev.name,
                                q: null,
                                page: null,
                              })
                            }
                          >
                            <p className="font-heading text-[10px] font-semibold uppercase tracking-wider text-chalk-muted">
                              {meta.group}
                            </p>
                            <p className="text-chalk">{meta.title}</p>
                            <p className="mt-0.5 font-mono text-[10px] text-cyan">
                              {ev.name}
                            </p>
                            <p className="mt-1 text-[11px] text-chalk-muted">
                              {meta.description}
                            </p>
                          </button>
                          <span className="shrink-0 font-mono text-chalk-muted">
                            {ev.count}
                          </span>
                        </li>
                      );
                    })
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
                  onClick={() =>
                    patchParams({
                      tab: "browse",
                      entity: e.id,
                      page: null,
                      name: e.id === "events" ? filterName || null : null,
                    })
                  }
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
                onChange={(e) =>
                  patchParams(
                    {
                      tab: "browse",
                      entity,
                      q: e.target.value || null,
                      page: null,
                      name: filterName || null,
                    },
                    "replace",
                  )
                }
                placeholder="Filter / search…"
                className="min-w-[12rem] flex-1 rounded-sm border border-lane bg-asphalt-raised px-3 py-2 text-sm text-chalk outline-none focus:border-cyan/50"
              />
              {entity === "events" ? (
                <input
                  value={filterName}
                  onChange={(e) =>
                    patchParams(
                      {
                        tab: "browse",
                        entity: "events",
                        name: e.target.value || null,
                        q: q || null,
                        page: null,
                      },
                      "replace",
                    )
                  }
                  placeholder="Exact event name"
                  className="min-w-[10rem] rounded-sm border border-lane bg-asphalt-raised px-3 py-2 font-mono text-sm text-chalk outline-none focus:border-cyan/50"
                />
              ) : null}
            </div>

            {entity === "events" ? (
              <p className="mt-3 text-[11px] text-chalk-muted">
                Event names are product funnel signals. Expand a row’s{" "}
                <span className="font-mono text-chalk">name</span> cell for the
                plain-English meaning, or open the Event dictionary on Analytics.
              </p>
            ) : null}

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
                        className="border-b border-lane/50 align-top odd:bg-track/20"
                      >
                        {columns.map((c) => (
                          <td
                            key={c}
                            className="px-2 py-2 font-mono text-chalk"
                            title={
                              c === "name" && typeof row.name === "string"
                                ? undefined
                                : cell(row[c])
                            }
                          >
                            {c === "name" &&
                            entity === "events" &&
                            typeof row.name === "string" ? (
                              <EventNameCell name={row.name} />
                            ) : (
                              <span className="inline-block max-w-[14rem] truncate">
                                {cell(row[c])}
                              </span>
                            )}
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
                    onClick={() =>
                      patchParams({
                        tab: "browse",
                        entity,
                        page: page <= 2 ? null : String(page - 1),
                        q: q || null,
                        name: filterName || null,
                      })
                    }
                    className="rounded-sm border border-lane px-2 py-1 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      patchParams({
                        tab: "browse",
                        entity,
                        page: String(page + 1),
                        q: q || null,
                        name: filterName || null,
                      })
                    }
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

export default function NimadPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-dvh items-center justify-center bg-asphalt px-5 text-sm text-chalk-muted">
          Loading…
        </main>
      }
    >
      <NimadInner />
    </Suspense>
  );
}
