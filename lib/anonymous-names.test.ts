import { describe, expect, it } from "vitest";
import { ANONYMOUS_NAMES, pickSuggestedName } from "./anonymous-names";

describe("pickSuggestedName", () => {
  it("prefers untaken pool names", () => {
    const taken = ANONYMOUS_NAMES.slice(0, -1);
    const name = pickSuggestedName([...taken]);
    expect(name).toBe(ANONYMOUS_NAMES[ANONYMOUS_NAMES.length - 1]);
  });

  it("still returns a pool name when all taken", () => {
    expect(ANONYMOUS_NAMES).toContain(pickSuggestedName([...ANONYMOUS_NAMES]));
  });
});
