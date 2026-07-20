import { cn } from "@/lib/utils/cn";
import { ChampionCrown } from "./ChampionCrown";

type ChampionCrownsProps = {
  daily?: boolean;
  overall?: boolean;
  dailyWpm?: number | null;
  overallWpm?: number | null;
  size?: "sm" | "md";
  className?: string;
};

/** Renders Daily and/or Overall champion crowns with optional WPM tooltips. */
export function ChampionCrowns({
  daily,
  overall,
  dailyWpm,
  overallWpm,
  size = "sm",
  className,
}: ChampionCrownsProps) {
  if (!daily && !overall) return null;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {daily ? (
        <ChampionCrown kind="daily" size={size} wpm={dailyWpm} />
      ) : null}
      {overall ? (
        <ChampionCrown kind="overall" size={size} wpm={overallWpm} />
      ) : null}
    </span>
  );
}
