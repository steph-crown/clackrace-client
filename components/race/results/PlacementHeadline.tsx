import { placeOrdinal, podiumTier } from "@/lib/race/placement";
import { ConfettiBurst } from "./ConfettiBurst";
import { TrophyIcon } from "./TrophyIcon";

type PlacementHeadlineProps = {
  placement: number;
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
      <h1 className="font-heading text-4xl font-bold uppercase tracking-wide text-chalk sm:text-5xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-chalk-muted">
        {ordinal} this race
      </p>
    </div>
  );
}
