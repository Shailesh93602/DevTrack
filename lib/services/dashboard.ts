import { prisma } from "@/lib/db/prisma";
import { calculateStreaks } from "@/lib/services/streak";
import { analyzePatterns } from "@/lib/services/dsa-problem";
import { generateInsights } from "@/lib/services/insights";
import type { PatternAnalysis } from "@/types/dsa-problem";
import type { Insight } from "@/types/insights";

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
  consistencyScore: number;
  patternAnalysis: PatternAnalysis;
  insights: Insight[];
  activityData: { date: string; count: number }[];
  trends: {
    problemsThisWeek: number;
    problemsLastWeek: number;
    logsThisWeek: number;
    logsLastWeek: number;
  };
  peakTime: {
    hour: number;
    count: number;
    label: string;
  } | null;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  // Use UTC date to match @db.Date column storage (timezone-safe)
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Fetch all data in parallel - these are the base queries
  const [
    totalProblemsResult,
    todaysLog,
    recentLogsResult,
    streakStats,
    totalProjectsResult,
    activeProjectsResult,
    easyCount,
    mediumCount,
    hardCount,
    consistencyScore,
    patternAnalysis,
    problemsForInsights, // Fetch problems for insights generation
    logsForInsights,     // Fetch logs for insights generation
    logsForPeak,          // Fetch logs for peak time analysis
  ] = await Promise.all([
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
    getConsistencyScore(userId),
    analyzePatterns(userId, { limit: 1000 }),
    // Pre-fetch data for insights to avoid redundant queries
    prisma.dSAProblem.findMany({
      where: { userId },
      select: { pattern: true, solvedAt: true },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
      take: 120,
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      select: { createdAt: true },
    }),
  ]);

  const recentLogs = recentLogsResult.map((log) => ({
    id: log.id,
    date: log.date,
    problemsSolved: log.problemsSolved,
    topics: log.topics ?? [],
  }));

  // Prepare pre-fetched context for insights generation
  // This avoids redundant DB queries in generateInsights
  const lastLog = recentLogsResult.length > 0 ? recentLogsResult[0] : null;

  // Calculate pattern stats from pre-fetched problems
  const patternCounts = new Map<string, number>();
  for (const problem of problemsForInsights) {
    const normalized = problem.pattern.trim();
    patternCounts.set(normalized, (patternCounts.get(normalized) ?? 0) + 1);
  }

  const patternStats = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: problemsForInsights.length > 0 ? Math.round((count / problemsForInsights.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate days since last log
  let daysSinceLastLog: number | null = null;
  if (lastLog) {
    const lastDate = new Date(lastLog.date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    daysSinceLastLog = Math.floor(
      (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Build pre-fetched context for insights
  const preFetchedInsightContext = {
    problems: problemsForInsights,
    recentLogs: recentLogsResult.slice(0, 7),
    lastLog: lastLog ? { date: lastLog.date } : null,
    logs: logsForInsights,
    patternStats,
    totalProblems: problemsForInsights.length,
    recentLogsCount: recentLogsResult.length,
    daysSinceLastLog,
    currentStreak: streakStats.currentStreak,
    longestStreak: streakStats.longestStreak,
  };

  // Generate insights with pre-fetched context (saves 4 DB queries)
  const insights = await generateInsights(userId, undefined, preFetchedInsightContext);

  // Calculate trends
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setUTCDate(startOfThisWeek.getUTCDate() - 7);

  const stats: DashboardStats = {
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
    consistencyScore,
    patternAnalysis,
    insights,
    activityData: logsForInsights.map(log => ({
      date: log.date.toISOString().slice(0, 10),
      count: 1
    })),
    trends: {
      problemsThisWeek: problemsForInsights.filter(p => new Date(p.solvedAt) >= startOfThisWeek).length,
      problemsLastWeek: problemsForInsights.filter(p => {
        const d = new Date(p.solvedAt);
        return d >= startOfLastWeek && d < startOfThisWeek;
      }).length,
      logsThisWeek: logsForInsights.filter(l => new Date(l.date) >= startOfThisWeek).length,
      logsLastWeek: logsForInsights.filter(l => {
        const d = new Date(l.date);
        return d >= startOfLastWeek && d < startOfThisWeek;
      }).length,
    },
    peakTime: null,
  };

  // Peak Time Calculation
  const hourCounts = new Array(24).fill(0);
  for (const log of logsForPeak) {
    const hour = new Date(log.createdAt).getHours();
    hourCounts[hour]++;
  }

  let peakHour = -1;
  let maxCount = 0;
  for (let h = 0; h < 24; h++) {
    if (hourCounts[h] > maxCount) {
      maxCount = hourCounts[h];
      peakHour = h;
    }
  }

  const formatHour = (h: number) => {
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour} ${period}`;
  };

  stats.peakTime = peakHour === -1 ? null : {
    hour: peakHour,
    count: maxCount,
    label: formatHour(peakHour),
  };

  return stats;
}

export interface WeeklyDataPoint {
  week: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
  weekStart?: Date;
  weekEnd?: Date;
}

async function getConsistencyScore(userId: string): Promise<number> {
  const weeksToCheck = 4;
  const targetLogsPerWeek = 5;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - weeksToCheck * 7);

  const logs = await prisma.dailyLog.findMany({
    where: {
      userId,
      date: { gte: startDate },
    },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  // Group logs by week using UTC
  const weekMap = new Map<number, number>();
  for (const log of logs) {
    const logDate = new Date(log.date);
    const weekStart = new Date(Date.UTC(
      logDate.getUTCFullYear(),
      logDate.getUTCMonth(),
      logDate.getUTCDate()
    ));
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const weekKey = weekStart.getTime();
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
  }

  // Calculate score (0-100) based on weeks that met target
  let weeksMet = 0;
  for (let i = 0; i < weeksToCheck; i++) {
    const checkDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    ));
    checkDate.setUTCDate(checkDate.getUTCDate() - i * 7);
    checkDate.setUTCDate(checkDate.getUTCDate() - checkDate.getUTCDay());
    const logCount = weekMap.get(checkDate.getTime()) ?? 0;
    if (logCount >= targetLogsPerWeek) {
      weeksMet++;
    }
  }

  return Math.round((weeksMet / weeksToCheck) * 100);
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
      difficulty: true,
    },
  });

  // Helper to format date range label (e.g., "Jan 1-7", "Jan 8-14")
  function formatWeekLabel(start: Date, end: Date): string {
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const startDay = start.getDate();
    const endDay = end.getDate();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}-${endDay}`;
    }
    return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
  }

  // Initialize week buckets with date range labels
  const weekBuckets: Array<{ 
    label: string; 
    start: Date; 
    end: Date; 
    count: number;
    easy: number;
    medium: number;
    hard: number;
  }> = [];

  for (let i = 0; i < weeks; i++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    weekBuckets.unshift({
      label: formatWeekLabel(weekStart, weekEnd),
      start: weekStart,
      end: weekEnd,
      count: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    });
  }

  // Count problems per week
  for (const problem of problems) {
    const solvedDate = new Date(problem.solvedAt);

    // Find which week bucket this problem belongs to
    for (const bucket of weekBuckets) {
      if (solvedDate >= bucket.start && solvedDate <= bucket.end) {
        bucket.count++;
        if (problem.difficulty === "EASY") bucket.easy++;
        if (problem.difficulty === "MEDIUM") bucket.medium++;
        if (problem.difficulty === "HARD") bucket.hard++;
        break;
      }
    }
  }

  // Map to WeeklyDataPoint format
  return weekBuckets.map((bucket) => ({
    week: bucket.label,
    count: bucket.count,
    easy: bucket.easy,
    medium: bucket.medium,
    hard: bucket.hard,
    weekStart: bucket.start,
    weekEnd: bucket.end,
  }));
}
