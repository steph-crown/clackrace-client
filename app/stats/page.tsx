"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchMyStats } from "@/lib/api/clack";
import { useSession } from "@/lib/auth/client";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";
import { RaceChrome } from "@/components/race/RaceChrome";
import { StatBlock } from "@/components/ui/StatBlock";

type StatsData = Awaited<ReturnType<typeof fetchMyStats>>;

export default function StatsPage() {
  const { data: session, isPending } = useSession();
  const [res, setRes] = useState<StatsData | null>(null);

  useEffect(() => {
    if (!session?.user) return;
    void fetchMyStats().then(setRes);
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
  const maxWpm = Math.max(1, ...series.map((s) => s.wpm));

  return (
    <PageShell centered logoHref="/play" headerRight={<RaceChrome />}>
      <Eyebrow>Personal stats</Eyebrow>
      <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        Your garage
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        Trends, personal bests, and rating — not a vanity dashboard.
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-4">
        <StatBlock
          label="Rating"
          value={String(Math.round(elo.rating))}
          accent="cyan"
        />
        <StatBlock label="Rated races" value={String(elo.racesCounted)} />
        <StatBlock
          label="Tier"
          value={elo.kFactorTier === "provisional" ? "Prov" : "Est"}
        />
      </dl>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          WPM over time
        </h2>
        {series.length === 0 ? (
          <p className="mt-3 text-sm text-chalk-muted">No finished races yet.</p>
        ) : (
          <div className="mt-4 flex h-28 items-end gap-1">
            {series.slice(-24).map((s, i) => (
              <div
                key={`${s.at}-${i}`}
                className="flex-1 rounded-sm bg-cyan/70"
                style={{ height: `${(s.wpm / maxWpm) * 100}%` }}
                title={`${Math.round(s.wpm)} WPM · ${Math.round(s.accuracy)}%`}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12 w-full max-w-xl">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
          Personal bests
        </h2>
        <ul className="mt-4 space-y-2">
          {personalBests.length === 0 ? (
            <li className="text-sm text-chalk-muted">
              Finish a Race CPU run to set a PB (powers ghost racing).
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
