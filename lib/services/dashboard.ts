import { prisma } from "@/lib/db/prisma";

export interface DashboardStats {
  totalProblems: number;
  todaysProblems: number;
  recentLogs: {
    id: string;
    date: Date;
    problemsSolved: number;
    topics: string[];
  }[];
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalProblemsResult, todaysLog, recentLogsResult] = await Promise.all([
    prisma.dSAProblem.count({
      where: { userId },
    }),
    prisma.dailyLog.findFirst({
      where: {
        userId,
        date: {
          gte: today,
        },
      },
      select: {
        problemsSolved: true,
      },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  const recentLogs = recentLogsResult.map((log: unknown) => ({
    id: (log as { id: string }).id,
    date: (log as { date: Date }).date,
    problemsSolved: (log as { problemsSolved: number }).problemsSolved,
    topics: (log as { topics: string[] }).topics ?? [],
  }));

  return {
    totalProblems: totalProblemsResult,
    todaysProblems: todaysLog?.problemsSolved ?? 0,
    recentLogs,
  };
}

export interface WeeklyDataPoint {
  week: string;
  count: number;
}

export async function getWeeklyProblemStats(userId: string, weeks: number = 8): Promise<WeeklyDataPoint[]> {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeks * 7);
  startDate.setHours(0, 0, 0, 0);

  const problems = await prisma.dSAProblem.findMany({
    where: {
      userId,
      solvedAt: {
        gte: startDate,
      },
    },
    select: {
      solvedAt: true,
    },
  });

  const weekMap = new Map<string, number>();

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (weeks - 1 - i) * 7);
    weekStart.setHours(0, 0, 0, 0);
    const weekLabel = `Week ${i + 1}`;
    weekMap.set(weekLabel, 0);
  }

  for (const problem of problems) {
    const solvedDate = new Date(problem.solvedAt);
    const diffTime = now.getTime() - solvedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(diffDays / 7);

    if (weekIndex >= 0 && weekIndex < weeks) {
      const weekLabel = `Week ${weeks - weekIndex}`;
      weekMap.set(weekLabel, (weekMap.get(weekLabel) ?? 0) + 1);
    }
  }

  const result: WeeklyDataPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    const weekLabel = `Week ${i + 1}`;
    result.push({ week: weekLabel, count: weekMap.get(weekLabel) ?? 0 });
  }

  return result;
}
