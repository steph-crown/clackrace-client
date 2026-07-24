import Link from "next/link";
import type { SessionMember } from "./types";

type RacerListProps = {
  members: SessionMember[];
  memberId: string | null;
  maxPlayers?: number;
};

export function RacerList({
  members,
  memberId,
  maxPlayers = 8,
}: RacerListProps) {
  const active = members.filter((m) => !m.disconnected);

  return (
    <section>
      <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-chalk-muted">
        Racers ({active.length}/{maxPlayers})
      </h2>
      <ul className="mt-3 space-y-2">
        {active.map((m) => {
          const isYou = m.id === memberId;
          const label = isYou ? "You" : m.displayName;
          const nameNode =
            !isYou && m.username ? (
              <Link
                href={`/u/${encodeURIComponent(m.username)}`}
                className="truncate text-chalk underline-offset-2 hover:text-cyan hover:underline"
              >
                {label}
              </Link>
            ) : (
              <span className="truncate">{label}</span>
            );

          return (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-sm border border-lane bg-asphalt-raised px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: m.carColor }}
                />
                <span className="flex min-w-0 items-center gap-1.5 font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                  {nameNode}
                  {m.isCreator ? (
                    <span className="shrink-0 text-chalk-muted">· Host</span>
                  ) : null}
                  {m.pending ? (
                    <span className="shrink-0 text-chalk-muted">· Waiting</span>
                  ) : null}
                </span>
              </div>
              <span className="shrink-0 font-mono text-xs text-chalk-muted">
                {m.rating != null ? Math.round(m.rating) : "Guest"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
