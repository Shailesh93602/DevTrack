import { describe, it, expect } from "vitest";
import { calculateWeeklyStats } from "@/lib/services/weekly-progress";

describe("calculateWeeklyStats", () => {
  const now = new Date(2026, 2, 18, 15, 0);

  it("returns the requested number of weeks, oldest first, ending today", () => {
    const weeks = calculateWeeklyStats([], now, 3);
    expect(weeks).toHaveLength(3);
    expect(weeks.map((week) => week.week)).toEqual([
      "Feb 26-Mar 4",
      "Mar 5-11",
      "Mar 12-18",
    ]);
    expect(weeks.every((week) => week.count === 0)).toBe(true);
  });

  it("counts each problem into the week it was solved, split by difficulty", () => {
    const weeks = calculateWeeklyStats(
      [
        { solvedAt: new Date(2026, 2, 18, 9), difficulty: "HARD" },
        { solvedAt: new Date(2026, 2, 12, 0, 0), difficulty: "EASY" },
        { solvedAt: new Date(2026, 2, 11, 23, 59), difficulty: "MEDIUM" },
        { solvedAt: new Date(2026, 1, 1), difficulty: "EASY" },
      ],
      now,
      2
    );
    expect(weeks[1]).toMatchObject({ count: 2, easy: 1, medium: 0, hard: 1 });
    expect(weeks[0]).toMatchObject({ count: 1, easy: 0, medium: 1, hard: 0 });
  });
});
