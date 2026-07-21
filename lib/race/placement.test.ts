import { describe, expect, it } from "vitest";
import {
  placeOrdinal,
  podiumTier,
  resultsAudioCue,
} from "./placement";

describe("placement helpers", () => {
  it("ordinals", () => {
    expect(placeOrdinal(1)).toBe("1st");
    expect(placeOrdinal(2)).toBe("2nd");
    expect(placeOrdinal(3)).toBe("3rd");
    expect(placeOrdinal(4)).toBe("4th");
    expect(placeOrdinal(11)).toBe("11th");
    expect(placeOrdinal(21)).toBe("21st");
  });

  it("podium + audio cues", () => {
    expect(podiumTier(1)).toBe("gold");
    expect(podiumTier(2)).toBe("silver");
    expect(podiumTier(3)).toBe("bronze");
    expect(podiumTier(4)).toBeNull();
    expect(resultsAudioCue(1)).toBe("win");
    expect(resultsAudioCue(2)).toBe("podium");
    expect(resultsAudioCue(4)).toBe("finish");
  });
});
