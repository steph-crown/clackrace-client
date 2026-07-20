import Link from "next/link";

const MODES = [
  {
    href: "/play/solo",
    title: "Race CPU",
    tag: "Just you",
    copy: "Practice instantly against bots. Pick difficulty and go.",
    accent: "cyan" as const,
  },
  {
    href: "/play/public",
    title: "Open Race",
    tag: "Anyone with the link",
    copy: "Host a race and share the link. Guests welcome.",
    accent: "magenta" as const,
  },
  {
    href: "/play/quick",
    title: "Quick Race",
    tag: "Random players",
    copy: "Jump in with whoever’s online. No link to share.",
    accent: "signal" as const,
  },
  {
    href: "/play",
    title: "Challenge a Friend",
    tag: "Someone you know",
    copy: "Invite by username or email. Private race for two.",
    accent: "cyan" as const,
  },
];

const accentBorder = {
  cyan: "hover:border-cyan/60 focus-visible:border-cyan",
  magenta: "hover:border-magenta/60 focus-visible:border-magenta",
  signal: "hover:border-signal/60 focus-visible:border-signal",
};

const accentText = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  signal: "text-signal",
};

export function ModesShowcase() {
  return (
    <section
      data-landing-section="modes"
      className="asphalt-grain relative z-20 px-5 py-24 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="font-heading text-3xl font-bold uppercase tracking-wide text-chalk sm:text-4xl">
          Choose your race
        </h2>
        <p className="mt-3 max-w-lg text-chalk-muted">
          Arcade character-select energy — pick a lane and start typing.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {MODES.map((mode) => (
            <li key={mode.title} data-reveal>
              <Link
                href={mode.href}
                className={`group flex h-full flex-col rounded-sm border border-lane bg-asphalt-raised p-6 transition-colors ${accentBorder[mode.accent]}`}
              >
                <p
                  className={`font-heading text-[10px] font-semibold uppercase tracking-[0.25em] ${accentText[mode.accent]}`}
                >
                  {mode.tag}
                </p>
                <h3 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wide text-chalk transition-transform group-hover:translate-x-0.5">
                  {mode.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-chalk-muted">
                  {mode.copy}
                </p>
                <span className="mt-6 font-heading text-xs font-semibold uppercase tracking-wider text-chalk">
                  Select →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
