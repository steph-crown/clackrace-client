import { describe, expect, it } from "vitest";
import { formatMode } from "./format-mode";

describe("formatMode", () => {
  it("uses product names (never room jargon)", () => {
    expect(formatMode("solo_cpu")).toBe("Race CPU");
    expect(formatMode("solo_ghost")).toBe("Beat your best");
    expect(formatMode("public")).toBe("Open Race");
    expect(formatMode("public_multiplayer")).toBe("Open Race");
    expect(formatMode("matchmade")).toBe("Quick Race");
    expect(formatMode("quick_race")).toBe("Quick Race");
    expect(formatMode("challenge")).toBe("Challenge");
  });
});
