import { describe, expect, it } from "vitest";
import {
  applyBackspace,
  applyKey,
  computeAccuracy,
  computeWpm,
  createTypingState,
  progressOf,
  reconcileTyped,
} from "./engine";

describe("typing engine", () => {
  it("advances on correct keys and records keystrokes", () => {
    let s = createTypingState("hi");
    s = applyKey(s, "h", 1000);
    s = applyKey(s, "i", 1100);
    expect(s.correctIndex).toBe(2);
    expect(s.finishedAtMs).toBe(1100);
    expect(s.keystrokes).toHaveLength(2);
    expect(progressOf(s)).toBe(1);
  });

  it("blocks progress on wrong keys until backspace", () => {
    let s = createTypingState("ab");
    s = applyKey(s, "x", 1000);
    expect(s.correctIndex).toBe(0);
    expect(s.mistakes).toBe(1);
    expect(s.typed).toBe("x");
    s = applyBackspace(s);
    expect(s.typed).toBe("");
    s = applyKey(s, "a", 1020);
    expect(s.correctIndex).toBe(1);
  });

  it("ignores keys after finish", () => {
    let s = createTypingState("a");
    s = applyKey(s, "a", 1000);
    const frozen = applyKey(s, "b", 1010);
    expect(frozen).toBe(s);
  });

  it("reconcileTyped applies multi-char buffers", () => {
    let s = createTypingState("abc");
    s = reconcileTyped(s, "ab", 2000);
    expect(s.correctIndex).toBe(2);
    s = reconcileTyped(s, "a", 2010);
    expect(s.correctIndex).toBe(1);
  });

  it("computeWpm / computeAccuracy edge cases", () => {
    expect(computeWpm(0, 1000, 2000)).toBe(0);
    expect(computeWpm(10, 1000, 1000)).toBe(0);
    expect(computeWpm(5, 1000, 61_000)).toBe(1);
    expect(computeAccuracy(0, 0)).toBe(100);
    expect(computeAccuracy(9, 10)).toBe(90);
  });
});
