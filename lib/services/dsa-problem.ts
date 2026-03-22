import { prisma } from "@/lib/db/prisma";
import { Prisma, Difficulty } from "@prisma/client";
import type { CreateDsaProblemInput, DsaProblemQueryParams, UpdateDsaProblemInput } from "@/lib/validations/dsa-problem";

const defaultSelect = {
  id: true,
  userId: true,
  title: true,
  difficulty: true,
  pattern: true,
  platform: true,
  solvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DSAProblemSelect;

export async function createDsaProblem(
  userId: string,
  data: CreateDsaProblemInput
) {
  return prisma.dSAProblem.create({
    data: {
      ...data,
      userId,
      solvedAt: new Date(),
    },
    select: defaultSelect,
  });
}

export async function getDsaProblems(userId: string, params: DsaProblemQueryParams) {
  const { difficulty, pattern, platform, limit, offset } = params;

  const where: Prisma.DSAProblemWhereInput = { userId };

  if (difficulty) {
    where.difficulty = difficulty;
  }

  if (pattern) {
    where.pattern = { contains: pattern, mode: "insensitive" };
  }

  if (platform) {
    where.platform = { contains: platform, mode: "insensitive" };
  }

  const [problems, total] = await Promise.all([
    prisma.dSAProblem.findMany({
      where,
      orderBy: { solvedAt: "desc" },
      take: limit,
      skip: offset,
      select: defaultSelect,
    }),
    prisma.dSAProblem.count({ where }),
  ]);

  return { problems, total, limit, offset };
}

export async function getDsaProblemById(userId: string, id: string) {
  return prisma.dSAProblem.findFirst({
    where: { id, userId },
    select: defaultSelect,
  });
}

export async function updateDsaProblem(
  userId: string,
  id: string,
  data: UpdateDsaProblemInput
) {
  const updateData: Prisma.DSAProblemUpdateManyMutationInput = {
    ...(data.title && { title: data.title }),
    ...(data.difficulty && { difficulty: data.difficulty as Difficulty }),
    ...(data.pattern && { pattern: data.pattern }),
    ...(data.platform && { platform: data.platform }),
  };

  return prisma.dSAProblem.updateMany({
    where: { id, userId },
    data: updateData,
  });
}

export async function deleteDsaProblem(userId: string, id: string) {
  return prisma.dSAProblem.deleteMany({
    where: { id, userId },
  });
}
