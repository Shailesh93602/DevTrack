import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("IN_PROGRESS"),
  dueDate: z.coerce.date().optional(),
  techStack: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdSchema = z.object({
  id: z.string().uuid(),
});

export const projectQuerySchema = z.object({
  status: z.enum(["IN_PROGRESS", "COMPLETED", "ON_HOLD"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParams = z.infer<typeof projectIdSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
