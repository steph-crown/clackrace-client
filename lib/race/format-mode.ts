/** User-facing race mode labels (never expose raw DB mode strings). */
export function formatMode(mode: string): string {
  switch (mode) {
    case "solo_cpu":
      return "Race CPU";
    case "solo_ghost":
      return "Beat your best";
    case "public":
    case "public_multiplayer":
      return "Open Race";
    case "matchmade":
    case "quick_race":
      return "Quick Race";
    case "challenge":
    case "direct_challenge":
      return "Challenge";
    default:
      return mode.replaceAll("_", " ");
  }
}
