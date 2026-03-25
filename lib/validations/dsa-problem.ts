import { z } from "zod";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  NOTES_MAX_LENGTH,
  PATTERN_MAX_LENGTH,
  PLATFORM_MAX_LENGTH,
} from "@/lib/constants";

const DIFFICULTY_LITERALS = ["EASY", "MEDIUM", "HARD"] as const;

export const dsaProblemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(200),
  difficulty: z.enum(DIFFICULTY_LITERALS),
  pattern: z
    .string()
    .trim()
    .min(1, "Pattern is required")
    .max(PATTERN_MAX_LENGTH),
  platform: z
    .string()
    .trim()
    .min(1, "Platform is required")
    .max(PLATFORM_MAX_LENGTH),
  notes: z
    .string()
    .trim()
    .max(
      NOTES_MAX_LENGTH,
      `Notes must be ${NOTES_MAX_LENGTH} characters or less`
    )
    .optional(),
});

export const createDsaProblemSchema = dsaProblemSchema;

export const updateDsaProblemSchema = dsaProblemSchema.partial();

export const dsaProblemIdSchema = z.object({
  id: z.string().min(1),
});

export const dsaProblemQuerySchema = z.object({
  difficulty: z.enum(DIFFICULTY_LITERALS).optional(),
  pattern: z.string().optional(),
  platform: z.string().optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DsaProblemInput = z.infer<typeof dsaProblemSchema>;
export type CreateDsaProblemInput = z.infer<typeof createDsaProblemSchema>;
export type UpdateDsaProblemInput = z.infer<typeof updateDsaProblemSchema>;
export type DsaProblemIdParams = z.infer<typeof dsaProblemIdSchema>;
export type DsaProblemQueryParams = z.infer<typeof dsaProblemQuerySchema>;
