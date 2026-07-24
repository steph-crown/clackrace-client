"use client";

import { use, useEffect, useMemo, useState } from "react";
import { fetchPublicStats } from "@/lib/api/clack";
import { useChampionStatus } from "@/lib/hooks/useChampionStatus";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ChampionCrowns } from "@/components/ui/ChampionCrowns";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { StatBlock } from "@/components/ui/StatBlock";
import { formatMode } from "@/lib/race/format-mode";
import { cn } from "@/lib/utils/cn";

type PublicStatsPageProps = {
  params: Promise<{ username: string }>;
};

export default function PublicStatsPage({ params }: PublicStatsPageProps) {
  const { username: raw } = use(params);
  const username = decodeURIComponent(raw).trim().toLowerCase();
  const [res, setRes] = useState<Awaited<
    ReturnType<typeof fetchPublicStats>
  > | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPublicStats(username).then((r) => {
      if (!cancelled) setRes(r);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const userId = res?.ok ? res.data.userId : undefined;
  const crowns = useChampionStatus(userId);

  const heatmapTop = useMemo(() => {
    if (!res?.ok) return [];
    return Object.entries(res.data.mistypeHeatmap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [res]);

  if (!res) {
    return (
      <PageShell centered logoHref="/leaderboard" headerRight={<RaceChrome />}>
        <p className="text-sm text-chalk-muted">Loading…</p>
      </PageShell>
    );
  }

  if (!res.ok) {
    return (
      <PageShell centered logoHref="/leaderboard" headerRight={<RaceChrome />}>
        <Eyebrow>Garage</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase text-chalk">
          Racer not found
        </h1>
        <p className="mt-3 text-sm text-chalk-muted">
          No public garage for that username.
        </p>
        <div className="mt-8">
          <ButtonLink href="/leaderboard">Leaderboard</ButtonLink>
        </div>
      </PageShell>
    );
  }

  const { elo, series, personalBest, carColor } = res.data;
  const chart = series.slice(-24);
  const maxWpm = Math.max(1, ...chart.map((s) => s.wpm));
  const hover = hoverIdx != null ? chart[hoverIdx] : null;
  const ratingHint =
    elo.racesCounted < 20
      ? `From wins/losses vs signed-in racers. Moves more while new (${elo.racesCounted}/20).`
      : "From wins/losses vs signed-in racers.";
  const pbHint = personalBest
    ? `${Math.round(personalBest.accuracy)}% accuracy · ${formatMode(personalBest.mode)}`
    : "Best verified finish - any mode";

  return (
    <PageShell centered logoHref="/leaderboard" headerRight={<RaceChrome />}>
      <Eyebrow>Public garage</Eyebrow>
      <h1 className="mt-3 flex flex-wrap items-center gap-2 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ background: carColor }}
          aria-hidden
        />
        {res.data.username}
        <ChampionCrowns
          daily={crowns.daily}
          overall={crowns.overall}
          dailyWpm={crowns.dailyWpm}
          overallWpm={crowns.overallWpm}
          size="md"
        />
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        Rating, personal best, and recent WPM.
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
          hint="Human vs human only - CPU does not count"
        />
        <StatBlock
          label="Personal best"
          value={personalBest ? String(Math.round(personalBest.wpm)) : "—"}
          accent="signal"
          hint={pbHint}
        />
      </dl>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          WPM over time
        </h2>
        <p className="mt-1 text-xs text-chalk-muted">
          Last {chart.length || "—"} finished races. Hover a bar for details.
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
                    aria-label={`${Math.round(s.wpm)} WPM`}
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
              </div>
            ) : null}
          </div>
        )}
      </section>

      {heatmapTop.length > 0 ? (
        <section className="mt-12 w-full max-w-xl">
          <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
            Mistyped keys
          </h2>
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
        </section>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink href="/leaderboard">Leaderboard</ButtonLink>
        <ButtonLink href="/play" variant="secondary">
          Race
        </ButtonLink>
      </div>
    </PageShell>
  );
}
