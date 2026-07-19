"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchDailyChampion,
  fetchLeaderboard,
  type LeaderboardScope,
} from "@/lib/api/clack";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { cn } from "@/lib/utils/cn";

const SCOPES: { id: LeaderboardScope; label: string }[] = [
  { id: "all_time", label: "All-time" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
];

type Entry = {
  rank: number;
  username: string;
  carColor: string;
  bestWpm: number;
  userId: string;
};

type Champion = {
  username: string;
  bestWpm: number;
  carColor: string;
  day: string;
};

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>("all_time");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([fetchLeaderboard(scope), fetchDailyChampion()]).then(
      ([board, champ]) => {
        if (cancelled) return;
        setEntries(board.ok ? board.data.entries : []);
        setChampion(champ.ok ? champ.data.champion : null);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const selectScope = (next: LeaderboardScope) => {
    setScope(next);
    setLoading(true);
  };

  return (
    <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
      <Eyebrow>Global boards</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        Leaderboard
      </h1>
      <p className="mt-2 max-w-md text-sm text-chalk-muted">
        Peak WPM for signed-in racers. Daily Champion holds the crown until
        midnight UTC.
      </p>

      {champion ? (
        <Link
          href="/champion"
          className="mt-8 flex items-center gap-4 rounded-sm border border-signal/40 bg-signal/10 px-4 py-3 transition-colors hover:bg-signal/15"
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ background: champion.carColor }}
          />
          <div>
            <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-signal">
              Daily Champion
            </p>
            <p className="font-heading text-sm font-bold uppercase text-chalk">
              {champion.username} · {Math.round(champion.bestWpm)} WPM
            </p>
          </div>
        </Link>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        {SCOPES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => selectScope(s.id)}
            className={cn(
              "rounded-sm px-3 py-1.5 font-heading text-xs font-semibold uppercase tracking-wider",
              scope === s.id
                ? "bg-cyan/15 text-cyan"
                : "text-chalk-muted hover:text-chalk",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <ol className="mt-6 w-full max-w-xl space-y-2">
        {loading ? (
          <li className="text-sm text-chalk-muted">Loading…</li>
        ) : entries.length === 0 ? (
          <li className="text-sm text-chalk-muted">
            No scores yet. Sign in and race to claim a spot.
          </li>
        ) : (
          entries.map((e) => (
            <li
              key={`${e.userId}-${e.rank}`}
              className="flex items-center justify-between rounded-sm border border-lane bg-asphalt-raised px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-chalk-muted">
                  #{e.rank}
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: e.carColor }}
                />
                <span className="font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                  {e.username}
                </span>
              </div>
              <span className="font-mono text-sm text-cyan">
                {Math.round(e.bestWpm)} WPM
              </span>
            </li>
          ))
        )}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/play">Modes</ButtonLink>
        <ButtonLink href="/signin" variant="secondary">
          Sign in
        </ButtonLink>
      </div>
    </PageShell>
  );
}
