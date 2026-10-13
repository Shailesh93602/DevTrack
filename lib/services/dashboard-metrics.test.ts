import { describe, it, expect } from "vitest";
import {
  calculateConsistencyScore,
  calculateDaysSinceLastLog,
  calculatePeakTime,
  calculateTrends,
  toDifficultyDistribution,
} from "@/lib/services/dashboard-metrics";

const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

describe("toDifficultyDistribution", () => {
  it("maps groupBy rows onto easy/medium/hard and ignores unknown levels", () => {
    expect(
      toDifficultyDistribution([
        { difficulty: "HARD", _count: 2 },
        { difficulty: "EASY", _count: 5 },
        { difficulty: "LEGENDARY", _count: 9 },
      ])
    ).toEqual({ easy: 5, medium: 0, hard: 2 });
  });
});

describe("calculateConsistencyScore", () => {
  // 2026-03-18 is a Wednesday; its UTC week starts Sunday 2026-03-15.
  const now = new Date("2026-03-18T12:00:00.000Z");

  it("scores 25 when only the current week meets the five-log target", () => {
    const logs = ["15", "16", "17", "18", "14"].map((day) => ({
      date: utc(`2026-03-${day}`),
    }));
    // The 14th falls in the previous week, so this week has four logs only.
    expect(calculateConsistencyScore(logs, now)).toBe(0);

    logs.push({ date: utc("2026-03-19") });
    expect(calculateConsistencyScore(logs, now)).toBe(25);
  });

  it("scores 0 with no logs", () => {
    expect(calculateConsistencyScore([], now)).toBe(0);
  });
});

describe("calculateTrends", () => {
  it("splits this week and last week at the UTC Sunday boundary", () => {
    const today = utc("2026-03-18");
    const problems = [
      { solvedAt: utc("2026-03-15") },
      { solvedAt: utc("2026-03-14") },
      { solvedAt: utc("2026-03-08") },
      { solvedAt: utc("2026-03-07") },
    ];
    const logs = [{ date: utc("2026-03-16") }, { date: utc("2026-03-10") }];
    expect(calculateTrends(problems, logs, today)).toEqual({
      problemsThisWeek: 1,
      problemsLastWeek: 2,
      logsThisWeek: 1,
      logsLastWeek: 1,
    });
  });
});

describe("calculatePeakTime", () => {
  const at = (hour: number) => {
    const created = new Date(2026, 2, 18, hour, 30);
    return { createdAt: created };
  };

  it("returns null when there are no logs", () => {
    expect(calculatePeakTime([])).toBeNull();
  });

  it("picks the busiest local hour, earliest on a tie, with a 12-hour label", () => {
    expect(calculatePeakTime([at(21), at(9), at(21), at(9)])).toEqual({
      hour: 9,
      count: 2,
      label: "9 AM",
    });
    expect(calculatePeakTime([at(0)])?.label).toBe("12 AM");
    expect(calculatePeakTime([at(12)])?.label).toBe("12 PM");
  });
});

describe("calculateDaysSinceLastLog", () => {
  it("is null without a log and 0 for a log made today", () => {
    expect(calculateDaysSinceLastLog(null)).toBeNull();
    expect(calculateDaysSinceLastLog({ date: new Date() })).toBe(0);
  });

  it("counts whole calendar days back to the last log", () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    expect(calculateDaysSinceLastLog({ date: threeDaysAgo })).toBe(3);
  });
});
