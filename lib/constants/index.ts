import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Shared constants for the application to avoid magic numbers and ensure consistency.
 */

// Date & Time Constants
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const SECONDS_PER_DAY = 24 * 60 * 60;
export const DAYS_IN_WEEK = 7;
export const STREAK_ANALYSIS_DAYS = 120;
export const ACTIVITY_HEATMAP_DAYS = 90;

export const DATE_CONSTANTS = {
  MS_PER_DAY,
  STREAK_CUTOFF_DAYS: STREAK_ANALYSIS_DAYS,
  RECONCILIATION_DAYS: 2,
};

// API & Pagination
export const DEFAULT_PAGE_LIMIT = 50;
export const MAX_PAGE_LIMIT = 100;

export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: DEFAULT_PAGE_LIMIT,
  MAX_PAGE_SIZE: MAX_PAGE_LIMIT,
  DEFAULT_OFFSET: 0,
};

// Business Logic Limits
export const NOTES_MAX_LENGTH = 1000;
export const TOPICS_MAX_COUNT = 20;
export const TOPIC_MAX_LENGTH = 50;
export const PLATFORM_MAX_LENGTH = 50;
export const PATTERN_MAX_LENGTH = 50;

// Project Constants
export const PROJECT_NAME_MAX_LENGTH = 100;
export const PROJECT_DESCRIPTION_MAX_LENGTH = 500;
export const PROJECT_TECH_STACK_MAX_COUNT = 20;
export const MILESTONE_TITLE_MAX_LENGTH = 150;
export const MILESTONE_DESCRIPTION_MAX_LENGTH = 500;

export const PROJECT_STATUS_CONFIG = {
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    variant: "default" as const,
    dotClass: "bg-primary",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "secondary" as const,
    dotClass: "bg-green-500",
  },
  ON_HOLD: {
    label: "On Hold",
    icon: AlertCircle,
    variant: "outline" as const,
    dotClass: "bg-muted-foreground",
  },
} as const;

// Insights & Analytics
export const INSIGHTS_QUERY_LIMIT = 120;
export const RECENT_LOGS_DISPLAY_LIMIT = 5;
export const WEEKLY_STATS_WEEKS = 8;
export const CONSISTENCY_WEEKS_CHECK = 4;
export const CONSISTENCY_TARGET_LOGS_PER_WEEK = 5;

// Default Form Values
export const DEFAULT_VALUES = {
  DSA_PROBLEM: {
    title: "",
    difficulty: "MEDIUM" as const,
    pattern: "",
    platform: "",
    notes: "",
  },
  PROJECT: {
    name: "",
    description: "",
    status: "IN_PROGRESS" as const,
    dueDate: undefined as Date | undefined,
    techStack: [] as string[],
  },
  DAILY_LOG: {
    date: "",
    problemsSolved: 0,
    topics: [] as string[],
    notes: "",
  },
} as const;

// Combined constants for backwards compatibility where needed
export const CONSTANTS = {
  DATE: DATE_CONSTANTS,
  API: API_CONSTANTS,
  DAILY_LOG: {
    NOTES_MAX: NOTES_MAX_LENGTH,
    TOPICS_MAX: TOPICS_MAX_COUNT,
    TOPIC_LENGTH_MAX: TOPIC_MAX_LENGTH,
  },
  DEFAULT_VALUES,
} as const;
