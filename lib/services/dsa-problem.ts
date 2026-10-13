import { prisma } from "@/lib/db/prisma";
import { Prisma, Difficulty } from "@prisma/client";
import { INSIGHTS_QUERY_LIMIT } from "@/lib/constants";
import type {
  CreateDsaProblemInput,
  DsaProblemQueryParams,
  UpdateDsaProblemInput,
} from "@/lib/validations";
import { buildPatternAnalysis } from "@/lib/services/pattern-analysis";
import type { PatternAnalysis } from "@/types/dsa-problem";

const defaultSelect = {
  id: true,
  userId: true,
  title: true,
  difficulty: true,
  pattern: true,
  platform: true,
  solvedAt: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DSAProblemSelect;

export async function createDsaProblem(
  userId: string,
  data: CreateDsaProblemInput
) {
  return prisma.dSAProblem.create({
    data: {
      title: data.title,
      difficulty: data.difficulty as Difficulty,
      pattern: data.pattern,
      platform: data.platform,
      notes: data.notes,
      userId,
      solvedAt: new Date(),
    },
    select: defaultSelect,
  });
}

export interface GetDsaProblemsResult {
  problems: Prisma.DSAProblemGetPayload<{ select: typeof defaultSelect }>[];
  total: number;
  limit: number;
  offset: number;
}

export async function getDsaProblems(
  userId: string,
  params: DsaProblemQueryParams
): Promise<GetDsaProblemsResult> {
  const { difficulty, pattern, platform, limit, offset } = params;

  const where: Prisma.DSAProblemWhereInput = { userId };

  if (difficulty) {
    where.difficulty = difficulty as Difficulty;
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

  return { problems, total, limit, offset } as GetDsaProblemsResult;
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
    ...(data.notes !== undefined && { notes: data.notes }),
  };

  const existing = await prisma.dSAProblem.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  return prisma.dSAProblem.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  });
}

export async function deleteDsaProblem(userId: string, id: string) {
  return prisma.dSAProblem.deleteMany({
    where: { id, userId },
  });
}

// ─── Pattern Analysis ───────────────────────────────────────────────────────

/**
 * Analyze pattern distribution across user's DSA problems
 * Groups by pattern, counts frequency, identifies strong/weak areas
 */
export async function analyzePatterns(
  userId: string,
  options: { limit?: number } = {}
): Promise<PatternAnalysis> {
  const { limit = INSIGHTS_QUERY_LIMIT } = options;

  const problems = await prisma.dSAProblem.findMany({
    where: { userId },
    select: { pattern: true },
    take: limit,
  });

  return buildPatternAnalysis(problems);
}
