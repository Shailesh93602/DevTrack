import { prisma } from "@/lib/db/prisma";
import type {
  Insight,
  InsightContext,
  InsightConfig,
} from "@/types/insights";
import { DEFAULT_INSIGHT_CONFIG } from "@/types/insights";

/**
 * Generate unique ID for insight
 */
function generateInsightId(type: string, suffix: string): string {
  return `${type}-${suffix}`;
}

/**
 * Build insight context from user data
 */
async function buildInsightContext(userId: string): Promise<InsightContext> {
  const [
    problems,
    recentLogs,
    lastLog,
    logs,
  ] = await Promise.all([
    prisma.dSAProblem.findMany({
      where: { userId },
      select: { pattern: true },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
      select: { id: true },
    }),
    prisma.dailyLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "asc" },
      take: 120,
    }),
  ]);

  // Calculate pattern stats
  const patternCounts = new Map<string, number>();
  for (const problem of problems) {
    const normalized = problem.pattern.trim();
    patternCounts.set(normalized, (patternCounts.get(normalized) ?? 0) + 1);
  }

  const totalProblems = problems.length;
  const patternStats = Array.from(patternCounts.entries())
    .map(([pattern, count]) => ({
      pattern,
      count,
      percentage: totalProblems > 0 ? Math.round((count / totalProblems) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate days since last log
  let daysSinceLastLog: number | null = null;
  if (lastLog) {
    const lastDate = new Date(lastLog.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    daysSinceLastLog = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Calculate current streak
  const dates = logs.map((log) =>
    log.date.toISOString().slice(0, 10)
  );

  // Calculate longest streak from logs
  let longestStreak = 0;
  if (dates.length > 0) {
    let currentStreakCount = 1;
    longestStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const dateA = new Date(dates[i - 1] + "T00:00:00Z");
      const dateB = new Date(dates[i] + "T00:00:00Z");
      const diffMs = dateB.getTime() - dateA.getTime();
      if (diffMs === 86_400_000) {
        currentStreakCount++;
        longestStreak = Math.max(longestStreak, currentStreakCount);
      } else {
        currentStreakCount = 1;
      }
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let currentStreak = 0;
  if (dates.length > 0) {
    const lastDate = dates.at(-1)!;
    if (lastDate === todayStr || lastDate === yesterdayStr) {
      currentStreak = 1;
      for (let i = dates.length - 2; i >= 0; i--) {
        const dateA = new Date(dates[i] + "T00:00:00Z");
        const dateB = new Date(dates[i + 1] + "T00:00:00Z");
        const diffMs = dateB.getTime() - dateA.getTime();
        if (diffMs === 86_400_000) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    patternStats,
    totalProblems,
    recentLogsCount: recentLogs.length,
    daysSinceLastLog,
    currentStreak,
    longestStreak,
  };
}

/**
 * Apply rule: Strength identification
 * Patterns with high count and percentage above threshold
 */
function applyStrengthRules(
  context: InsightContext,
  config: InsightConfig
): Insight[] {
  const insights: Insight[] = [];

  for (const stat of context.patternStats) {
    if (
      stat.count >= config.thresholds.strengthMinCount &&
      stat.percentage >= config.thresholds.strengthMinPercentage
    ) {
      insights.push({
        id: generateInsightId("strength", stat.pattern.toLowerCase().replaceAll(/\s+/g, "-")),
        type: "strength",
        priority: "medium",
        title: `Strong in ${stat.pattern}`,
        message: `You've solved ${stat.count} ${stat.pattern} problems (${stat.percentage}% of your total). This is your strongest area.`,
        metric: {
          label: "Problems solved",
          value: stat.count,
        },
      });
    }
  }

  return insights;
}

/**
 * Apply rule: Weakness identification
 * Patterns with very low practice
 */
function applyWeaknessRules(
  context: InsightContext,
  config: InsightConfig
): Insight[] {
  const insights: Insight[] = [];

  // Only suggest weaknesses if user has solved enough problems overall
  if (context.totalProblems < 10) {
    return insights;
  }

  for (const stat of context.patternStats) {
    if (stat.count <= config.thresholds.weaknessMaxCount) {
      insights.push({
        id: generateInsightId("weakness", stat.pattern.toLowerCase().replaceAll(/\s+/g, "-")),
        type: "weakness",
        priority: "high",
        title: `Practice ${stat.pattern} more`,
        message: `You've only solved ${stat.count} ${stat.pattern} problem${stat.count === 1 ? "" : "s"}. Consider focusing on this pattern to build a more balanced skillset.`,
        metric: {
          label: "Problems solved",
          value: stat.count,
        },
        action: {
          label: "Browse problems",
          href: "/dashboard/problems",
        },
      });
    }
  }

  return insights;
}

/**
 * Apply rule: Activity drop detection
 */
function applyActivityRules(
  context: InsightContext,
  config: InsightConfig
): Insight[] {
  const insights: Insight[] = [];

  // No logs at all
  if (context.daysSinceLastLog === null) {
    insights.push({
      id: generateInsightId("activity", "no-logs"),
      type: "activity",
      priority: "high",
      title: "Start your journey",
      message: "You haven't logged any activity yet. Start by logging your first day of coding!",
      action: {
        label: "Log activity",
        href: "/dashboard/logs",
      },
    });
    return insights;
  }

  // Activity dropped
  if (context.daysSinceLastLog >= config.thresholds.inactivityDays) {
    insights.push({
      id: generateInsightId("activity", "dropped"),
      type: "activity",
      priority: "high",
      title: "Your activity dropped",
      message: `It's been ${context.daysSinceLastLog} days since your last log. Don't break your momentum—get back to it!`,
      metric: {
        label: "Days since last log",
        value: context.daysSinceLastLog,
      },
      action: {
        label: "Log today",
        href: "/dashboard/logs",
      },
    });
    return insights;
  }

  // Low recent activity
  if (context.recentLogsCount < 3 && context.totalProblems > 0) {
    insights.push({
      id: generateInsightId("activity", "low"),
      type: "activity",
      priority: "medium",
      title: "Keep the momentum",
      message: "You've only logged a few days recently. Try to maintain a more consistent schedule.",
      metric: {
        label: "Recent logs",
        value: context.recentLogsCount,
      },
    });
  }

  return insights;
}

/**
 * Apply rule: Streak milestones
 */
function applyStreakRules(
  context: InsightContext,
  config: InsightConfig
): Insight[] {
  const insights: Insight[] = [];

  // Streak milestone
  if (context.currentStreak > 0 && context.currentStreak % config.thresholds.streakMilestoneInterval === 0) {
    insights.push({
      id: generateInsightId("milestone", `streak-${context.currentStreak}`),
      type: "milestone",
      priority: "medium",
      title: `${context.currentStreak}-day streak!`,
      message: `Amazing! You've maintained a ${context.currentStreak}-day coding streak. Keep it up!`,
      metric: {
        label: "Current streak",
        value: `${context.currentStreak} days`,
      },
    });
  }

  // Approaching longest streak
  if (
    context.currentStreak > 0 &&
    context.longestStreak > context.currentStreak &&
    context.longestStreak - context.currentStreak <= 2
  ) {
    insights.push({
      id: generateInsightId("milestone", "approaching-record"),
      type: "milestone",
      priority: "low",
      title: "Approaching your record",
      message: `You're ${context.longestStreak - context.currentStreak} day${context.longestStreak - context.currentStreak === 1 ? "" : "s"} away from matching your longest streak of ${context.longestStreak} days.`,
      metric: {
        label: "Longest streak",
        value: context.longestStreak,
      },
    });
  }

  return insights;
}

/**
 * Apply rule: Suggestions based on patterns
 */
function applySuggestionRules(context: InsightContext): Insight[] {
  const insights: Insight[] = [];

  // New user suggestion
  if (context.totalProblems === 0) {
    insights.push({
      id: generateInsightId("suggestion", "get-started"),
      type: "suggestion",
      priority: "medium",
      title: "Get started with DSA",
      message: "Start by solving your first problem. Begin with easy problems to build confidence.",
      action: {
        label: "Add problem",
        href: "/dashboard/problems",
      },
    });
    return insights;
  }

  // Balanced practice suggestion
  if (context.patternStats.length === 1 && context.totalProblems >= 5) {
    insights.push({
      id: generateInsightId("suggestion", "diversify"),
      type: "suggestion",
      priority: "low",
      title: "Diversify your practice",
      message: `You've focused heavily on ${context.patternStats[0].pattern}. Try exploring other patterns to build a well-rounded skillset.`,
      action: {
        label: "Browse patterns",
        href: "/dashboard/problems",
      },
    });
  }

  return insights;
}

/**
 * Generate all insights for a user
 */
export async function generateInsights(
  userId: string,
  config: InsightConfig = DEFAULT_INSIGHT_CONFIG
): Promise<Insight[]> {
  const context = await buildInsightContext(userId);

  const allInsights = [
    ...applyStrengthRules(context, config),
    ...applyWeaknessRules(context, config),
    ...applyActivityRules(context, config),
    ...applyStreakRules(context, config),
    ...applySuggestionRules(context),
  ];

  // Sort by priority (high -> medium -> low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return allInsights.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}
