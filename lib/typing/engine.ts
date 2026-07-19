export type KeystrokeEntry = {
  charIndex: number;
  timestampMs: number;
};

export type TypingState = {
  passage: string;
  /** Full typed buffer (may include trailing wrong chars — hero-style). */
  typed: string;
  /** Longest correct prefix length. */
  correctIndex: number;
  /** Wrong keystrokes (not backspaces). */
  mistakes: number;
  /** Correct + wrong keystrokes. */
  attempts: number;
  startedAtMs: number | null;
  finishedAtMs: number | null;
  keystrokes: KeystrokeEntry[];
};

export function createTypingState(passage: string): TypingState {
  return {
    passage,
    typed: "",
    correctIndex: 0,
    mistakes: 0,
    attempts: 0,
    startedAtMs: null,
    finishedAtMs: null,
    keystrokes: [],
  };
}

function correctPrefixLen(passage: string, typed: string): number {
  let n = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] !== passage[i]) break;
    n++;
  }
  return n;
}

/**
 * Apply a typed character. Wrong chars append (shown red) and block progress
 * until backspaced — same model as the landing hero strip.
 */
export function applyKey(
  state: TypingState,
  key: string,
  nowMs: number,
): TypingState {
  if (state.finishedAtMs !== null) return state;
  if (key.length !== 1) return state;
  // Cap runaway mistype buffer a bit past the passage
  if (state.typed.length >= state.passage.length + 8) return state;

  const nextTyped = state.typed + key;
  const expected = state.passage[state.typed.length];
  const isCorrect = expected !== undefined && key === expected;
  const attempts = state.attempts + 1;
  const mistakes = isCorrect ? state.mistakes : state.mistakes + 1;
  const startedAtMs = state.startedAtMs ?? (isCorrect ? nowMs : state.startedAtMs);
  const correctIndex = correctPrefixLen(state.passage, nextTyped);

  let keystrokes = state.keystrokes;
  if (isCorrect && correctIndex > state.correctIndex && startedAtMs != null) {
    keystrokes = [
      ...keystrokes,
      {
        charIndex: correctIndex - 1,
        timestampMs: Math.round(nowMs - startedAtMs),
      },
    ];
  }

  const finishedAtMs =
    correctIndex >= state.passage.length &&
    nextTyped.length === state.passage.length
      ? nowMs
      : state.finishedAtMs;

  return {
    ...state,
    typed: nextTyped,
    correctIndex,
    attempts,
    mistakes,
    startedAtMs: startedAtMs ?? state.startedAtMs,
    finishedAtMs,
    keystrokes,
  };
}

export function applyBackspace(state: TypingState): TypingState {
  if (state.finishedAtMs !== null) return state;
  if (state.typed.length === 0) return state;

  const nextTyped = state.typed.slice(0, -1);
  const correctIndex = correctPrefixLen(state.passage, nextTyped);
  // Drop keystroke entries past the new correct prefix
  const keystrokes = state.keystrokes.filter((k) => k.charIndex < correctIndex);

  return {
    ...state,
    typed: nextTyped,
    correctIndex,
    keystrokes,
    finishedAtMs: null,
  };
}

/**
 * Sync engine to a full typed buffer (mobile `input` / `onChange` path).
 * Uses refs of applyKey/applyBackspace so multi-char updates stay consistent.
 */
export function reconcileTyped(
  state: TypingState,
  nextTyped: string,
  nowMs: number,
): TypingState {
  if (state.finishedAtMs !== null) return state;

  let s = state;
  const capped = nextTyped.slice(0, state.passage.length + 8);

  while (s.typed.length > 0 && !capped.startsWith(s.typed)) {
    s = applyBackspace(s);
  }
  while (s.typed.length > capped.length) {
    s = applyBackspace(s);
  }
  for (let i = s.typed.length; i < capped.length; i++) {
    s = applyKey(s, capped[i]!, nowMs);
  }
  return s;
}

export function progressOf(state: TypingState): number {
  if (state.passage.length === 0) return 0;
  return state.correctIndex / state.passage.length;
}

export function computeWpm(
  correctChars: number,
  startedAtMs: number | null,
  nowMs: number,
): number {
  if (!startedAtMs || correctChars === 0) return 0;
  const minutes = (nowMs - startedAtMs) / 60000;
  if (minutes <= 0) return 0;
  return correctChars / 5 / minutes;
}

export function computeAccuracy(correctChars: number, attempts: number): number {
  if (attempts <= 0) return 100;
  return (correctChars / attempts) * 100;
}
