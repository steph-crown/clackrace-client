const STATS = [
  { label: "Daily top WPM", value: "142", unit: "WPM" },
  { label: "Races today", value: "1,284", unit: "" },
  { label: "Avg finish", value: "68", unit: "WPM" },
];

export function StatsTeaser() {
  return (
    <section
      data-landing-section="stats"
      className="relative z-20 border-y border-lane bg-track px-5 py-20 sm:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
              Chase the board
            </h2>
            <p className="mt-3 max-w-md text-chalk-muted">
              Peak WPM boards and streaks for when you want more than one good
              race.
            </p>
          </div>
          <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.25em] text-chalk-muted">
            Sample numbers · live boards ship with accounts
          </p>
        </div>

        <dl className="mt-12 grid gap-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              data-reveal
              className="rounded-sm border border-lane bg-asphalt/50 px-5 py-6"
            >
              <dt className="font-heading text-[10px] font-semibold uppercase tracking-[0.2em] text-chalk-muted">
                {stat.label}
              </dt>
              <dd className="mt-2 font-heading text-4xl font-bold tracking-tight text-cyan sm:text-5xl">
                {stat.value}
                {stat.unit ? (
                  <span className="ml-2 text-lg text-chalk-muted">
                    {stat.unit}
                  </span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
