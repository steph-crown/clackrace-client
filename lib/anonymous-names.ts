export const ANONYMOUS_NAMES = [
  "Anonymous Racer",
  "Anonymous Nitro",
  "Anonymous Drifter",
  "Anonymous Turbo",
  "Anonymous Rookie",
  "Anonymous Ghost",
  "Anonymous Speedster",
  "Anonymous Throttle",
  "Anonymous Ace",
  "Anonymous Pitstop",
  "Anonymous Ridge",
  "Anonymous Ember",
  "Anonymous Blitz",
  "Anonymous Comet",
  "Anonymous Rally",
] as const;

/** Client suggestion only — server may reassign on collision. */
export function pickSuggestedName(taken: string[]): string {
  const takenSet = new Set(taken);
  const available = ANONYMOUS_NAMES.filter((n) => !takenSet.has(n));
  const pool = available.length > 0 ? available : [...ANONYMOUS_NAMES];
  return pool[Math.floor(Math.random() * pool.length)]!;
}
