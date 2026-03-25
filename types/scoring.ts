// ============================================================
// Developer Scoring System — Types
// ============================================================

export interface ScoreBreakdown {
  /** Named component values used for UI tooltips / debug */
  [key: string]: number | string;
}

export interface SubScore {
  /** Normalised score 0–100 */
  score: number;
  /** Human-readable label */
  label: string;
  /** Granular inputs exposed for UI tooltips */
  breakdown: ScoreBreakdown;
}

export type ScoreGrade = "Elite" | "Advanced" | "Intermediate" | "Developing" | "Beginner";

export interface DeveloperScore {
  /** Composite 0–100 score */
  total: number;
  grade: ScoreGrade;
  gradeIcon: string;
  consistency: SubScore;
  dsa: SubScore;
  productivity: SubScore;
  /** ISO-8601 UTC timestamp of calculation */
  computedAt: string;
}

/** Raw inputs required by the scoring engine — passed in from the caller
 *  so that the engine itself makes zero DB calls. */
export interface ScoringInputs {
  // Consistency
  currentStreak: number;
  activeDaysLast30: number;

  // DSA
  easyCount: number;
  mediumCount: number;
  hardCount: number;

  // Productivity
  completedMilestones: number;
  completedProjects: number;
  /** Average DailyLog.problemsSolved across all logs; 0 if no logs */
  avgProblemsSolvedPerLog: number;
}
