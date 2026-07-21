export type PassageDifficulty = "easy" | "medium" | "hard";

export type Passage = {
  id: string;
 text: string;
  difficulty: PassageDifficulty;
  source: "official";
};

/**
 * Static fallback when the passages API is unavailable.
 * Mirrors v1 policy: medium + hard only (no easy race text).
 */
export const STATIC_PASSAGES: Passage[] = [
  {
    id: "official-medium-01",
    difficulty: "medium",
    source: "official",
 text: "ClackRace rewards clean speed over messy bursts. Keep your fingers light, breathe between phrases, and let accuracy pull you into first place before the checkered flag drops.",
  },
  {
    id: "official-medium-02",
    difficulty: "medium",
    source: "official",
 text: "Night asphalt, neon lanes, and a keyboard that sounds like thunder. Every correct character moves the wheels. Every mistake stalls the engine for a heartbeat.",
  },
  {
    id: "official-medium-06",
    difficulty: "medium",
    source: "official",
 text: "Your car is only as fast as your accuracy. Spray wrong letters and you spend the race in reverse, tapping backspace while the pack slips past in a blur of color.",
  },
  {
    id: "official-medium-22",
    difficulty: "medium",
    source: "official",
 text: "Accuracy compounds. Ninety-eight percent feels almost perfect until you watch the leader open a gap on every recovery. Fix errors early; late backspaces cost more than pride.",
  },
  {
    id: "official-medium-36",
    difficulty: "medium",
    source: "official",
 text: "If you only remember one rule, remember this: backspace is cheaper early and expensive late. Clear the mistake, then resume the line like the interruption never happened.",
  },
  {
    id: "official-hard-01",
    difficulty: "hard",
    source: "official",
 text: "Championship pacing demands composure under pressure: punctuation, capitalization, and odd letter pairs all arrive without warning. The leaders do not flinch; they settle into rhythm and convert keystrokes into meters of track until the finish line is inevitable.",
  },
  {
    id: "official-hard-04",
    difficulty: "hard",
    source: "official",
 text: "Consider the semicolon: a tiny pause that ruins a streak if you expect a comma. Consider the apostrophe in it's and its. Small symbols decide big races more often than any dramatic final sprint across the last ten words.",
  },
  {
    id: "official-hard-09",
    difficulty: "hard",
    source: "official",
 text: "In the end the product is simple: type the passage, move the car, compare the numbers. Everything else - crowns, streaks, ratings, share cards - is scaffolding around that honest loop. Keep the loop sharp and the rest has somewhere real to stand.",
  },
];

export function pickPassage(
  difficulty: PassageDifficulty,
  pool: Passage[] = STATIC_PASSAGES,
): Passage {
  const want: PassageDifficulty =
    difficulty === "easy" ? "medium" : difficulty;
  const matches = pool.filter((p) => p.difficulty === want);
  const list = matches.length > 0 ? matches : pool.filter((p) => p.difficulty !== "easy");
  const fallback = list.length > 0 ? list : pool;
  return fallback[Math.floor(Math.random() * fallback.length)]!;
}
