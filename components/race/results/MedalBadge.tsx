import { cn } from "@/lib/utils/cn";
import type { PodiumTier } from "@/lib/race/placement";

type MedalBadgeProps = {
  tier: PodiumTier;
  className?: string;
};

const tierClass: Record<NonNullable<PodiumTier>, string> = {
  gold: "border-signal/60 bg-signal/15 text-signal",
  silver: "border-[#c0c7d4]/70 bg-[#c0c7d4]/15 text-[#e8ecf2]",
  bronze: "border-[#cd7f32]/60 bg-[#cd7f32]/15 text-[#e0a36a]",
};

const tierLabel: Record<NonNullable<PodiumTier>, string> = {
  gold: "1st",
  silver: "2nd",
  bronze: "3rd",
};

export function MedalBadge({ tier, className }: MedalBadgeProps) {
  if (!tier) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-heading text-[10px] font-bold uppercase tracking-wider",
        tierClass[tier],
        className,
      )}
    >
      {tierLabel[tier]}
    </span>
  );
}
