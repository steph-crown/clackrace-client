import type { KeystrokeEntry } from "@/lib/typing/engine";

/** Progress 0–1 from replaying PB keystrokes against race elapsed ms. */
export function ghostProgressAt(
  strokes: KeystrokeEntry[],
  passageLength: number,
  elapsedMs: number,
): number {
  if (passageLength <= 0 || strokes.length === 0) return 0;
  let correct = 0;
  for (const s of strokes) {
    if (s.timestampMs <= elapsedMs) correct = s.charIndex + 1;
    else break;
  }
  return Math.min(1, correct / passageLength);
}
