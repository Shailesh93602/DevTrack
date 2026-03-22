import { prisma } from "@/lib/db/prisma";
import { Prisma, ProjectActivityType, ProjectStatus } from "@prisma/client";
import type { CreateProjectInput, UpdateProjectInput, ProjectQueryParams } from "@/lib/validations/project";

const defaultSelect = {
  id: true,
  userId: true,
  name: true,
  description: true,
  status: true,
  progress: true,
  dueDate: true,
  techStack: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

export async function createProject(userId: string, data: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: { ...data, userId },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId: project.id,
        userId,
        action: ProjectActivityType.PROJECT_CREATED,
        metadata: { name: project.name },
      },
    });

    return project;
  });
}

export async function getProjects(userId: string, params: ProjectQueryParams) {
  const { status, limit, offset } = params;

  const where: Prisma.ProjectWhereInput = { userId };
  if (status) where.status = status;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      select: defaultSelect,
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, total, limit, offset };
}

export async function getProjectById(userId: string, id: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    select: {
      ...defaultSelect,
      milestones: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          completedAt: true,
          order: true,
          createdAt: true,
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function updateProject(
  userId: string,
  id: string,
  data: UpdateProjectInput
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id, userId },
      select: { status: true },
    });

    if (!existing) return null;

    const updatedProject = await tx.project.update({
      where: { id },
      data,
      select: defaultSelect,
    });

    const isStatusChange =
      data.status !== undefined && data.status !== existing.status;

    await tx.projectActivityLog.create({
      data: {
        projectId: id,
        userId,
        action: isStatusChange
          ? ProjectActivityType.STATUS_CHANGED
          : ProjectActivityType.PROJECT_UPDATED,
        metadata: isStatusChange
          ? { from: existing.status, to: data.status }
          : { fields: Object.keys(data) },
      },
    });

    return updatedProject;
  });
}

export async function deleteProject(userId: string, id: string) {
  return prisma.project.deleteMany({
    where: { id, userId },
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
