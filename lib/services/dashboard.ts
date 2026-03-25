import { prisma } from "@/lib/db/prisma";
import { calculateStreakFromDates } from "@/lib/services/streak";
import { generateInsights } from "@/lib/services/insights";
import { computeScoreFromAggregates } from "@/lib/services/scoring";
import { normalizeToUtcMidnight, toUtcDateString } from "@/lib/utils/date";
import {
  CONSISTENCY_TARGET_LOGS_PER_WEEK,
  CONSISTENCY_WEEKS_CHECK,
  DAYS_IN_WEEK,
  MS_PER_DAY,
  RECENT_LOGS_DISPLAY_LIMIT,
  STREAK_ANALYSIS_DAYS,
} from "@/lib/constants";
import type { PatternAnalysis } from "@/types/dsa-problem";
import type { Insight } from "@/types/insights";
import type { DeveloperScore } from "@/types/scoring";

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
  weeklyProgress: WeeklyDataPoint[];
  developerScore: DeveloperScore;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const now = new Date();
  const today = normalizeToUtcMidnight(now);
  
  // Cutoff for time-windowed stats (Heatmap, Streaks, Insights)
  const windowCutoff = new Date(today);
  windowCutoff.setUTCDate(today.getUTCDate() - (STREAK_ANALYSIS_DAYS));

  // 30-day window for density component of Consistency Score
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);

  // Fetch data in parallel with targeted queries
  const [
    totalProblems,
    difficultyCounts,
    recentProblems, // for patterns and insights window
    windowLogs,     // for streaks, heatmap, consistency (last 120 days)
    recentLogsResult, // top 5 most recent
    projectsRaw,
    user,
    completedMilestonesCount,
  ] = await Promise.all([
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
      select: { id: true, date: true, problemsSolved: true, topics: true, createdAt: true },
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
      select: { status: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { longestStreak: true }
    }),
    prisma.milestone.count({
      where: { userId, completedAt: { not: null } },
    }),
  ]);

  // --- In-Memory Aggregations ---

  // 1. Difficulty distribution from groupBy result
  const difficultyDistribution = { easy: 0, medium: 0, hard: 0 };
  for (const group of difficultyCounts) {
    if (group.difficulty === "EASY") difficultyDistribution.easy = group._count;
    else if (group.difficulty === "MEDIUM") difficultyDistribution.medium = group._count;
    else if (group.difficulty === "HARD") difficultyDistribution.hard = group._count;
  }

  // 2. Todays stats from windowLogs or recent query
  const todaysLog = windowLogs.find(l => normalizeToUtcMidnight(l.date).getTime() === today.getTime());

  // 3. Recent logs
  const recentLogs = recentLogsResult.map(l => ({
    id: l.id,
    date: l.date,
    problemsSolved: l.problemsSolved,
    topics: l.topics ?? []
  }));

  // 4. Streaks (use window data for current, User table for longest)
  const logDates = windowLogs.map(l => toUtcDateString(l.date));
  const { currentStreak, longestStreak: windowLongest } = calculateStreakFromDates(logDates);
  // Respect the all-time longest from user record if it's higher
  const longestStreak = Math.max(windowLongest, user?.longestStreak ?? 0);

  // 5. Projects
  const totalProjects = projectsRaw.length;
  const activeProjects = projectsRaw.filter(p => p.status === "IN_PROGRESS").length;
  const completedProjects = projectsRaw.filter(p => p.status === "COMPLETED").length;

  // 6. Insights & Weekly Stats
  const patternAnalysis = calculatePatternAnalysisLocal(recentProblems);
  const patternStats = calculatePatternStats(recentProblems);
  const lastLog = recentLogsResult.length > 0 ? recentLogsResult[0] : null;

  const preFetchedInsightContext = {
    problems: recentProblems,
    recentLogs: recentLogsResult.slice(0, DAYS_IN_WEEK),
    lastLog: lastLog ? { date: lastLog.date } : null,
    logs: windowLogs,
    patternStats,
    totalProblems: totalProblems, // use global count
    recentLogsCount: recentLogsResult.length,
    daysSinceLastLog: calculateDaysSinceLastLog(lastLog),
    currentStreak,
    longestStreak,
  };

  const weeklyProgress = calculateWeeklyStatsLocal(recentProblems, now, 8);
  const insights = await generateInsights(userId, undefined, preFetchedInsightContext);

  // Developer Score — computed from pre-fetched aggregates; zero extra DB calls
  const developerScore = computeScoreFromAggregates({
    currentStreak,
    windowLogs,
    thirtyDaysAgo,
    easyCount:           difficultyDistribution.easy,
    mediumCount:         difficultyDistribution.medium,
    hardCount:           difficultyDistribution.hard,
    completedMilestones: completedMilestonesCount,
    completedProjects,
  });

  return {
    totalProblems,
    todaysProblems: todaysLog?.problemsSolved ?? 0,
    recentLogs,
    currentStreak,
    longestStreak,
    totalProjects,
    activeProjects,
    difficultyDistribution,
    consistencyScore: calculateConsistencyScoreLocal(windowLogs, now),
    patternAnalysis,
    insights,
    activityData: windowLogs.map(log => ({
      date: toUtcDateString(log.date),
      count: 1
    })),
    trends: calculateTrends(recentProblems, windowLogs, today),
    peakTime: calculatePeakTime(windowLogs),
    weeklyProgress,
    developerScore,
  };
}

