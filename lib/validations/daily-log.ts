import { z } from "zod";

export const dailyLogSchema = z.object({
  date: z.coerce.date(),
  problemsSolved: z.coerce.number().int().min(0).default(0),
  topics: z.array(z.string().min(1)).default([]),
  notes: z.string().max(1000).optional(),
});

export const createDailyLogSchema = dailyLogSchema;

export const updateDailyLogSchema = dailyLogSchema.partial();

export const dailyLogIdSchema = z.object({
  id: z.string().cuid(),
});

export const dailyLogQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
export type DailyLogIdParams = z.infer<typeof dailyLogIdSchema>;
export type DailyLogQueryParams = z.infer<typeof dailyLogQuerySchema>;
