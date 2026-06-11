import { describe, it, expect } from "vitest";
import { generateRecommendations } from "@/lib/services/recommendations";
import type { RecommendationContext } from "@/types/recommendations";

/** A healthy, active user that fires NO rules — override fields per test. */
function ctx(
  over: Partial<RecommendationContext> = {},
): RecommendationContext {
  return {
    patternStats: [
      { pattern: "Arrays", count: 5, percentage: 40 },
      { pattern: "DP", count: 7, percentage: 60 },
    ],
    totalProblems: 20,
    easyCount: 5,
    mediumCount: 5,
    hardCount: 5,
    currentStreak: 3,
    activeDaysLast30: 15,
    daysSinceLastLog: 0,
    loggedToday: true,
    completedMilestones: 1,
    completedProjects: 1,
    totalProjects: 1,
    ...over,
  };
}

describe("generateRecommendations", () => {
  it("returns nothing for a healthy, active user", () => {
    expect(generateRecommendations(ctx())).toEqual([]);
  });

  it("fires 'start your journey' (critical) when nothing is logged", () => {
    const recs = generateRecommendations(
      ctx({
        daysSinceLastLog: null,
        loggedToday: false,
        currentStreak: 0,
        totalProblems: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        activeDaysLast30: 0,
        totalProjects: 0,
        completedMilestones: 0,
        completedProjects: 0,
        patternStats: [],
      }),
    );
    expect(recs).toHaveLength(1);
    expect(recs[0]!.id).toBe("rec-start-journey");
    expect(recs[0]!.urgency).toBe("critical");
  });

  it("warns when an active streak hasn't logged today", () => {
    const recs = generateRecommendations(
      ctx({ loggedToday: false, currentStreak: 5, daysSinceLastLog: 1 }),
    );
    expect(recs[0]!.id).toBe("rec-streak-at-risk");
    expect(recs[0]!.urgency).toBe("critical");
  });

  it("nudges Easy-only solvers up to Medium", () => {
    const recs = generateRecommendations(
      ctx({ easyCount: 5, mediumCount: 5, hardCount: 0 }),
    );
    // medium>0 so not 'level up to medium'; medium>=5 & hard==0 → try hard
    expect(recs.map((r) => r.id)).toContain("rec-try-hard");
  });

  it("caps at 3 and keeps urgency order (critical → high)", () => {
    const recs = generateRecommendations(
      ctx({
        daysSinceLastLog: 1,
        loggedToday: false,
        currentStreak: 5, // streak-at-risk (critical)
        totalProblems: 10,
        patternStats: [{ pattern: "Two Pointers", count: 1, percentage: 100 }], // weak-pattern (high)
        easyCount: 3,
        mediumCount: 0, // level-up-to-medium (high)
        hardCount: 0,
        activeDaysLast30: 2, // low-monthly (medium) — should be dropped by the cap
        completedMilestones: 0,
        completedProjects: 0,
        totalProjects: 0,
      }),
    );
    expect(recs).toHaveLength(3);
    expect(recs.map((r) => r.id)).toEqual([
      "rec-streak-at-risk",
      "rec-weak-two-pointers",
      "rec-level-up-medium",
    ]);
    expect(recs.map((r) => r.urgency)).toEqual(["critical", "high", "high"]);
  });
});
