import { describe, it, expect } from "vitest";
import {
  toUtcDateString,
  parseUtcDate,
  getDaysDifference,
  isNextDay,
  normalizeToUtcMidnight,
  toDateInputValue,
} from "@/lib/utils/date";

describe("toUtcDateString", () => {
  it("formats a Date as YYYY-MM-DD in UTC", () => {
    expect(toUtcDateString(new Date("2026-03-15T10:30:00Z"))).toBe("2026-03-15");
  });

  it("uses UTC, not local time, near day boundaries", () => {
    // 23:30 UTC is still the same UTC day regardless of local offset
    expect(toUtcDateString(new Date("2026-03-15T23:30:00Z"))).toBe("2026-03-15");
  });
});

describe("parseUtcDate", () => {
  it("parses YYYY-MM-DD to a UTC-midnight Date", () => {
    const d = parseUtcDate("2026-03-15");
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(2); // March, 0-indexed
    expect(d.getUTCDate()).toBe(15);
    expect(d.getUTCHours()).toBe(0);
  });

  it("round-trips with toUtcDateString", () => {
    expect(toUtcDateString(parseUtcDate("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("isNextDay", () => {
  it("returns true for consecutive days", () => {
    expect(isNextDay("2026-03-15", "2026-03-16")).toBe(true);
  });

  it("returns true across a month boundary", () => {
    expect(isNextDay("2026-02-28", "2026-03-01")).toBe(true); // 2026 not leap
  });

  it("returns false for a gap of two days", () => {
    expect(isNextDay("2026-03-15", "2026-03-17")).toBe(false);
  });

  it("returns false for the same day", () => {
    expect(isNextDay("2026-03-15", "2026-03-15")).toBe(false);
  });

  it("returns false when b is before a", () => {
    expect(isNextDay("2026-03-16", "2026-03-15")).toBe(false);
  });
});

describe("getDaysDifference", () => {
  it("counts whole days between two dates", () => {
    expect(
      getDaysDifference(new Date("2026-03-15T00:00:00Z"), new Date("2026-03-20T00:00:00Z"))
    ).toBe(5);
  });

  it("is order-independent (absolute value)", () => {
    expect(
      getDaysDifference(new Date("2026-03-20T00:00:00Z"), new Date("2026-03-15T00:00:00Z"))
    ).toBe(5);
  });

  it("ignores the time component", () => {
    expect(
      getDaysDifference(new Date("2026-03-15T23:59:00Z"), new Date("2026-03-16T00:01:00Z"))
    ).toBe(1);
  });
});

describe("normalizeToUtcMidnight", () => {
  it("zeroes the time portion in UTC", () => {
    const d = normalizeToUtcMidnight(new Date("2026-03-15T18:45:30Z"));
    expect(d.getUTCHours()).toBe(0);
    expect(d.getUTCMinutes()).toBe(0);
    expect(toUtcDateString(d)).toBe("2026-03-15");
  });
});

describe("toDateInputValue", () => {
  it("slices an ISO string to YYYY-MM-DD", () => {
    expect(toDateInputValue("2026-03-15T10:00:00Z")).toBe("2026-03-15");
  });

  it("formats a Date object", () => {
    expect(toDateInputValue(new Date("2026-03-15T10:00:00Z"))).toBe("2026-03-15");
  });
});
