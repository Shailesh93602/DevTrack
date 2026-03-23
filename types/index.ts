// ============================================
// Types Barrel Export
// ============================================
// All TypeScript types and interfaces are exported from here
// Import from @/types instead of individual files

// Prisma re-exports
export type { User, DailyLog, DSAProblem } from "@prisma/client";
export { Difficulty, ProjectStatus } from "@prisma/client";

// NOTE: Project type is defined locally in ./project instead of Prisma re-export

// Shared types
export interface StatsCard {
  title: string;
  value: string | number;
  description?: string;
}

// Feature types
export type {
  DifficultyLevel,
  DsaProblem,
  DsaProblemFormData,
  DsaProblemListProps,
  DsaProblemFormProps,
  DsaProblemBase,
  ProblemItemProps,
  FilterOption,
  DsaProblemState,
  DsaProblemActions,
} from "./dsa-problem";

export type {
  SerializedDailyLog,
  DailyLogFormProps,
  DailyLogListProps,
  DailyLogFormData,
  DailyLogFilter,
  DailyLogState,
} from "./daily-log";

export type {
  Project,
  ProjectFormProps,
  ProjectListProps,
  ProjectFilter,
  ProjectFormData,
  ProjectStats,
} from "./project";

export {
  DIFFICULTY_OPTIONS,
  FILTER_OPTIONS,
} from "./dsa-problem";

// TODO: Add milestone types when created
