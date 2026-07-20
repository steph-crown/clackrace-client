import { cn } from "@/lib/utils/cn";

export type CrownKind = "daily" | "overall";

const BASE: Record<
  CrownKind,
  { label: string; fallbackDetail: string; aria: string; color: string }
> = {
  daily: {
    label: "Daily Champion",
    fallbackDetail: "Top WPM today — holds until midnight UTC",
    aria: "Daily Champion",
    color: "text-signal",
  },
  overall: {
    label: "Overall Champion",
    fallbackDetail: "All-time #1 peak WPM",
    aria: "Overall Champion",
    color: "text-cyan",
  },
};

type ChampionCrownProps = {
  kind: CrownKind;
  /** Peak WPM that earned the crown — shown in the tooltip when known. */
  wpm?: number | null;
  className?: string;
  size?: "sm" | "md";
};

/** Hoverable crown mark for Daily / Overall champion status. */
export function ChampionCrown({
  kind,
  wpm,
  className,
  size = "sm",
}: ChampionCrownProps) {
  const copy = BASE[kind];
  const detail =
    wpm != null && wpm > 0
      ? `${Math.round(wpm)} WPM · ${
          kind === "daily"
            ? "holds until midnight UTC"
            : "all-time peak"
        }`
      : copy.fallbackDetail;

  return (
    <button
      type="button"
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center",
        copy.color,
        className,
      )}
      aria-label={
        wpm != null && wpm > 0
          ? `${copy.aria}, ${Math.round(wpm)} WPM`
          : copy.aria
      }
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
          {detail}
        </span>
      </span>
    </button>
  );
}
