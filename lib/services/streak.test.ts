import { describe, it, expect, vi } from "vitest";

// streak.ts imports the Prisma singleton at module load; stub it so these unit
// tests stay hermetic (calculateStreakFromDates itself never touches the DB).
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { calculateStreakFromDates } from "@/lib/services/streak";
import {
  getTodayUtcString,
  parseUtcDate,
  toUtcDateString,
} from "@/lib/utils/date";

/** YYYY-MM-DD for `n` days before today (UTC). */
function daysAgo(n: number): string {
  const d = parseUtcDate(getTodayUtcString());
  d.setUTCDate(d.getUTCDate() - n);
  return toUtcDateString(d);
}

describe("calculateStreakFromDates — empty / single", () => {
  it("returns zeros for no logs", () => {
    expect(calculateStreakFromDates([])).toEqual({
      currentStreak: 0,
      longestStreak: 0,
    });
  });

  it("counts a single log made today", () => {
    expect(calculateStreakFromDates([daysAgo(0)])).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it("keeps the current streak alive if the last log was yesterday", () => {
    expect(calculateStreakFromDates([daysAgo(1)]).currentStreak).toBe(1);
  });
});

describe("calculateStreakFromDates — current streak", () => {
  it("counts consecutive days ending today", () => {
    const result = calculateStreakFromDates([daysAgo(2), daysAgo(1), daysAgo(0)]);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
  });

  it("is 0 when the most recent log is older than yesterday", () => {
    expect(calculateStreakFromDates([daysAgo(5), daysAgo(4)]).currentStreak).toBe(0);
  });

  it("only counts the consecutive tail, not earlier isolated days", () => {
    // gap at day-3, then a 2-day run ending today
    const result = calculateStreakFromDates([daysAgo(3), daysAgo(1), daysAgo(0)]);
    expect(result.currentStreak).toBe(2);
  });

  it("ignores duplicate dates", () => {
    expect(
      calculateStreakFromDates([daysAgo(0), daysAgo(0), daysAgo(1)]).currentStreak
    ).toBe(2);
  });
});

describe("calculateStreakFromDates — longest streak", () => {
  it("finds the longest run regardless of recency", () => {
    const dates = [
      "2020-01-01",
      "2020-01-02",
      "2020-01-03", // run of 3
      "2020-01-10", // gap
      "2020-01-11", // run of 2
    ];
    const result = calculateStreakFromDates(dates);
    expect(result.longestStreak).toBe(3);
    expect(result.currentStreak).toBe(0); // all far in the past
  });

  it("handles unsorted input by sorting first", () => {
    expect(
      calculateStreakFromDates(["2020-01-03", "2020-01-01", "2020-01-02"]).longestStreak
    ).toBe(3);
  });

  it("treats a fully broken history as max run of 1", () => {
    expect(
      calculateStreakFromDates(["2020-01-01", "2020-01-05", "2020-01-09"]).longestStreak
    ).toBe(1);
  });
});