// Helper to avoid full analyzePatterns DB trip
function calculatePatternAnalysisLocal(problems: { pattern: string }[]): PatternAnalysis {
  const total = problems.length;
  if (total === 0) {
    return {
      patterns: [],
      summary: { totalProblems: 0, uniquePatterns: 0, mostPracticed: null, leastPracticed: null }
    };
  }

  const patternCounts = new Map<string, number>();
  for (const p of problems) {
    const normalized = p.pattern.trim();
    patternCounts.set(normalized, (patternCounts.get(normalized) ?? 0) + 1);
  }

  const patterns = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({ pattern, count, percentage: Math.round((count / total) * 100) }))
    .sort((a, b) => (b.count - a.count) || a.pattern.localeCompare(b.pattern));

  const mostPracticed = patterns[0];
  const leastPracticed = patterns.at(-1) ?? null;

  return {
    patterns,
    summary: {
      totalProblems: total,
      uniquePatterns: patterns.length,
      mostPracticed,
      leastPracticed: leastPracticed?.count === mostPracticed?.count ? null : leastPracticed
    }
  };
}

function calculateConsistencyScoreLocal(logs: { date: Date }[], now: Date): number {
  const weeksToCheck = CONSISTENCY_WEEKS_CHECK;
  const targetLogsPerWeek = CONSISTENCY_TARGET_LOGS_PER_WEEK;

  const weekMap = new Map<number, number>();
  for (const log of logs) {
    const weekStart = normalizeToUtcMidnight(log.date);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const weekKey = weekStart.getTime();
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
  }

  let weeksMet = 0;
  for (let i = 0; i < weeksToCheck; i++) {
    const checkDate = normalizeToUtcMidnight(now);
    checkDate.setUTCDate(checkDate.getUTCDate() - i * DAYS_IN_WEEK);
    checkDate.setUTCDate(checkDate.getUTCDate() - checkDate.getUTCDay());
    if ((weekMap.get(checkDate.getTime()) ?? 0) >= targetLogsPerWeek) weeksMet++;
  }

  return Math.round((weeksMet / weeksToCheck) * 100);
}

function calculateWeeklyStatsLocal(
  problems: { solvedAt: Date, difficulty: string }[], 
  now: Date, 
  weeks: number
): WeeklyDataPoint[] {
  const buckets = initializeWeekBuckets(now, weeks);
  for (const problem of problems) {
    const solvedDate = new Date(problem.solvedAt);
    const bucket = buckets.find(b => solvedDate >= b.start && solvedDate <= b.end);
    if (bucket) {
      bucket.count++;
      if (problem.difficulty === "EASY") bucket.easy++;
      else if (problem.difficulty === "MEDIUM") bucket.medium++;
      else if (problem.difficulty === "HARD") bucket.hard++;
    }
  }

  return buckets.map(b => ({
    week: b.label,
    count: b.count,
    easy: b.easy,
    medium: b.medium,
    hard: b.hard,
    weekStart: b.start,
    weekEnd: b.end,
  }));
}

// --- Helper Functions ---

function calculatePatternStats(problems: { pattern: string }[]) {
  const patternCounts = new Map<string, number>();
  for (const p of problems) {
    const normalized = p.pattern.trim();
    patternCounts.set(normalized, (patternCounts.get(normalized) ?? 0) + 1);
  }

  return Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: problems.length > 0 ? Math.round((count / problems.length) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateDaysSinceLastLog(lastLog: { date: Date } | null): number | null {
  if (!lastLog) return null;
  const lastDate = new Date(lastLog.date);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((todayDate.getTime() - lastDate.getTime()) / MS_PER_DAY);
}

function calculateTrends(
  problems: { solvedAt: Date }[],
  logs: { date: Date }[],
  today: Date
) {
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setUTCDate(startOfThisWeek.getUTCDate() - DAYS_IN_WEEK);

  return {
    problemsThisWeek: problems.filter(p => new Date(p.solvedAt) >= startOfThisWeek).length,
    problemsLastWeek: problems.filter(p => {
      const d = new Date(p.solvedAt);
      return d >= startOfLastWeek && d < startOfThisWeek;
    }).length,
    logsThisWeek: logs.filter(l => new Date(l.date) >= startOfThisWeek).length,
    logsLastWeek: logs.filter(l => {
      const d = new Date(l.date);
      return d >= startOfLastWeek && d < startOfThisWeek;
    }).length,
  };
}

function calculatePeakTime(logs: { createdAt: Date }[]) {
  const hourCounts = new Array(24).fill(0);
  for (const log of logs) {
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

  if (peakHour === -1) return null;

  const period = peakHour >= 12 ? "PM" : "AM";
  const displayHour = peakHour % 12 || 12;
  
  return {
    hour: peakHour,
    count: maxCount,
    label: `${displayHour} ${period}`,
  };
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

// --- Helper Functions ---

function formatWeekLabel(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();

  return startMonth === endMonth 
    ? `${startMonth} ${startDay}-${endDay}`
    : `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

function initializeWeekBuckets(now: Date, weeks: number) {
  const buckets: Array<{ 
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
    weekEnd.setDate(weekEnd.getDate() - i * DAYS_IN_WEEK);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - (DAYS_IN_WEEK - 1));
    weekStart.setHours(0, 0, 0, 0);

    buckets.unshift({
      label: formatWeekLabel(weekStart, weekEnd),
      start: weekStart,
      end: weekEnd,
      count: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    });
  }
  return buckets;
}
