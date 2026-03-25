// ============================================================
// Developer Scoring Service
// ============================================================
// Pure calculation functions — no DB calls.
// Callers (dashboard.ts, API route) supply ScoringInputs.
// ============================================================

import type {
  DeveloperScore,
  ScoreGrade,
  ScoringInputs,
  SubScore,
} from "@/types/scoring";

// ─── Weights ─────────────────────────────────────────────────────────────────

/** Difficulty weights for DSA score */
const DIFFICULTY_WEIGHTS = { easy: 1, medium: 2, hard: 4 } as const;

/** Composite score weights (must sum to 1) */
const SCORE_WEIGHTS = {
  consistency: 0.4,
  dsa: 0.35,
  productivity: 0.25,
} as const;

// ─── Normalization caps ───────────────────────────────────────────────────────

/** currentStreak days at which streakComponent is maxed */
const STREAK_CAP_DAYS = 30;

/** active days in 30-day window at which densityComponent is maxed
 *  (≈ 5 days/week × 4 weeks) */
const DENSITY_CAP_DAYS = 22;

/** weighted DSA points at which dsaScore is maxed */
const DSA_WEIGHTED_CAP = 200;

/** completed milestones at which milestonePoints are maxed */
const MILESTONE_CAP = 10;

/** completed projects at which projectPoints are maxed */
const PROJECT_CAP = 5;

/** avg problems/log at which dailyDSAPoints are maxed */
const AVG_PROBLEMS_CAP = 3;

// ─── Grade thresholds ─────────────────────────────────────────────────────────

const GRADE_THRESHOLDS: Array<{ min: number; grade: ScoreGrade; icon: string }> = [
  { min: 85, grade: "Elite",        icon: "🏆" },
  { min: 70, grade: "Advanced",     icon: "🔥" },
  { min: 50, grade: "Intermediate", icon: "⚡" },
  { min: 25, grade: "Developing",   icon: "📈" },
  { min: 0,  grade: "Beginner",     icon: "🌱" },
];

// ─── Sub-score calculators ────────────────────────────────────────────────────

/**
 * Consistency Score (0–100)
 *
 * streakComponent  = min(currentStreak / 30, 1) × 50
 * densityComponent = min(activeDaysLast30 / 22, 1) × 50
 */
function calcConsistencyScore(inputs: ScoringInputs): SubScore {
  const streakComponent  = Math.min(inputs.currentStreak / STREAK_CAP_DAYS, 1) * 50;
  const densityComponent = Math.min(inputs.activeDaysLast30 / DENSITY_CAP_DAYS, 1) * 50;
  const score = Math.round(streakComponent + densityComponent);

  return {
    score,
    label: "Consistency",
    breakdown: {
      currentStreak:    inputs.currentStreak,
      activeDaysLast30: inputs.activeDaysLast30,
      streakComponent:  Math.round(streakComponent),
      densityComponent: Math.round(densityComponent),
    },
  };
}

/**
 * DSA Score (0–100)
 *
 * weightedPoints = easy×1 + medium×2 + hard×4
 * dsaScore = min(weightedPoints / 200, 1) × 100
 */
function calcDsaScore(inputs: ScoringInputs): SubScore {
  const weightedPoints =
    inputs.easyCount   * DIFFICULTY_WEIGHTS.easy   +
    inputs.mediumCount * DIFFICULTY_WEIGHTS.medium  +
    inputs.hardCount   * DIFFICULTY_WEIGHTS.hard;

  const score = Math.round(Math.min(weightedPoints / DSA_WEIGHTED_CAP, 1) * 100);

  return {
    score,
    label: "DSA",
    breakdown: {
      easyCount:      inputs.easyCount,
      mediumCount:    inputs.mediumCount,
      hardCount:      inputs.hardCount,
      weightedPoints: Math.round(weightedPoints),
    },
  };
}

/**
 * Productivity Score (0–100)
 *
 * milestonePoints = min(completedMilestones / 10, 1) × 40
 * projectPoints   = min(completedProjects   /  5, 1) × 40
 * dailyDSAPoints  = min(avgProblemsSolvedPerLog / 3, 1) × 20
 */
function calcProductivityScore(inputs: ScoringInputs): SubScore {
  const milestonePoints = Math.min(inputs.completedMilestones / MILESTONE_CAP, 1) * 40;
  const projectPoints   = Math.min(inputs.completedProjects   / PROJECT_CAP,   1) * 40;
  const dailyDSAPoints  = Math.min(inputs.avgProblemsSolvedPerLog / AVG_PROBLEMS_CAP, 1) * 20;
  const score = Math.round(milestonePoints + projectPoints + dailyDSAPoints);

  return {
    score,
    label: "Productivity",
    breakdown: {
      completedMilestones:      inputs.completedMilestones,
      completedProjects:        inputs.completedProjects,
      avgProblemsSolvedPerLog:  Math.round(inputs.avgProblemsSolvedPerLog * 10) / 10,
      milestonePoints:          Math.round(milestonePoints),
      projectPoints:            Math.round(projectPoints),
      dailyDSAPoints:           Math.round(dailyDSAPoints),
    },
  };
}

// ─── Grade helper ─────────────────────────────────────────────────────────────

function resolveGrade(total: number): { grade: ScoreGrade; icon: string } {
  for (const threshold of GRADE_THRESHOLDS) {
    if (total >= threshold.min) {
      return { grade: threshold.grade, icon: threshold.icon };
    }
  }
  // Fallback (should never hit, min is 0)
  return { grade: "Beginner", icon: "🌱" };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Compute the complete DeveloperScore from pre-aggregated inputs.
 * This function is pure — it is synchronous and makes no DB calls.
 */
export function computeDeveloperScore(inputs: ScoringInputs): DeveloperScore {
  const consistency  = calcConsistencyScore(inputs);
  const dsa          = calcDsaScore(inputs);
  const productivity = calcProductivityScore(inputs);

  const total = Math.round(
    SCORE_WEIGHTS.consistency  * consistency.score  +
    SCORE_WEIGHTS.dsa          * dsa.score          +
    SCORE_WEIGHTS.productivity * productivity.score
  );

  const { grade, icon: gradeIcon } = resolveGrade(total);

  return {
    total,
    grade,
    gradeIcon,
    consistency,
    dsa,
    productivity,
    computedAt: new Date().toISOString(),
  };
}

/**
 * Convenience: collect ScoringInputs from Prisma aggregates that the
 * dashboard query already fetches, then compute and return the score.
 *
 * @param data - pre-fetched aggregated values from Prisma
 */
export function computeScoreFromAggregates(data: {
  currentStreak: number;
  windowLogs: { date: Date; problemsSolved: number }[];
  thirtyDaysAgo: Date;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  completedMilestones: number;
  completedProjects: number;
}): DeveloperScore {
  const activeDaysLast30 = data.windowLogs.filter(
    (l) => new Date(l.date) >= data.thirtyDaysAgo
  ).length;

  const totalLogProblemsSolved = data.windowLogs.reduce(
    (sum, l) => sum + l.problemsSolved, 0
  );
  const avgProblemsSolvedPerLog =
    data.windowLogs.length > 0 ? totalLogProblemsSolved / data.windowLogs.length : 0;

  return computeDeveloperScore({
    currentStreak: data.currentStreak,
    activeDaysLast30,
    easyCount: data.easyCount,
    mediumCount: data.mediumCount,
    hardCount: data.hardCount,
    completedMilestones: data.completedMilestones,
    completedProjects: data.completedProjects,
    avgProblemsSolvedPerLog,
  });
}
