import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
  dueDate: z.coerce.date().optional(),
  order: z.number().int().min(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export const milestoneIdSchema = z.object({
  id: z.string().cuid(),
});

export const reorderMilestonesSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type MilestoneIdParams = z.infer<typeof milestoneIdSchema>;
export type ReorderMilestonesInput = z.infer<typeof reorderMilestonesSchema>;
