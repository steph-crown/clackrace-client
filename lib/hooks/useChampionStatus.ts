"use client";

import { useEffect, useState } from "react";
import { fetchDailyChampion, fetchLeaderboard } from "@/lib/api/clack";

export type ChampionStatus = {
  daily: boolean;
  overall: boolean;
  dailyWpm: number | null;
  overallWpm: number | null;
};

const EMPTY: ChampionStatus = {
  daily: false,
  overall: false,
  dailyWpm: null,
  overallWpm: null,
};

/** Whether the signed-in user currently holds Daily / Overall champion. */
export function useChampionStatus(userId: string | undefined): ChampionStatus {
  const [status, setStatus] = useState<ChampionStatus>(EMPTY);

  useEffect(() => {
    if (!userId) {
      setStatus(EMPTY);
      return;
    }
    let cancelled = false;
    void Promise.all([fetchDailyChampion(), fetchLeaderboard("all_time")]).then(
      ([champ, board]) => {
        if (cancelled) return;
        const dailyOk = champ.ok && champ.data.champion?.userId === userId;
        const overallOk =
          board.ok &&
          board.data.entries[0]?.userId === userId &&
          board.data.entries[0].rank === 1;
        setStatus({
          daily: !!dailyOk,
          overall: !!overallOk,
          dailyWpm: dailyOk ? (champ.data.champion?.bestWpm ?? null) : null,
          overallWpm: overallOk
            ? (board.data.entries[0]?.bestWpm ?? null)
            : null,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return status;
}
