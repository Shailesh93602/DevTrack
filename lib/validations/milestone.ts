import { z } from "zod";
import {
  MILESTONE_DESCRIPTION_MAX_LENGTH,
  MILESTONE_TITLE_MAX_LENGTH,
} from "@/lib/constants";

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(MILESTONE_TITLE_MAX_LENGTH),
  description: z.string().trim().max(MILESTONE_DESCRIPTION_MAX_LENGTH).optional(),
  dueDate: z.coerce.date().optional(),
  order: z.number().int().min(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export const milestoneIdSchema = z.object({
  id: z.string().uuid(),
});

export const reorderMilestonesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type MilestoneIdParams = z.infer<typeof milestoneIdSchema>;
export type ReorderMilestonesInput = z.infer<typeof reorderMilestonesSchema>;
