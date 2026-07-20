import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type ModeGlyph = "cpu" | "link" | "match" | "challenge";

type ModeCardProps = {
  title: string;
  description: string;
  /** Who joins micro-label (PRD §6.1 card contract). */
  whoJoins?: string;
  /** Distinct motif for Open Race (link) vs Quick Race (match). */
  glyph?: ModeGlyph;
  actionLabel?: string;
  accent?: "cyan" | "magenta" | "signal";
  disabled?: boolean;
  disabledLabel?: string;
  href?: string;
  onClick?: () => void;
  busy?: boolean;
};

const accentHover = {
  cyan: "hover:border-cyan/50",
  magenta: "hover:border-magenta/50",
  signal: "hover:border-signal/50",
} as const;

const accentText = {
  cyan: "text-cyan",
  magenta: "text-magenta",
  signal: "text-signal",
} as const;

function GlyphIcon({ glyph, className }: { glyph: ModeGlyph; className?: string }) {
  const common = cn("h-8 w-8 shrink-0", className);
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

export function ModeCard({
  title,
  description,
  whoJoins,
  glyph,
  actionLabel = "Go →",
  accent = "cyan",
  disabled = false,
  disabledLabel = "Soon",
  href,
  onClick,
  busy = false,
}: ModeCardProps) {
  const body = (
    <>
      <div className="flex gap-4">
        {glyph ? (
          <span className={cn("mt-0.5", accentText[accent])}>
            <GlyphIcon glyph={glyph} />
          </span>
        ) : null}
        <div>
          <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-chalk">
            {title}
          </h2>
          <p className="mt-1 text-sm text-chalk-muted">{description}</p>
          {whoJoins ? (
            <p className="mt-2 font-heading text-[10px] font-semibold uppercase tracking-[0.18em] text-chalk-muted/80">
              {whoJoins}
            </p>
          ) : null}
        </div>
      </div>
      <span
        className={cn(
          "mt-3 font-heading text-xs font-semibold uppercase tracking-wider sm:mt-0",
          disabled ? "text-chalk-muted" : accentText[accent],
        )}
      >
        {disabled ? disabledLabel : busy ? "…" : actionLabel}
      </span>
    </>
  );

  const layout =
    "flex w-full flex-col rounded-sm border px-6 py-5 text-left sm:flex-row sm:items-center sm:justify-between";

  if (disabled) {
    return (
      <div
        className={cn(
          layout,
          "border-lane/60 bg-asphalt-raised/50 opacity-60",
        )}
      >
        {body}
      </div>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          layout,
          "border-lane bg-asphalt-raised transition-colors",
          accentHover[accent],
        )}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={cn(
        layout,
        "border-lane bg-asphalt-raised transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        accentHover[accent],
      )}
    >
      {body}
    </button>
  );
}
