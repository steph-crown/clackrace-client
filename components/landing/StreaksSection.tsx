import { ResultCard } from "@/components/race/results/ResultCard";

export function StreaksSection() {
  return (
    <section
      data-landing-section="streaks"
      className="relative z-20 bg-asphalt-raised px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <div data-reveal>
          <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
            Come back{" "}
            <span className="text-signal">tomorrow.</span>
          </h2>
          <p className="mt-4 max-w-md text-chalk-muted">
            Streaks, Daily Champion crowns, and shareable result cards — the
            reasons one race turns into a habit.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-chalk">
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-signal" />
              Flame streaks with milestones at 7 / 30 / 100 days
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-magenta" />
              Daily Champion badge + auto share card
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan" />
              Save guest runs when you create an account
            </li>
          </ul>
        </div>

        <div data-reveal className="mx-auto w-full max-w-sm">
          <ResultCard
            name="You"
            wpm={96}
            accuracy={98}
            thirdLabel="Streak"
            thirdValue="7"
          />
        </div>
      </div>
    </section>
  );
}
