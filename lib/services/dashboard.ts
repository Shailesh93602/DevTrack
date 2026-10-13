import { calculateStreakFromDates } from "@/lib/services/streak";
import { generateInsights } from "@/lib/services/insights";
import { computeScoreFromAggregates } from "@/lib/services/scoring";
import { generateRecommendations } from "@/lib/services/recommendations";
import {
  fetchDashboardSnapshot,
  type DashboardSnapshot,
} from "@/lib/services/dashboard-data";
import {
  calculateConsistencyScore,
  calculateDaysSinceLastLog,
  calculatePeakTime,
  calculateTrends,
  toDifficultyDistribution,
  type ActivityTrends,
  type DifficultyDistribution,
  type PeakTime,
} from "@/lib/services/dashboard-metrics";
import {
  buildPatternAnalysis,
  calculatePatternStats,
} from "@/lib/services/pattern-analysis";
import {
  calculateWeeklyStats,
  type WeeklyDataPoint,
} from "@/lib/services/weekly-progress";
import { normalizeToUtcMidnight, toUtcDateString } from "@/lib/utils/date";
import { SessionWithActivities } from "@/types/session";
import { DAYS_IN_WEEK, STREAK_ANALYSIS_DAYS } from "@/lib/constants";
import type { PatternAnalysis } from "@/types/dsa-problem";
import type { Insight } from "@/types/insights";
import type { DeveloperScore } from "@/types/scoring";
import type { Recommendation } from "@/types/recommendations";

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
  difficultyDistribution: DifficultyDistribution;
  consistencyScore: number;
  patternAnalysis: PatternAnalysis;
  insights: Insight[];
  activityData: { date: string; count: number }[];
  trends: ActivityTrends;
  peakTime: PeakTime | null;
  weeklyProgress: WeeklyDataPoint[];
  developerScore: DeveloperScore;
  recommendations: Recommendation[];
  activeSession: SessionWithActivities | null;
}

const WEEKLY_PROGRESS_WEEKS = 8;
const DENSITY_WINDOW_DAYS = 30;

function daysBefore(today: Date, days: number): Date {
  const cutoff = new Date(today);
  cutoff.setUTCDate(today.getUTCDate() - days);
  return cutoff;
}

/** Current streak from the window; longest respects the all-time record. */
function computeStreaks({ windowLogs, user }: DashboardSnapshot) {
  const logDates = windowLogs.map((log) => toUtcDateString(log.date));
  const { currentStreak, longestStreak: windowLongest } =
    calculateStreakFromDates(logDates);
  const longestStreak = Math.max(windowLongest, user?.longestStreak ?? 0);
  return { currentStreak, longestStreak };
}

function summarizeProjects(projectsRaw: readonly { status: string }[]) {
  return {
    totalProjects: projectsRaw.length,
    activeProjects: projectsRaw.filter(
      (project) => project.status === "IN_PROGRESS"
    ).length,
    completedProjects: projectsRaw.filter(
      (project) => project.status === "COMPLETED"
    ).length,
  };
}

export async function getDashboardStats(
  userId: string
): Promise<DashboardStats> {
  const now = new Date();
  const today = normalizeToUtcMidnight(now);
  // Time-windowed stats (heatmap, streaks, insights) read from this cutoff.
  const windowCutoff = daysBefore(today, STREAK_ANALYSIS_DAYS);
  // Density component of the consistency score.
  const thirtyDaysAgo = daysBefore(today, DENSITY_WINDOW_DAYS);

  const snapshot = await fetchDashboardSnapshot(userId, windowCutoff);
  const {
    totalProblems,
    recentProblems,
    windowLogs,
    recentLogsResult,
    completedMilestonesCount,
  } = snapshot;

  const difficultyDistribution = toDifficultyDistribution(
    snapshot.difficultyCounts
  );
  const todaysLog = windowLogs.find(
    (log) => normalizeToUtcMidnight(log.date).getTime() === today.getTime()
  );
  const { currentStreak, longestStreak } = computeStreaks(snapshot);
  const { totalProjects, activeProjects, completedProjects } =
    summarizeProjects(snapshot.projectsRaw);

  const patternStats = calculatePatternStats(recentProblems);
  const lastLog = recentLogsResult.length > 0 ? recentLogsResult[0] : null;
  const daysSinceLastLog = calculateDaysSinceLastLog(lastLog);

  const insights = await generateInsights(userId, undefined, {
    problems: recentProblems,
    recentLogs: recentLogsResult.slice(0, DAYS_IN_WEEK),
    lastLog: lastLog ? { date: lastLog.date } : null,
    logs: windowLogs,
    patternStats,
    totalProblems,
    recentLogsCount: recentLogsResult.length,
    daysSinceLastLog,
    currentStreak,
    longestStreak,
  });

  // Score and recommendations reuse the snapshot: zero extra DB calls.
  const developerScore = computeScoreFromAggregates({
    currentStreak,
    windowLogs,
    thirtyDaysAgo,
    easyCount: difficultyDistribution.easy,
    mediumCount: difficultyDistribution.medium,
    hardCount: difficultyDistribution.hard,
    completedMilestones: completedMilestonesCount,
    completedProjects,
  });

  const recommendations = generateRecommendations({
    // Weakest pattern first, as the recommendation engine expects.
    patternStats: [...patternStats].sort((a, b) => a.count - b.count),
    totalProblems,
    easyCount: difficultyDistribution.easy,
    mediumCount: difficultyDistribution.medium,
    hardCount: difficultyDistribution.hard,
    currentStreak,
    activeDaysLast30: windowLogs.filter(
      (log) => new Date(log.date) >= thirtyDaysAgo
    ).length,
    daysSinceLastLog,
    loggedToday: todaysLog !== undefined,
    completedMilestones: completedMilestonesCount,
    completedProjects,
    totalProjects,
  });

  return {
    totalProblems,
    todaysProblems: todaysLog?.problemsSolved ?? 0,
    recentLogs: recentLogsResult.map((log) => ({
      id: log.id,
      date: log.date,
      problemsSolved: log.problemsSolved,
      topics: (log.topics as string[]) ?? [],
    })),
    currentStreak,
    longestStreak,
    totalProjects,
    activeProjects,
    difficultyDistribution,
    consistencyScore: calculateConsistencyScore(windowLogs, now),
    patternAnalysis: buildPatternAnalysis(recentProblems),
    insights,
    activityData: windowLogs.map((log) => ({
      date: toUtcDateString(log.date),
      count: 1,
    })),
    trends: calculateTrends(recentProblems, windowLogs, today),
    peakTime: calculatePeakTime(windowLogs),
    weeklyProgress: calculateWeeklyStats(
      recentProblems,
      now,
      WEEKLY_PROGRESS_WEEKS
    ),
    developerScore,
    recommendations,
    activeSession: snapshot.activeSession,
  };
}
