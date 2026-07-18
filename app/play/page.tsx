import Link from "next/link";

const MODES = [
  {
    href: "/play/solo",
    title: "Race CPU",
    copy: "Solo practice. Instant start.",
    ready: true,
  },
  {
    href: "#",
    title: "Public Multiplayer",
    copy: "Share a link. Anyone can join.",
    ready: false,
  },
  {
    href: "#",
    title: "Challenge a Friend",
    copy: "Signed-in direct race.",
    ready: false,
  },
] as const;

export default function ModeSelectPage() {
  return (
    <main className="asphalt-grain flex min-h-dvh flex-col px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="font-logo text-2xl text-chalk sm:text-3xl"
      >
        Clack<span className="text-cyan">Race</span>
      </Link>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-16">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Select mode
        </p>
        <h1 className="mt-3 font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
          How do you want to race?
        </h1>

        <ul className="mt-12 grid gap-4">
          {MODES.map((mode) =>
            mode.ready ? (
              <li key={mode.title}>
                <Link
                  href={mode.href}
                  className="flex flex-col rounded-sm border border-lane bg-asphalt-raised px-6 py-5 transition-colors hover:border-cyan/50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
                      {mode.title}
                    </h2>
                    <p className="mt-1 text-sm text-chalk-muted">{mode.copy}</p>
                  </div>
                  <span className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-cyan sm:mt-0">
                    Go →
                  </span>
                </Link>
              </li>
            ) : (
              <li key={mode.title}>
                <div className="flex flex-col rounded-sm border border-lane/60 bg-asphalt-raised/50 px-6 py-5 opacity-60 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
                      {mode.title}
                    </h2>
                    <p className="mt-1 text-sm text-chalk-muted">{mode.copy}</p>
                  </div>
                  <span className="mt-3 font-heading text-xs font-semibold uppercase tracking-wider text-chalk-muted sm:mt-0">
                    Soon
                  </span>
                </div>
              </li>
            ),
          )}
        </ul>
      </div>
    </main>
  );
}
