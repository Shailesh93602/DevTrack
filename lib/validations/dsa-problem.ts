import { z } from "zod";
import { Difficulty } from "@prisma/client";

export const difficultyValues = Object.values(Difficulty) as [string, ...string[]];

export const dsaProblemSchema = z.object({
  title: z.string().trim().min(1).max(200),
  difficulty: z.enum(difficultyValues),
  pattern: z.string().trim().min(1).max(100),
  platform: z.string().trim().min(1).max(50),
});

export const createDsaProblemSchema = dsaProblemSchema;

export const updateDsaProblemSchema = dsaProblemSchema.partial();

export const dsaProblemIdSchema = z.object({
  id: z.string().min(1),
});

export const dsaProblemQuerySchema = z.object({
  difficulty: z.enum(difficultyValues).optional(),
  pattern: z.string().optional(),
  platform: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type DsaProblemInput = z.infer<typeof dsaProblemSchema>;
export type CreateDsaProblemInput = z.infer<typeof createDsaProblemSchema>;
export type UpdateDsaProblemInput = z.infer<typeof updateDsaProblemSchema>;
export type DsaProblemIdParams = z.infer<typeof dsaProblemIdSchema>;
export type DsaProblemQueryParams = z.infer<typeof dsaProblemQuerySchema>;
