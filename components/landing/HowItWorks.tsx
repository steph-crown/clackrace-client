import { CarSvg } from "@/components/race/CarSvg";

const STEPS = [
  {
    title: "Pick a mode",
    copy: "Race CPU instantly, open a public link race, or challenge a friend.",
    visual: "modes",
  },
  {
    title: "Type the passage",
    copy: "Same text for everyone. Clean typing moves you farther than sloppy speed.",
    visual: "type",
  },
  {
    title: "Watch cars race",
    copy: "Your progress is the track. Finish first — or chase the pack next round.",
    visual: "cars",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      data-landing-section="how"
      className="relative z-20 bg-asphalt-raised px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
          Three steps.{" "}
          <span className="text-magenta">Zero setup.</span>
        </h2>
        <p className="mt-3 max-w-lg text-chalk-muted">
          From landing page to racing in under ten seconds. No rooms. No
          matchmaking wait.
        </p>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} data-reveal className="min-w-0">
              <p className="font-mono text-xs text-cyan">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-heading text-xl font-semibold uppercase tracking-wide text-chalk">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-chalk-muted">
                {step.copy}
              </p>
              <div className="mt-6 flex h-28 items-center justify-center overflow-hidden rounded-sm border border-lane bg-track">
                {step.visual === "modes" && (
                  <div className="flex gap-2 font-heading text-[10px] font-bold uppercase tracking-wider">
                    <span className="rounded-sm bg-cyan/15 px-2 py-1 text-cyan">
                      CPU
                    </span>
                    <span className="rounded-sm bg-magenta/15 px-2 py-1 text-magenta">
                      Public
                    </span>
                    <span className="rounded-sm bg-signal/15 px-2 py-1 text-signal">
                      Friend
                    </span>
                  </div>
                )}
                {step.visual === "type" && (
                  <p className="font-mono text-sm tracking-wide">
                    <span className="text-cyan">clack</span>
                    <span className="text-chalk">race</span>
                    <span className="animate-pulse border-b-2 border-signal text-chalk-muted">
                      _
                    </span>
                  </p>
                )}
                {step.visual === "cars" && (
                  <div className="relative w-full px-4">
                    <div className="absolute inset-x-4 top-1/2 h-px border-t border-dashed border-chalk-muted/30" />
                    <div className="relative flex justify-between">
                      <div className="w-16">
                        <CarSvg bodyColor="var(--cyan)" />
                      </div>
                      <div className="w-14 opacity-60">
                        <CarSvg bodyColor="var(--magenta)" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
