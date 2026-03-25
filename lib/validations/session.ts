import { z } from "zod";
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "@/lib/constants";

export const SESSION_TITLE_MAX_LENGTH = 120;
export const SESSION_CATEGORY_MAX_LENGTH = 60;
export const SESSION_NOTES_MAX_LENGTH = 2000;
export const SESSION_DESCRIPTION_MAX_LENGTH = 500;

export const startSessionSchema = z.object({
  title: z.string().trim().max(SESSION_TITLE_MAX_LENGTH).optional().nullable(),
  category: z
    .string()
    .trim()
    .max(SESSION_CATEGORY_MAX_LENGTH)
    .optional()
    .nullable(),
});

export const endSessionSchema = z.object({
  notes: z.string().trim().max(SESSION_NOTES_MAX_LENGTH).optional().nullable(),
});

export const sessionActivityTypeEnum = z.enum([
  "PROBLEM_SOLVED",
  "CODE_COMMITTED",
  "PROJECT_WORKED",
  "READING",
  "REVIEW",
  "OTHER",
]);

export const createSessionEventSchema = z.object({
  activityType: sessionActivityTypeEnum,
  description: z
    .string()
    .trim()
    .max(SESSION_DESCRIPTION_MAX_LENGTH)
    .optional()
    .nullable(),
});

export const sessionIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const sessionQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
export type CreateSessionEventInput = z.infer<typeof createSessionEventSchema>;
export type SessionIdParams = z.infer<typeof sessionIdSchema>;
export type SessionQueryParams = z.infer<typeof sessionQuerySchema>;
export type SessionActivityType = z.infer<typeof sessionActivityTypeEnum>;
