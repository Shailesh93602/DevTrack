// ============================================
// Constants Barrel Export
// ============================================
// All application constants are exported from here
// Import from @/constants instead of hardcoding values

// ============================================
// DSA Problem Constants
// ============================================
export const DSA_PROBLEM_CONSTANTS = {
  TITLE_MAX: 200,
  PATTERN_MAX: 100,
  PLATFORM_MAX: 50,
  NOTES_MAX: 1000,
  DIFFICULTY_OPTIONS: ["EASY", "MEDIUM", "HARD"] as const,
  FILTER_OPTIONS: ["ALL", "EASY", "MEDIUM", "HARD"] as const,
} as const;

// ============================================
// Daily Log Constants
// ============================================
export const DAILY_LOG_CONSTANTS = {
  NOTES_MAX: 1000,
  TOPICS_MAX: 20,
  TOPIC_LENGTH_MAX: 50,
  PROBLEMS_MIN: 0,
} as const;

// ============================================
// Project Constants
// ============================================
export const PROJECT_CONSTANTS = {
  NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
  TECH_STACK_MAX: 20,
  TECH_NAME_MAX: 30,
} as const;

// ============================================
// Form Constants
// ============================================
export const FORM_CONSTANTS = {
  DEBOUNCE_MS: 300,
  SUCCESS_MESSAGE_DURATION: 3000,
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// ============================================
// Default Form Values
// ============================================
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

// ============================================
// API Constants
// ============================================
export const API_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  DEFAULT_OFFSET: 0,
} as const;

// ============================================
// Re-export for convenience
// ============================================
export const CONSTANTS = {
  DSA_PROBLEM: DSA_PROBLEM_CONSTANTS,
  DAILY_LOG: DAILY_LOG_CONSTANTS,
  PROJECT: PROJECT_CONSTANTS,
  FORM: FORM_CONSTANTS,
  API: API_CONSTANTS,
} as const;
