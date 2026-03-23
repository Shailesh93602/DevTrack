import { prisma } from "@/lib/db/prisma";
import { Prisma, ProjectActivityType } from "@prisma/client";
import type { CreateMilestoneInput, ReorderMilestonesInput } from "@/lib/validations/milestone";

const defaultSelect = {
  id: true,
  projectId: true,
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  completedAt: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MilestoneSelect;

export async function createMilestone(
  userId: string,
  projectId: string,
  data: CreateMilestoneInput
) {
  return prisma.$transaction(async (tx) => {
    const projectExists = await tx.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!projectExists) return null;

    const milestone = await tx.milestone.create({
      data: { ...data, projectId, userId },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId,
        userId,
        action: ProjectActivityType.MILESTONE_ADDED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(projectId, tx);

    return milestone;
  });
}

export async function completeMilestone(userId: string, milestoneId: string) {
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.findFirst({
      where: { id: milestoneId, userId },
      select: { id: true, projectId: true, title: true, completedAt: true },
    });

    if (!milestone) return null;
    if (milestone.completedAt) return milestone;

    const updatedMilestone = await tx.milestone.update({
      where: { id: milestoneId },
      data: { completedAt: new Date() },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId: milestone.projectId,
        userId,
        action: ProjectActivityType.MILESTONE_COMPLETED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(milestone.projectId, tx);

    return updatedMilestone;
  });
}

export async function deleteMilestone(userId: string, milestoneId: string) {
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.findFirst({
      where: { id: milestoneId, userId },
      select: { id: true, projectId: true, title: true },
    });

    if (!milestone) return null;

    await tx.milestone.delete({ where: { id: milestoneId } });

    await tx.projectActivityLog.create({
      data: {
        projectId: milestone.projectId,
        userId,
        action: ProjectActivityType.MILESTONE_DELETED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(milestone.projectId, tx);

    return { success: true };
  });
}

export async function reorderMilestones(
  userId: string,
  projectId: string,
  input: ReorderMilestonesInput
) {
  const { orderedIds } = input;

  return prisma.$transaction(async (tx) => {
    const existingMilestones = await tx.milestone.findMany({
      where: { projectId, userId },
      select: { id: true },
    });

    const existingIds = new Set(existingMilestones.map((m) => m.id));
    const allValid = orderedIds.every((id) => existingIds.has(id));

    if (!allValid) return null;

    await Promise.all(
      orderedIds.map((id, index) =>
        tx.milestone.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return tx.milestone.findMany({
      where: { projectId, userId },
      orderBy: { order: "asc" },
      select: defaultSelect,
    });
  });
}

async function recalculateProgress(
  projectId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const [total, completed] = await Promise.all([
    tx.milestone.count({ where: { projectId } }),
    tx.milestone.count({ where: { projectId, completedAt: { not: null } } }),
  ]);

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  await tx.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
