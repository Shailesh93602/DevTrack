import { describe, expect, it } from "vitest";

import { formatElapsed } from "@/lib/utils/elapsed";

const START = new Date("2026-10-24T10:00:00.000Z");

describe("formatElapsed", () => {
  it("formats hours, minutes and seconds with zero padding", () => {
    const now = START.getTime() + (2 * 3600 + 5 * 60 + 9) * 1000 + 999;
    expect(formatElapsed(START, now)).toBe("02:05:09");
  });

  it("accepts the ISO string a serialized session carries", () => {
    expect(formatElapsed(START.toISOString(), START.getTime() + 61_000)).toBe(
      "00:01:01"
    );
  });

  it("never goes negative when the clock is behind the start", () => {
    expect(formatElapsed(START, START.getTime() - 5_000)).toBe("00:00:00");
  });

  it("shows zero for an unparseable start instead of NaN", () => {
    expect(formatElapsed("not a date", Date.now())).toBe("00:00:00");
  });
});
