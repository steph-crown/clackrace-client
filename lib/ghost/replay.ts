/** Progress 0–1 from a PB keystroke log at elapsed race time. */
export function ghostProgressAt(
  strokes: { charIndex: number; timestampMs: number }[],
  passageLen: number,
  elapsedMs: number,
): number {
  if (passageLen <= 0 || strokes.length === 0) return 0;
  let correct = 0;
  for (const s of strokes) {
    if (s.timestampMs <= elapsedMs) correct = s.charIndex + 1;
    else break;
  }
  return Math.min(1, correct / passageLen);
}
