// ============================================
// Validations Barrel Export
// ============================================
// All Zod validation schemas are exported from here
// Import from @/lib/validations instead of individual files

export {
  dailyLogSchema,
  createDailyLogSchema,
  updateDailyLogSchema,
  dailyLogIdSchema,
  dailyLogQuerySchema,
  type DailyLogInput,
  type DailyLogFormInput,
  type CreateDailyLogInput,
  type UpdateDailyLogInput,
  type DailyLogIdParams,
  type DailyLogQueryParams,
} from "./daily-log";

export {
  dsaProblemSchema,
  createDsaProblemSchema,
  updateDsaProblemSchema,
  dsaProblemIdSchema,
  dsaProblemQuerySchema,
  type DsaProblemInput,
  type CreateDsaProblemInput,
  type UpdateDsaProblemInput,
  type DsaProblemIdParams,
  type DsaProblemQueryParams,
} from "./dsa-problem";

export {
  createProjectSchema,
  projectFormSchema,
  updateProjectSchema,
  projectIdSchema,
  projectQuerySchema,
  type CreateProjectInput,
  type ProjectFormInput,
  type UpdateProjectInput,
  type ProjectIdParams,
  type ProjectQueryParams,
} from "./project";

export {
  createMilestoneSchema,
  updateMilestoneSchema,
  milestoneIdSchema,
  reorderMilestonesSchema,
  type CreateMilestoneInput,
  type UpdateMilestoneInput,
  type MilestoneIdParams,
  type ReorderMilestonesInput,
} from "./milestone";

export {
  emailSchema,
  passwordSchema,
  loginSchema,
  signupSchema,
  authSchema,
  type LoginFormData,
  type SignupFormData,
  type AuthFormInput,
} from "./auth";

export {
  startSessionSchema,
  endSessionSchema,
  createSessionEventSchema,
  sessionIdSchema,
  sessionQuerySchema,
  type StartSessionInput,
  type EndSessionInput,
  type CreateSessionEventInput,
  type SessionIdParams,
  type SessionQueryParams,
  type SessionActivityType,
} from "./session";
