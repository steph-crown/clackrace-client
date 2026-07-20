import Link from "next/link";

const MODES = [
  {
    href: "/play/solo",
    title: "Race CPU",
    tag: "Just you",
    copy: "Practice instantly against bots. Pick difficulty and go.",
    accent: "cyan" as const,
    glyph: "cpu" as const,
  },
  {
    href: "/play/public",
    title: "Open Race",
    tag: "Anyone with the link",
    copy: "Host a race and share the link. Guests welcome.",
    accent: "magenta" as const,
    glyph: "link" as const,
  },
  {
    href: "/play/quick",
    title: "Quick Race",
    tag: "Random players",
    copy: "Jump in with whoever’s online. No link to share.",
    accent: "signal" as const,
    glyph: "match" as const,
  },
  {
    href: "/challenge",
    title: "Challenge a Friend",
    tag: "Someone you know",
    copy: "Invite by username or email. Private race for two.",
    accent: "cyan" as const,
    glyph: "challenge" as const,
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

function ShowcaseGlyph({
  glyph,
  className,
}: {
  glyph: "cpu" | "link" | "match" | "challenge";
  className?: string;
}) {
  const common = `h-7 w-7 ${className ?? ""}`;
  switch (glyph) {
    case "link":
      return (
        <svg viewBox="0 0 32 32" className={common} aria-hidden>
          <path
            d="M12 16h8M10 12a5 5 0 0 0 0 8h3M22 12h-3a5 5 0 0 1 0 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "match":
      return (
        <svg viewBox="0 0 32 32" className={common} aria-hidden>
          <circle cx="10" cy="16" r="3.5" fill="currentColor" opacity="0.9" />
          <circle cx="22" cy="12" r="3.5" fill="currentColor" opacity="0.7" />
          <circle cx="22" cy="20" r="3.5" fill="currentColor" opacity="0.7" />
          <path
            d="M13.5 16H18M18 16l3-3.5M18 16l3 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "challenge":
      return (
        <svg viewBox="0 0 32 32" className={common} aria-hidden>
          <path
            d="M16 6l2.5 6.5H26l-5.5 4 2 6.5L16 19l-6.5 4 2-6.5L6 12.5h7.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 32 32" className={common} aria-hidden>
          <rect
            x="6"
            y="14"
            width="20"
            height="8"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <circle cx="11" cy="22" r="2" fill="currentColor" />
          <circle cx="21" cy="22" r="2" fill="currentColor" />
        </svg>
      );
  }
}

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
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={`font-heading text-[10px] font-semibold uppercase tracking-[0.25em] ${accentText[mode.accent]}`}
                  >
                    {mode.tag}
                  </p>
                  <span className={accentText[mode.accent]}>
                    <ShowcaseGlyph glyph={mode.glyph} />
                  </span>
                </div>
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
