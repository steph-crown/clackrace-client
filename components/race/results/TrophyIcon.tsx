import type { PodiumTier } from "@/lib/race/placement";
import { cn } from "@/lib/utils/cn";

type TrophyIconProps = {
  tier: NonNullable<PodiumTier>;
  className?: string;
};

const fill: Record<NonNullable<PodiumTier>, string> = {
  gold: "#f5c542",
  silver: "#c8c8c8",
  bronze: "#cd7f32",
};

/** Simple trophy / cup SVG for podium placements. */
export function TrophyIcon({ tier, className }: TrophyIconProps) {
  const color = fill[tier];
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("h-16 w-16 sm:h-20 sm:w-20", className)}
      aria-hidden
    >
      <path
        d="M18 14h28v10c0 10-6 16-14 18v6h8v4H24v-4h8v-6c-8-2-14-8-14-18V14z"
        fill={color}
      />
      <path
        d="M18 18H12c0 8 4 12 8 14M46 18h6c0 8-4 12-8 14"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="22" y="52" width="20" height="4" rx="1" fill={color} />
      <rect x="26" y="48" width="12" height="4" rx="1" fill={color} opacity="0.85" />
    </svg>
  );
}
