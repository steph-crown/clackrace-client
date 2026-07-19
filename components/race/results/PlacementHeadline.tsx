import { placeOrdinal, podiumTier } from "@/lib/race/placement";
import { cn } from "@/lib/utils/cn";
import { ConfettiBurst } from "./ConfettiBurst";
import { TrophyIcon } from "./TrophyIcon";

type PlacementHeadlineProps = {
  placement: number;
};

const titleClass: Record<"gold" | "silver" | "bronze", string> = {
  gold: "text-signal",
  silver: "text-[#d8dce4]",
  bronze: "text-[#e0a36a]",
};

export function PlacementHeadline({ placement }: PlacementHeadlineProps) {
  const tier = podiumTier(placement);
  const ordinal = placeOrdinal(placement);

  let title: string;
  if (placement === 1) title = "You win";
  else if (placement === 2) title = "Silver finish";
  else if (placement === 3) title = "Bronze finish";
  else title = `${ordinal} place`;

  return (
    <div className="relative text-center">
      <ConfettiBurst active={placement === 1} />
      {tier ? (
        <div className="mb-3 flex justify-center">
          <TrophyIcon tier={tier} />
        </div>
      ) : null}
      <h1
        className={cn(
          "font-heading text-4xl font-bold uppercase tracking-wide sm:text-5xl",
          tier ? titleClass[tier] : "text-chalk",
        )}
      >
        {title}
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">{ordinal} place</p>
    </div>
  );
}
