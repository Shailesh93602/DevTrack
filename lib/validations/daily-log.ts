import { z } from "zod";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  NOTES_MAX_LENGTH,
  TOPICS_MAX_COUNT,
  TOPIC_MAX_LENGTH,
} from "@/lib/constants";

export const dailyLogSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "Select a valid date")
    .transform((d) => d.slice(0, 10))
    // Reject future dates — 'logged problems solved in 2027' was a
    // reported class of bug. The in-browser date input min/max aren't
    // authoritative; enforce on the server too. Compares YYYY-MM-DD
    // strings in the user's local 'now' since we don't know their TZ
    // here — worst case, a user one timezone ahead logs 'today' from
    // their POV that reads as tomorrow on the server; accepting that
    // edge case beats blocking real users on day boundaries.
    .refine(
      (d) => d <= new Date().toISOString().slice(0, 10),
      "Date can't be in the future"
    ),
  problemsSolved: z.number().int().min(0, "Cannot be negative").max(1000, "That's too many to log for a single day"),
  topics: z
    .array(z.string().trim().min(1).max(TOPIC_MAX_LENGTH))
    .max(TOPICS_MAX_COUNT),
  notes: z
    .string()
    .trim()
    .max(
      NOTES_MAX_LENGTH,
      `Notes must be ${NOTES_MAX_LENGTH} characters or less`
    )
    .optional()
    .nullable(),
});

export const createDailyLogSchema = dailyLogSchema;

export const updateDailyLogSchema = dailyLogSchema.partial();

export const dailyLogIdSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const dailyLogQuerySchema = z.object({
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

export type DailyLogInput = z.infer<typeof dailyLogSchema>;
export type DailyLogFormInput = z.infer<typeof dailyLogSchema>;
export type CreateDailyLogInput = z.infer<typeof createDailyLogSchema>;
export type UpdateDailyLogInput = z.infer<typeof updateDailyLogSchema>;
export type DailyLogIdParams = z.infer<typeof dailyLogIdSchema>;
export type DailyLogQueryParams = z.infer<typeof dailyLogQuerySchema>;
