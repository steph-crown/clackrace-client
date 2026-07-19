import type { PodiumTier } from "@/lib/race/placement";
import { cn } from "@/lib/utils/cn";

type TrophyIconProps = {
  tier: NonNullable<PodiumTier>;
  className?: string;
};

/** Metallic-ish fills so silver/gold/bronze read clearly (not flat chalk). */
const fill: Record<NonNullable<PodiumTier>, { body: string; shine: string }> = {
  gold: { body: "#f5c542", shine: "#ffe9a0" },
  silver: { body: "#c0c7d4", shine: "#f2f5fa" },
  bronze: { body: "#cd7f32", shine: "#e8b87a" },
};

export function TrophyIcon({ tier, className }: TrophyIconProps) {
  const { body, shine } = fill[tier];
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-16 w-16 sm:h-20 sm:w-20", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`trophy-${tier}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={shine} />
          <stop offset="45%" stopColor={body} />
          <stop offset="100%" stopColor={body} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M18 14h28v10c0 10-6 16-14 18v6h8v4H24v-4h8v-6c-8-2-14-8-14-18V14z"
        fill={`url(#trophy-${tier})`}
      />
      <path
        d="M18 18H12c0 8 4 12 8 14M46 18h6c0 8-4 12-8 14"
        fill="none"
        stroke={body}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="22" y="52" width="20" height="4" rx="1" fill={body} />
      <rect
        x="26"
        y="48"
        width="12"
        height="4"
        rx="1"
        fill={shine}
        opacity="0.9"
      />
    </svg>
  );
}
