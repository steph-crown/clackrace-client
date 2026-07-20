"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchDailyChampion,
  fetchLeaderboard,
  fetchMyStats,
} from "@/lib/api/clack";
import { useSession } from "@/lib/auth/client";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ChampionCrowns } from "@/components/ui/ChampionCrown";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { StatBlock } from "@/components/ui/StatBlock";
import { cn } from "@/lib/utils/cn";

type StatsData = Awaited<ReturnType<typeof fetchMyStats>>;

export default function StatsPage() {
  const { data: session, isPending } = useSession();
  const [res, setRes] = useState<StatsData | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [crowns, setCrowns] = useState({ daily: false, overall: false });

  useEffect(() => {
    if (!session?.user) return;
    void fetchMyStats().then(setRes);
    const userId = session.user.id;
    void Promise.all([fetchDailyChampion(), fetchLeaderboard("all_time")]).then(
      ([champ, board]) => {
        setCrowns({
          daily: champ.ok && champ.data.champion?.userId === userId,
          overall:
            board.ok &&
            board.data.entries[0]?.userId === userId &&
            board.data.entries[0].rank === 1,
        });
      },
    );
  }, [session?.user]);

  const heatmapTop = useMemo(() => {
    if (!res?.ok) return [];
    return Object.entries(res.data.mistypeHeatmap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [res]);

  if (isPending) {
    return (
      <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
        <p className="text-sm text-chalk-muted">Loading…</p>
      </PageShell>
    );
  }

  if (!session?.user) {
    return (
      <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
        <Eyebrow>Personal stats</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase text-chalk">
          Sign in for stats
        </h1>
        <p className="mt-3 text-sm text-chalk-muted">
          WPM history, personal bests, and your rating live on your account.
        </p>
        <div className="mt-8">
          <ButtonLink href="/signin">Sign in</ButtonLink>
        </div>
      </PageShell>
    );
  }

  if (!res?.ok) {
    return (
      <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
        <p className="text-sm text-danger">
          {res?.error.message ?? "Could not load stats."}
        </p>
      </PageShell>
    );
  }

  const { elo, series, personalBests } = res.data;
  const chart = series.slice(-24);
  const maxWpm = Math.max(1, ...chart.map((s) => s.wpm));
  const peakWpm = Math.max(0, ...series.map((s) => s.wpm));
  const hover = hoverIdx != null ? chart[hoverIdx] : null;
  const ratingHint =
    elo.racesCounted < 20
      ? `From wins/losses vs signed-in racers. Moves more while you’re new (${elo.racesCounted}/20).`
      : "From wins/losses vs signed-in racers. Settles more slowly after 20 races.";

  return (
    <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
      <Eyebrow>Personal stats</Eyebrow>
      <h1 className="mt-3 flex flex-wrap items-center gap-2 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        Your garage
        <ChampionCrowns
          daily={crowns.daily}
          overall={crowns.overall}
          size="md"
        />
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        Trends, personal bests, and rating — not a vanity dashboard.
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-4">
        <StatBlock
          label="Rating"
          value={String(Math.round(elo.rating))}
          accent="cyan"
          hint={ratingHint}
        />
        <StatBlock
          label="Rated races"
          value={String(elo.racesCounted)}
          hint="Human vs human only — CPU doesn’t count"
        />
        <StatBlock
          label="Peak WPM"
          value={peakWpm > 0 ? String(Math.round(peakWpm)) : "—"}
          accent="signal"
          hint="Best verified finish across all modes"
        />
      </dl>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          WPM over time
        </h2>
        <p className="mt-1 text-xs text-chalk-muted">
          Last {chart.length || "—"} finished races (all modes). Hover a bar for
          details.
        </p>
        {chart.length === 0 ? (
          <p className="mt-3 text-sm text-chalk-muted">No finished races yet.</p>
        ) : (
          <div className="relative mt-4">
            <div
              className="flex h-28 items-end gap-1"
              onMouseLeave={() => setHoverIdx(null)}
            >
              {chart.map((s, i) => {
                const pct = (s.wpm / maxWpm) * 100;
                return (
                  <button
                    key={`${s.at}-${i}`}
                    type="button"
                    className={cn(
                      "relative flex-1 rounded-sm transition-opacity",
                      hoverIdx === i
                        ? "bg-cyan"
                        : "bg-cyan/70 hover:bg-cyan/90",
                    )}
                    style={{ height: `${Math.max(pct, 4)}%` }}
                    aria-label={`${Math.round(s.wpm)} WPM, ${Math.round(s.accuracy)}% accuracy`}
                    onMouseEnter={() => setHoverIdx(i)}
                    onFocus={() => setHoverIdx(i)}
                  />
                );
              })}
            </div>
            {hover ? (
              <div
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-sm border border-lane bg-asphalt-raised px-3 py-2 text-left shadow-lg"
                role="tooltip"
              >
                <p className="font-mono text-sm text-cyan">
                  {Math.round(hover.wpm)} WPM
                </p>
                <p className="mt-0.5 text-xs text-chalk-muted">
                  {Math.round(hover.accuracy)}% accuracy
                  {hover.mode ? ` · ${formatMode(hover.mode)}` : ""}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-chalk-muted">
                  Finished{" "}
                  {new Date(hover.at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          Personal bests
        </h2>
        <p className="mt-1 text-xs text-chalk-muted">
          Highest verified WPM per difficulty (any mode) — not an average.
          Powers ghost racing. Peak WPM above is your single best across all
          difficulties.
        </p>
        <ul className="mt-4 space-y-2">
          {personalBests.length === 0 ? (
            <li className="text-sm text-chalk-muted">
              Finish a verified race to set a PB (powers ghost racing).
            </li>
          ) : (
            personalBests.map((pb) => (
              <li
                key={pb.difficulty}
                className="flex items-center justify-between rounded-sm border border-lane bg-asphalt-raised px-4 py-3"
              >
                <span className="font-heading text-sm font-semibold uppercase text-chalk">
                  {pb.difficulty}
                </span>
                <span className="font-mono text-sm text-cyan">
                  {pb.bestWpm} WPM · {pb.bestAccuracy}%
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          Mistyped keys
        </h2>
        {heatmapTop.length === 0 ? (
          <p className="mt-3 text-sm text-chalk-muted">No mistype data yet.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {heatmapTop.map(([key, count]) => (
              <li
                key={key}
                className="rounded-sm border border-lane bg-asphalt-raised px-3 py-2 font-mono text-sm text-chalk"
              >
                <span className="text-magenta">{key}</span>{" "}
                <span className="text-chalk-muted">×{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/play/solo">Race CPU</ButtonLink>
        <ButtonLink href="/leaderboard" variant="secondary">
          Leaderboard
        </ButtonLink>
      </div>
    </PageShell>
  );
}

function formatMode(mode: string): string {
  switch (mode) {
    case "solo_cpu":
      return "Race CPU";
    case "solo_ghost":
      return "Ghost";
    case "public":
      return "Open Race";
    case "matchmade":
      return "Quick Race";
    case "challenge":
      return "Challenge";
    default:
      return mode.replace(/_/g, " ");
  }
}
