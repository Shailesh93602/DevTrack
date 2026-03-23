import { z } from "zod";

// Server-side schema (for API/DB operations)
export const dailyLogSchema = z.object({
  date: z.coerce.date(),
  problemsSolved: z.coerce.number().int().min(0).default(0),
  topics: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  notes: z.string().trim().max(1000).optional(),
});

// Client-side form schema (for React Hook Form)
export const dailyLogFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date"),
  problemsSolved: z.number().int().min(0, "Cannot be negative"),
  notes: z.string().trim().max(1000).optional(),
});

export const createDailyLogSchema = dailyLogFormSchema;

export const updateDailyLogSchema = dailyLogFormSchema.partial();

export const dailyLogIdSchema = z.object({
  id: z.string().uuid(),
});

export const dailyLogQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type DailyLogFormInput = z.infer<typeof dailyLogFormSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
export type DailyLogIdParams = z.infer<typeof dailyLogIdSchema>;
export type DailyLogQueryParams = z.infer<typeof dailyLogQuerySchema>;
