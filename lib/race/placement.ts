/** Ordinal label for race place (1 → "1st"). */
export function placeOrdinal(place: number): string {
  const n = Math.floor(place);
  if (n < 1) return String(place);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export type PodiumTier = "gold" | "silver" | "bronze" | null;

export function podiumTier(placement: number): PodiumTier {
  if (placement === 1) return "gold";
  if (placement === 2) return "silver";
  if (placement === 3) return "bronze";
  return null;
}

/** Results audio cue category. */
export function resultsAudioCue(
  placement: number,
): "win" | "podium" | "finish" {
  if (placement === 1) return "win";
  if (placement === 2 || placement === 3) return "podium";
  return "finish";
}
