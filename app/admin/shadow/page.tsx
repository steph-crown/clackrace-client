"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

type Entry = {
  id: string;
  raceId: string;
  userId: string | null;
  username: string | null;
  finalWpm: number | null;
  accuracy: number | null;
  flagReason: string | null;
  createdAt: string | null;
};

/** Minimal shadow-hold review UI — paste ADMIN_TOKEN to load. */
export default function ShadowHoldAdminPage() {
  const [token, setToken] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/clack/admin/shadow-holds?token=${encodeURIComponent(token)}`,
        { credentials: "include" },
      );
      const body = (await res.json()) as {
        entries?: Entry[];
        error?: { message?: string };
      };
      if (!res.ok) {
        setError(body.error?.message ?? "Failed to load");
        setEntries([]);
      } else {
        setEntries(body.entries ?? []);
      }
    } catch {
      setError("Network error");
    }
    setBusy(false);
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("clack-admin-token");
    if (saved) setToken(saved);
  }, []);

  return (
    <PageShell centered logoHref="/">
      <Eyebrow>Anti-cheat</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
        Shadow-hold queue
      </h1>
      <p className="mt-2 max-w-md text-sm text-chalk-muted">
        Flagged runs held from public boards. Requires ADMIN_TOKEN on the
        server.
      </p>

      <form
        className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          sessionStorage.setItem("clack-admin-token", token);
          void load();
        }}
      >
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          className="flex-1 rounded-sm border border-lane bg-asphalt-raised px-3 py-2.5 font-mono text-sm text-chalk outline-none focus:border-cyan"
        />
        <Button type="submit" disabled={busy || !token}>
          {busy ? "Loading…" : "Load"}
        </Button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-magenta" role="alert">
          {error}
        </p>
      ) : null}

      <ol className="mt-8 w-full max-w-xl space-y-2">
        {entries.length === 0 && !error ? (
          <li className="text-sm text-chalk-muted">No entries loaded.</li>
        ) : (
          entries.map((e) => (
            <li
              key={e.id}
              className="rounded-sm border border-lane bg-asphalt-raised px-4 py-3 text-sm"
            >
              <p className="font-heading font-semibold uppercase text-chalk">
                {e.username ?? "Unknown"} · {Math.round(e.finalWpm ?? 0)} WPM
              </p>
              <p className="mt-1 font-mono text-xs text-chalk-muted">
                {e.flagReason ?? "flagged"} · {e.createdAt ?? "—"}
              </p>
            </li>
          ))
        )}
      </ol>
    </PageShell>
  );
}
