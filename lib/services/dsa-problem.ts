import { prisma } from "@/lib/db/prisma";
import { Prisma, Difficulty } from "@prisma/client";
import type { CreateDsaProblemInput, DsaProblemQueryParams, UpdateDsaProblemInput } from "@/lib/validations/dsa-problem";
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

export async function getDsaProblems(userId: string, params: DsaProblemQueryParams) {
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
    ...(data.notes !== undefined && { notes: data.notes }),
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

// ─── Pattern Analysis ───────────────────────────────────────────────────────

/**
 * Analyze pattern distribution across user's DSA problems
 * Groups by pattern, counts frequency, identifies strong/weak areas
 */
export async function analyzePatterns(
  userId: string,
  options: { limit?: number } = {}
): Promise<PatternAnalysis> {
  const { limit = 1000 } = options;

  const problems = await prisma.dSAProblem.findMany({
    where: { userId },
    select: { pattern: true },
    take: limit,
  });

  const totalProblems = problems.length;

  if (totalProblems === 0) {
    return {
      patterns: [],
      summary: {
        totalProblems: 0,
        uniquePatterns: 0,
        mostPracticed: null,
        leastPracticed: null,
      },
    };
  }

  // Group and count by pattern (case-insensitive)
  const patternCounts = new Map<string, number>();
  for (const problem of problems) {
    const normalizedPattern = problem.pattern.trim();
    patternCounts.set(
      normalizedPattern,
      (patternCounts.get(normalizedPattern) ?? 0) + 1
    );
  }

  // Build sorted pattern stats (by count desc, then alphabetically)
  const patterns = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: Math.round((count / totalProblems) * 100),
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.pattern.localeCompare(b.pattern);
    });

  const uniquePatterns = patterns.length;

  // Most practiced = first (highest count)
  const mostPracticed = patterns[0] ?? null;

  // Least practiced = last (lowest count, but must have at least 1)
  const leastPracticed = patterns.at(-1) ?? null;

  return {
    patterns,
    summary: {
      totalProblems,
      uniquePatterns,
      mostPracticed,
      leastPracticed: leastPracticed?.count === mostPracticed?.count ? null : leastPracticed,
    },
  };
}
