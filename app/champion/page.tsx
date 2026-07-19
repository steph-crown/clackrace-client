"use client";

import { useEffect, useState } from "react";
import { fetchDailyChampion } from "@/lib/api/clack";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

/** Shareable Daily Champion card (SVG) — OG-friendly static route. */
export default function ChampionPage() {
  const [champion, setChampion] = useState<{
    username: string;
    bestWpm: number;
    carColor: string;
    day: string;
  } | null>(null);

  useEffect(() => {
    void fetchDailyChampion().then((res) => {
      if (res.ok) setChampion(res.data.champion);
    });
  }, []);

  return (
    <PageShell centered logoHref="/leaderboard">
      <Eyebrow>Daily Champion</Eyebrow>
      <h1 className="mt-3 font-heading text-3xl font-bold uppercase tracking-wide text-chalk">
        Crown card
      </h1>

      <div className="mt-10 w-full max-w-lg overflow-hidden rounded-sm border border-lane">
        <svg
          viewBox="0 0 640 360"
          className="h-auto w-full"
          role="img"
          aria-label="Daily Champion card"
        >
          <defs>
            <linearGradient id="asphalt" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#12141a" />
              <stop offset="100%" stopColor="#1c2030" />
            </linearGradient>
          </defs>
          <rect width="640" height="360" fill="url(#asphalt)" />
          <rect x="0" y="0" width="640" height="6" fill="#f5c518" />
          <text
            x="40"
            y="64"
            fill="#8b92a5"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="14"
            letterSpacing="4"
          >
            CLACKRACE · DAILY CHAMPION
          </text>
          <text
            x="40"
            y="140"
            fill="#e8e6e1"
            fontFamily="ui-sans-serif, system-ui"
            fontWeight="700"
            fontSize="48"
          >
            {champion?.username ?? "Open seat"}
          </text>
          <circle
            cx="560"
            cy="120"
            r="36"
            fill={champion?.carColor ?? "#2ee6d6"}
          />
          <text
            x="40"
            y="220"
            fill="#2ee6d6"
            fontFamily="ui-monospace, monospace"
            fontSize="56"
            fontWeight="700"
          >
            {champion ? `${Math.round(champion.bestWpm)}` : "—"}
          </text>
          <text
            x="200"
            y="220"
            fill="#8b92a5"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="22"
          >
            WPM peak
          </text>
          <text
            x="40"
            y="300"
            fill="#8b92a5"
            fontFamily="ui-monospace, monospace"
            fontSize="16"
          >
            {champion?.day ?? "UTC day"} · crown resets at midnight UTC
          </text>
        </svg>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/leaderboard">Leaderboard</ButtonLink>
        <ButtonLink href="/play" variant="secondary">
          Race now
        </ButtonLink>
      </div>
    </PageShell>
  );
}
