import { ButtonLink } from "@/components/ui/ButtonLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageShell } from "@/components/ui/PageShell";

/** Global boards land in Phase 5 — honest placeholder until accounts ship. */
export default function LeaderboardPlaceholderPage() {
  return (
    <PageShell centered logoHref="/play">
      <div className="text-center">
        <Eyebrow>Coming with accounts</Eyebrow>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
          Leaderboard
        </h1>
        <p className="mx-auto mt-3 max-w-md text-chalk-muted">
          All-time, daily, and weekly peak WPM boards unlock in Phase 5 when
          sign-in ships. Public Multiplayer already tracks a session leaderboard
          inside each race.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/play">Modes</ButtonLink>
          <ButtonLink href="/play/solo" variant="secondary">
            Race CPU
          </ButtonLink>
          <ButtonLink href="/play/public" variant="secondary">
            Public Multiplayer
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
