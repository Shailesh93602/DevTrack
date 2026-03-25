/**
 * Recommendation System Types
 *
 * Prescriptive action suggestions — "Do X next."
 * Distinct from Insight types which are purely observational.
 */

export type RecommendationUrgency = "critical" | "high" | "medium" | "low";

export interface Recommendation {
  /** Unique, stable ID for deduplication */
  id: string;
  urgency: RecommendationUrgency;
  /** Emoji icon for the card */
  icon: string;
  title: string;
  /** Why this is being recommended */
  reason: string;
  /** Primary call-to-action */
  cta: {
    label: string;
    href: string;
  };
  metric?: {
    label: string;
    value: string | number;
  };
}

/**
 * All signal data the recommendation engine needs.
 * Callers supply this — the engine itself makes zero DB calls.
 */
export interface RecommendationContext {
  /** Sorted ascending by count (weakest first) */
  patternStats: Array<{
    pattern: string;
    count: number;
    percentage: number;
  }>;
  totalProblems: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  currentStreak: number;
  activeDaysLast30: number;
  /** null = never logged */
  daysSinceLastLog: number | null;
  /** Whether the user already logged today */
  loggedToday: boolean;
  completedMilestones: number;
  completedProjects: number;
  totalProjects: number;
}
