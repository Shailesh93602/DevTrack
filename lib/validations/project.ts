import { z } from "zod";
import {
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  PROJECT_DESCRIPTION_MAX_LENGTH,
  PROJECT_TECH_STACK_MAX_COUNT,
  TOPIC_MAX_LENGTH,
} from "@/lib/constants";

// Server-side schema (for API/DB operations)
export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(PROJECT_DESCRIPTION_MAX_LENGTH).optional(),
  status: z
    .enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"])
    .default("IN_PROGRESS"),
  dueDate: z.coerce.date().optional(),
  techStack: z
    .array(z.string().trim().min(1).max(TOPIC_MAX_LENGTH))
    .max(PROJECT_TECH_STACK_MAX_COUNT)
    .default([]),
});

// Client-side form schema (for React Hook Form) - no defaults, required fields
export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(
      PROJECT_DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${PROJECT_DESCRIPTION_MAX_LENGTH} characters`
    )
    .optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  dueDate: z.date().optional(),
  techStack: z
    .array(z.string().trim().min(1).max(TOPIC_MAX_LENGTH))
    .max(PROJECT_TECH_STACK_MAX_COUNT),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdSchema = z.object({
  id: z.string().uuid(),
});

export const projectQuerySchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type ProjectFormInput = z.infer<typeof projectFormSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParams = z.infer<typeof projectIdSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
