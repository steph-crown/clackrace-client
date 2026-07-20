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
        {active.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between rounded-sm border border-lane bg-asphalt-raised px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: m.carColor }}
              />
              <span className="font-heading text-sm font-semibold uppercase tracking-wide text-chalk">
                {m.id === memberId ? "You" : m.displayName}
                {m.isCreator ? " · Host" : ""}
                {m.pending ? " · Waiting" : ""}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
