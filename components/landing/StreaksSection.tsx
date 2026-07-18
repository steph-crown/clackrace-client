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

        <div
          data-reveal
          className="relative mx-auto w-full max-w-sm rounded-sm border border-lane bg-asphalt p-6 shadow-[0_20px_60px_rgb(0_0_0_/0.45)]"
        >
          <div className="checkered-strip absolute inset-x-0 top-0 h-1.5 rounded-t-sm" />
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan">
            Result card
          </p>
          <p className="mt-4 font-logo text-3xl text-chalk">You</p>
          <div className="mt-6 flex items-end justify-between border-t border-lane pt-5">
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                WPM
              </p>
              <p className="font-heading text-4xl font-bold text-cyan">96</p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                Accuracy
              </p>
              <p className="font-heading text-4xl font-bold text-chalk">98%</p>
            </div>
            <div>
              <p className="font-heading text-[10px] uppercase tracking-wider text-chalk-muted">
                Streak
              </p>
              <p className="font-heading text-4xl font-bold text-signal">7</p>
            </div>
          </div>
          <p className="mt-5 font-mono text-xs text-chalk-muted">
            #clackrace · beat this
          </p>
        </div>
      </div>
    </section>
  );
}
