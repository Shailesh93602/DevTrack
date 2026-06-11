import { describe, it, expect } from "vitest";
import {
  computeDeveloperScore,
  computeScoreFromAggregates,
} from "@/lib/services/scoring";
import type { ScoringInputs } from "@/types/scoring";

const ZERO: ScoringInputs = {
  currentStreak: 0,
  activeDaysLast30: 0,
  easyCount: 0,
  mediumCount: 0,
  hardCount: 0,
  completedMilestones: 0,
  completedProjects: 0,
  avgProblemsSolvedPerLog: 0,
};

describe("computeDeveloperScore", () => {
  it("scores all-zero inputs as 0 / Beginner", () => {
    const r = computeDeveloperScore(ZERO);
    expect(r.total).toBe(0);
    expect(r.grade).toBe("Beginner");
    expect(r.gradeIcon).toBe("🌱");
    expect(r.consistency.score).toBe(0);
    expect(r.dsa.score).toBe(0);
    expect(r.productivity.score).toBe(0);
    expect(typeof r.computedAt).toBe("string");
  });

  it("scores maxed inputs as 100 / Elite", () => {
    const r = computeDeveloperScore({
      ...ZERO,
      currentStreak: 30,
      activeDaysLast30: 22,
      hardCount: 50, // 50 × 4 = 200 weighted → maxes DSA
      completedMilestones: 10,
      completedProjects: 5,
      avgProblemsSolvedPerLog: 3,
    });
    expect(r.consistency.score).toBe(100);
    expect(r.dsa.score).toBe(100);
    expect(r.productivity.score).toBe(100);
    expect(r.total).toBe(100);
    expect(r.grade).toBe("Elite");
    expect(r.gradeIcon).toBe("🏆");
  });

  it("clamps every sub-score at its cap (no overflow above 100)", () => {
    const r = computeDeveloperScore({
      currentStreak: 999,
      activeDaysLast30: 999,
      easyCount: 9999,
      mediumCount: 9999,
      hardCount: 9999,
      completedMilestones: 999,
      completedProjects: 999,
      avgProblemsSolvedPerLog: 999,
    });
    expect(r.consistency.score).toBe(100);
    expect(r.dsa.score).toBe(100);
    expect(r.productivity.score).toBe(100);
    expect(r.total).toBe(100);
  });

  it("weights DSA difficulty (easy×1, medium×2, hard×4)", () => {
    const r = computeDeveloperScore({
      ...ZERO,
      easyCount: 10,
      mediumCount: 10,
      hardCount: 10, // 10 + 20 + 40 = 70 weighted points
    });
    expect(r.dsa.breakdown.weightedPoints).toBe(70);
    expect(r.dsa.score).toBe(35); // round(70/200 × 100)
    // only DSA contributes: total = round(0.35 × 35) = 12
    expect(r.total).toBe(12);
    expect(r.grade).toBe("Beginner");
  });

  it("applies composite weights and resolves the grade band", () => {
    // perfect consistency only → total = round(0.4 × 100) = 40 → Developing
    const r = computeDeveloperScore({
      ...ZERO,
      currentStreak: 30,
      activeDaysLast30: 22,
    });
    expect(r.consistency.score).toBe(100);
    expect(r.total).toBe(40);
    expect(r.grade).toBe("Developing");
    expect(r.gradeIcon).toBe("📈");
  });
});

describe("computeScoreFromAggregates", () => {
  it("counts active days within the 30-day window and averages all logs", () => {
    const thirtyDaysAgo = new Date("2026-01-01T00:00:00Z");
    const r = computeScoreFromAggregates({
      currentStreak: 10,
      windowLogs: [
        { date: new Date("2026-01-15T00:00:00Z"), problemsSolved: 2 }, // in window
        { date: new Date("2025-12-01T00:00:00Z"), problemsSolved: 4 }, // older
      ],
      thirtyDaysAgo,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      completedMilestones: 0,
      completedProjects: 0,
    });
    // 1 of 2 logs is within the window; avg uses both logs → (2+4)/2 = 3
    expect(r.consistency.breakdown.activeDaysLast30).toBe(1);
    expect(r.productivity.breakdown.avgProblemsSolvedPerLog).toBe(3);
  });

  it("handles an empty log window without dividing by zero", () => {
    const r = computeScoreFromAggregates({
      currentStreak: 0,
      windowLogs: [],
      thirtyDaysAgo: new Date("2026-01-01T00:00:00Z"),
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      completedMilestones: 0,
      completedProjects: 0,
    });
    expect(r.productivity.breakdown.avgProblemsSolvedPerLog).toBe(0);
    expect(r.total).toBe(0);
  });
});
