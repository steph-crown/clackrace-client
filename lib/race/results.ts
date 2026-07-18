import type { CpuRacer } from "@/lib/cpu/simulate";
import { computeAccuracy, type TypingState } from "@/lib/typing/engine";

export type RacerResult = {
  id: string;
  name: string;
  isYou: boolean;
  isCpu: boolean;
  wpm: number;
  accuracy: number;
  progress: number;
  finishedAtMs: number | null;
  placement: number;
  bodyColor: string;
};

function wpmFromChars(chars: number, durationMs: number): number {
  if (durationMs <= 0 || chars <= 0) return 0;
  return chars / 5 / (durationMs / 60000);
}

export function buildSoloResults(
  typing: TypingState,
  cpus: CpuRacer[],
  raceElapsedMs: number,
  /** Elapsed ms from GO → player finish (for placement). WPM still uses typing duration. */
  playerFinishElapsedMs: number | null = null,
): RacerResult[] {
  const passageLen = typing.passage.length;

  const typingDuration =
    typing.finishedAtMs != null && typing.startedAtMs != null
      ? typing.finishedAtMs - typing.startedAtMs
      : raceElapsedMs;

  const player: Omit<RacerResult, "placement"> = {
    id: "you",
    name: "You",
    isYou: true,
    isCpu: false,
    wpm: wpmFromChars(typing.correctIndex, typingDuration),
    accuracy: computeAccuracy(typing.correctIndex, typing.attempts),
    progress: passageLen ? typing.correctIndex / passageLen : 0,
    finishedAtMs: playerFinishElapsedMs,
    bodyColor: "var(--cyan)",
  };

  const cpuResults: Omit<RacerResult, "placement">[] = cpus.map((cpu) => {
    const progress = passageLen ? cpu.correctIndex / passageLen : 0;
    const duration = cpu.finishedAtMs ?? raceElapsedMs;
    const chars = Math.floor(cpu.correctIndex);
    return {
      id: cpu.id,
      name: cpu.name,
      isYou: false,
      isCpu: true,
      wpm: wpmFromChars(chars, duration),
      accuracy: 100,
      progress,
      finishedAtMs: cpu.finishedAtMs,
      bodyColor: cpu.bodyColor,
    };
  });

  const ranked = [player, ...cpuResults].sort((a, b) => {
    const aFin = a.finishedAtMs;
    const bFin = b.finishedAtMs;
    if (aFin != null && bFin != null) return aFin - bFin;
    if (aFin != null) return -1;
    if (bFin != null) return 1;
    return b.progress - a.progress;
  });

  return ranked.map((r, i) => ({ ...r, placement: i + 1 }));
}
