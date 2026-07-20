import { cn } from "@/lib/utils/cn";

export type CrownKind = "daily" | "overall";

const COPY: Record<
  CrownKind,
  { label: string; detail: string; aria: string; color: string }
> = {
  daily: {
    label: "Daily Champion",
    detail: "Top WPM today — holds until midnight UTC",
    aria: "Daily Champion",
    color: "text-signal",
  },
  overall: {
    label: "Overall Champion",
    detail: "All-time #1 peak WPM",
    aria: "Overall Champion",
    color: "text-cyan",
  },
};

type ChampionCrownProps = {
  kind: CrownKind;
  className?: string;
  /** Slightly larger mark for page headers. */
  size?: "sm" | "md";
};

/** Hoverable crown mark for Daily / Overall champion status. */
export function ChampionCrown({
  kind,
  className,
  size = "sm",
}: ChampionCrownProps) {
  const copy = COPY[kind];
  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center",
        copy.color,
        className,
      )}
      aria-label={copy.aria}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn(
          size === "md" ? "h-6 w-6" : "h-4 w-4",
          "fill-current drop-shadow-sm",
        )}
      >
        <path d="M3.5 8.5 7 12l5-7 5 7 3.5-3.5V18H3.5V8.5Z" />
        <path d="M5 19h14v1.5H5V19Z" opacity="0.85" />
      </svg>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[14rem] -translate-x-1/2 rounded-sm border border-lane bg-asphalt-raised px-2.5 py-1.5 text-left opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span
          className={cn(
            "block font-heading text-[10px] font-semibold uppercase tracking-wider",
            copy.color,
          )}
        >
          {copy.label}
        </span>
        <span className="mt-0.5 block text-[10px] leading-snug text-chalk-muted">
          {copy.detail}
        </span>
      </span>
    </button>
  );
}

type ChampionCrownsProps = {
  daily?: boolean;
  overall?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function ChampionCrowns({
  daily,
  overall,
  size = "sm",
  className,
}: ChampionCrownsProps) {
  if (!daily && !overall) return null;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {daily ? <ChampionCrown kind="daily" size={size} /> : null}
      {overall ? <ChampionCrown kind="overall" size={size} /> : null}
    </span>
  );
}
