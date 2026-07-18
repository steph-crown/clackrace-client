export type PassageDifficulty = "easy" | "medium" | "hard";

export type Passage = {
  id: string;
  text: string;
  difficulty: PassageDifficulty;
  source: "official";
};

/** Static fallback when the passages API is unavailable (Phase 2 / offline). */
export const STATIC_PASSAGES: Passage[] = [
  {
    id: "static-easy-1",
    difficulty: "easy",
    source: "official",
    text: "The quick brown fox jumps over the lazy dog near the track.",
  },
  {
    id: "static-easy-2",
    difficulty: "easy",
    source: "official",
    text: "Type each word with care and watch your car pull ahead of the pack.",
  },
  {
    id: "static-medium-1",
    difficulty: "medium",
    source: "official",
    text: "ClackRace rewards clean speed over messy bursts. Keep your fingers light, breathe between phrases, and let accuracy pull you into first place before the checkered flag drops.",
  },
  {
    id: "static-medium-2",
    difficulty: "medium",
    source: "official",
    text: "Night asphalt, neon lanes, and a keyboard that sounds like thunder. Every correct character moves the wheels. Every mistake stalls the engine for a heartbeat.",
  },
  {
    id: "static-hard-1",
    difficulty: "hard",
    source: "official",
    text: "Championship pacing demands composure under pressure: punctuation, capitalization, and odd letter pairs all arrive without warning. The leaders do not flinch; they settle into rhythm and convert keystrokes into meters of track until the finish line is inevitable.",
  },
  {
    id: "static-hard-2",
    difficulty: "hard",
    source: "official",
    text: "When the countdown hits go, hesitation costs placement. Trust muscle memory, ignore the rearview mirror of mistakes already made, and chase the ghost of your personal best through every turn of the passage.",
  },
];

export function pickPassage(
  difficulty: PassageDifficulty,
  pool: Passage[] = STATIC_PASSAGES,
): Passage {
  const matches = pool.filter((p) => p.difficulty === difficulty);
  const list = matches.length > 0 ? matches : pool;
  return list[Math.floor(Math.random() * list.length)]!;
}
