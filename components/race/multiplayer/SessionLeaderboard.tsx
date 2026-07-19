import type { SessionLeaderboardEntry } from "./types";

type SessionLeaderboardProps = {
  entries: SessionLeaderboardEntry[];
  memberId: string | null;
};

export function SessionLeaderboard({
  entries,
  memberId,
}: SessionLeaderboardProps) {
  if (entries.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
        Session leaderboard
      </h2>
      <ol className="mt-3 space-y-2">
        {entries.map((e, i) => (
          <li
            key={e.memberId}
            className="flex justify-between rounded-sm border border-lane/60 px-4 py-2 font-mono text-sm"
          >
            <span className="text-chalk">
              #{i + 1} {e.memberId === memberId ? "You" : e.displayName}
            </span>
            <span className="text-cyan">{Math.round(e.bestWpm)} WPM</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
