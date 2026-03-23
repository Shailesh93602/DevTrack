/**
 * Insight Types
 *
 * Rule-based insight system for generating actionable feedback
 * based on user activity (DailyLog, DSAProblem).
 */

export type InsightType =
  | "strength"
  | "weakness"
  | "activity"
  | "milestone"
  | "suggestion";

export type InsightPriority = "high" | "medium" | "low";

export interface Insight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  message: string;
  metric?: {
    label: string;
    value: string | number;
  };
  action?: {
    label: string;
    href: string;
  };
}

export interface InsightConfig {
  thresholds: {
    /** Minimum problems in a pattern to be considered a strength */
    strengthMinCount: number;
    /** Minimum percentage above average to be a strength */
    strengthMinPercentage: number;
    /** Maximum count for a pattern to be considered a weakness */
    weaknessMaxCount: number;
    /** Days of inactivity before "activity dropped" insight */
    inactivityDays: number;
    /** Days to look back for recent activity */
    recentActivityWindowDays: number;
    /** Minimum streak length to trigger milestone */
    streakMilestoneInterval: number;
  };
}

export const DEFAULT_INSIGHT_CONFIG: InsightConfig = {
  thresholds: {
    strengthMinCount: 5,
    strengthMinPercentage: 20,
    weaknessMaxCount: 2,
    inactivityDays: 3,
    recentActivityWindowDays: 7,
    streakMilestoneInterval: 7,
  },
};

export interface InsightContext {
  patternStats: Array<{
    pattern: string;
    count: number;
    percentage: number;
  }>;
  totalProblems: number;
  recentLogsCount: number;
  daysSinceLastLog: number | null;
  currentStreak: number;
  longestStreak: number;
}
