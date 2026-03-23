import { prisma } from "@/lib/db/prisma";
import { calculateStreaks } from "@/lib/services/streak";

export interface DashboardStats {
  totalProblems: number;
  todaysProblems: number;
  recentLogs: {
    id: string;
    date: Date;
    problemsSolved: number;
    topics: string[];
  }[];
  currentStreak: number;
  longestStreak: number;
  totalProjects: number;
  activeProjects: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Use UTC date to match @db.Date column storage (timezone-safe)
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [totalProblemsResult, todaysLog, recentLogsResult, streakStats, totalProjectsResult, activeProjectsResult, easyCount, mediumCount, hardCount] =
    await Promise.all([
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
        select: {
          id: true,
          date: true,
          problemsSolved: true,
          topics: true,
        },
      }),
      calculateStreaks(userId),
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "IN_PROGRESS" } }),
      prisma.dSAProblem.count({ where: { userId, difficulty: "EASY" } }),
      prisma.dSAProblem.count({ where: { userId, difficulty: "MEDIUM" } }),
      prisma.dSAProblem.count({ where: { userId, difficulty: "HARD" } }),
    ]);

  const recentLogs = recentLogsResult.map((log) => ({
    id: log.id,
    date: log.date,
    problemsSolved: log.problemsSolved,
    topics: log.topics ?? [],
  }));

  return {
    totalProblems: totalProblemsResult,
    todaysProblems: todaysLog?.problemsSolved ?? 0,
    recentLogs,
    currentStreak: streakStats.currentStreak,
    longestStreak: streakStats.longestStreak,
    totalProjects: totalProjectsResult,
    activeProjects: activeProjectsResult,
    difficultyDistribution: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
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
