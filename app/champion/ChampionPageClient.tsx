"use client";

import { useEffect, useState } from "react";
import { fetchDailyChampion } from "@/lib/api/clack";
import { ShareChampionActions } from "@/components/race/results/ShareChampionActions";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

export function ChampionPageClient() {
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
      <p className="mt-2 text-sm text-chalk-muted">
        Top daily WPM holds the crown until midnight UTC — share it.
      </p>

      <div className="mt-10 flex w-full justify-center">
        {champion ? (
          <ShareChampionActions
            username={champion.username}
            bestWpm={champion.bestWpm}
            day={champion.day}
            carColor={champion.carColor}
          />
        ) : (
          <p className="text-sm text-chalk-muted">No champion yet today.</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/leaderboard">Leaderboard</ButtonLink>
        <ButtonLink href="/play" variant="secondary">
          Race now
        </ButtonLink>
      </div>
    </PageShell>
  );
}
