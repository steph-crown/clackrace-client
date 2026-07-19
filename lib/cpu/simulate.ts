export type CpuDifficulty = "easy" | "medium" | "hard" | "expert";

export type CpuRacer = {
  id: string;
  name: string;
  difficulty: CpuDifficulty;
  /** Target average WPM (with noise around it). */
  targetWpm: number;
  bodyColor: string;
  accentColor: string;
  correctIndex: number;
  finishedAtMs: number | null;
};

/**
 * Stepped bands — medium→hard was a ~30 WPM cliff; hard is watered down,
 * and expert owns the old hard ceiling.
 */
const TARGET_WPM: Record<CpuDifficulty, [number, number]> = {
  easy: [30, 45],
  medium: [50, 68],
  hard: [70, 88],
  expert: [90, 112],
};

const CPU_NAMES = [
  "CPU Nitro",
  "CPU Drift",
  "CPU Blitz",
  "CPU Ember",
  "CPU Comet",
  "CPU Turbo",
  "CPU Ghost",
];

const CPU_COLORS = [
  { body: "#ff3d8a", accent: "#e8e6e1" },
  { body: "#f5c518", accent: "#0c0e12" },
  { body: "#7c6cff", accent: "#e8e6e1" },
  { body: "#ff7a45", accent: "#0c0e12" },
  { body: "#3dd68c", accent: "#0c0e12" },
  { body: "#4da3ff", accent: "#e8e6e1" },
  { body: "#e8e6e1", accent: "#ff3d8a" },
];

function randBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function createCpuRacers(
  difficulty: CpuDifficulty,
  count: number,
): CpuRacer[] {
  const n = Math.min(7, Math.max(1, count));
  const [lo, hi] = TARGET_WPM[difficulty];
  return Array.from({ length: n }, (_, i) => {
    const colors = CPU_COLORS[i % CPU_COLORS.length]!;
    return {
      id: `cpu-${i}`,
      name: CPU_NAMES[i % CPU_NAMES.length]!,
      difficulty,
      targetWpm: randBetween(lo, hi),
      bodyColor: colors.body,
      accentColor: colors.accent,
      correctIndex: 0,
      finishedAtMs: null,
    };
  });
}

/**
 * Advance CPU progress for one frame.
 * chars/sec ≈ (wpm * 5) / 60, with per-frame noise and occasional hesitation.
 */
export function tickCpu(
  cpu: CpuRacer,
  passageLength: number,
  dtMs: number,
  raceElapsedMs: number,
): CpuRacer {
  if (cpu.finishedAtMs !== null) return cpu;
  if (passageLength <= 0) return cpu;

  const hesitate =
    Math.sin(raceElapsedMs / 700 + cpu.targetWpm) > 0.92 ? 0.15 : 1;
  const jitter = 0.85 + Math.random() * 0.3;
  const charsPerMs = (cpu.targetWpm * 5) / 60000;
  const delta = charsPerMs * dtMs * hesitate * jitter;
  const next = Math.min(passageLength, cpu.correctIndex + delta);
  const finishedAtMs = next >= passageLength ? raceElapsedMs : null;

  return {
    ...cpu,
    correctIndex: next,
    finishedAtMs,
  };
}
