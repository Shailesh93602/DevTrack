import { prisma } from "@/lib/db/prisma";
import { RECENT_LOGS_DISPLAY_LIMIT } from "@/lib/constants";
import { getActiveSession } from "@/lib/services/session";
import { SessionWithActivities } from "@/types/session";

export interface WindowProblem {
  pattern: string;
  solvedAt: Date;
  difficulty: string;
}

export interface WindowLog {
  id: string;
  date: Date;
  problemsSolved: number;
  topics: unknown;
  createdAt: Date;
}

export interface RecentLogRow {
  id: string;
  date: Date;
  problemsSolved: number;
  topics: unknown;
}

/** Everything the dashboard reads from the database, fetched in one batch. */
export interface DashboardSnapshot {
  totalProblems: number;
  difficultyCounts: { difficulty: string; _count: number }[];
  recentProblems: WindowProblem[];
  windowLogs: WindowLog[];
  recentLogsResult: RecentLogRow[];
  projectsRaw: { status: string }[];
  user: { longestStreak: number } | null;
  completedMilestonesCount: number;
  activeSession: SessionWithActivities | null;
}

/** Runs every dashboard query in parallel; `windowCutoff` bounds the time-windowed ones. */
export async function fetchDashboardSnapshot(
  userId: string,
  windowCutoff: Date
): Promise<DashboardSnapshot> {
  const [
    totalProblems,
    difficultyCounts,
    recentProblems,
    windowLogs,
    recentLogsResult,
    projectsRaw,
    user,
    completedMilestonesCount,
    activeSession,
  ] = (await Promise.all([
    prisma.dSAProblem.count({ where: { userId } }),
    prisma.dSAProblem.groupBy({
      by: ["difficulty"],
      where: { userId },
      _count: true,
    }),
    prisma.dSAProblem.findMany({
      where: { userId, solvedAt: { gte: windowCutoff } },
      select: { pattern: true, solvedAt: true, difficulty: true },
      orderBy: { solvedAt: "desc" },
    }),
    prisma.dailyLog.findMany({
      where: { userId, date: { gte: windowCutoff } },
      select: {
        id: true,
        date: true,
        problemsSolved: true,
        topics: true,
        createdAt: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: RECENT_LOGS_DISPLAY_LIMIT,
      select: { id: true, date: true, problemsSolved: true, topics: true },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { status: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { longestStreak: true },
    }),
    prisma.milestone.count({
      where: { userId, completedAt: { not: null } },
    }),
    getActiveSession(userId),
  ])) as [
    number,
    { difficulty: string; _count: number }[],
    WindowProblem[],
    WindowLog[],
    RecentLogRow[],
    { status: string }[],
    { longestStreak: number } | null,
    number,
    SessionWithActivities | null,
  ];

  return {
    totalProblems,
    difficultyCounts,
    recentProblems,
    windowLogs,
    recentLogsResult,
    projectsRaw,
    user,
    completedMilestonesCount,
    activeSession,
  };
}
