import { z } from "zod";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  NOTES_MAX_LENGTH,
  TOPICS_MAX_COUNT,
  TOPIC_MAX_LENGTH,
} from "@/lib/constants";

export const dailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "Select a valid date").transform(d => d.slice(0, 10)),
  problemsSolved: z.number().int().min(0, "Cannot be negative").default(0),
  topics: z.array(z.string().trim().min(1).max(TOPIC_MAX_LENGTH)).max(TOPICS_MAX_COUNT).optional().default([]),
  notes: z.string().trim().max(NOTES_MAX_LENGTH).optional().nullable(),
});

export const createDailyLogSchema = dailyLogSchema;

export const updateDailyLogSchema = dailyLogSchema.partial();

export const dailyLogIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const dailyLogQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type DailyLogFormInput = z.infer<typeof dailyLogSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
export type DailyLogIdParams = z.infer<typeof dailyLogIdSchema>;
export type DailyLogQueryParams = z.infer<typeof dailyLogQuerySchema>;
