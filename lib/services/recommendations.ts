// ============================================================
// Recommendation Engine
// ============================================================
// Pure, synchronous rule-based engine.
// Callers supply a RecommendationContext — no DB calls here.
// Evaluates all rules in urgency order, caps output at 3.
// ============================================================

import type { Recommendation, RecommendationContext } from "@/types/recommendations";

const MAX_RECOMMENDATIONS = 3;

// ─── Individual rule functions ────────────────────────────────────────────────
// Each returns a Recommendation or null if the rule does not fire.

/** CRITICAL: User has never logged any activity */
function ruleNeverLogged(ctx: RecommendationContext): Recommendation | null {
  if (ctx.daysSinceLastLog !== null) return null;
  return {
    id: "rec-start-journey",
    urgency: "critical",
    icon: "🚀",
    title: "Start your developer journey",
    reason: "You haven't logged any activity yet. Every expert was once a beginner.",
    cta: { label: "Log your first day", href: "/dashboard/logs" },
  };
}

/** CRITICAL: User has an active streak but hasn't logged today */
function ruleStreakAtRisk(ctx: RecommendationContext): Recommendation | null {
  if (ctx.currentStreak < 1) return null;
  if (ctx.loggedToday) return null;
  return {
    id: "rec-streak-at-risk",
    urgency: "critical",
    icon: "🔥",
    title: "Keep your streak alive",
    reason: `You have a ${ctx.currentStreak}-day streak. Log today before midnight so you don't lose it.`,
    cta: { label: "Log today", href: "/dashboard/logs" },
    metric: { label: "Current streak", value: `${ctx.currentStreak} days` },
  };
}

/** CRITICAL: User has been inactive for 3+ days */
function ruleActivityDropped(ctx: RecommendationContext): Recommendation | null {
  if (ctx.daysSinceLastLog === null) return null;
  if (ctx.daysSinceLastLog < 3) return null;
  return {
    id: "rec-activity-dropped",
    urgency: "critical",
    icon: "⚡",
    title: "Your momentum is fading",
    reason: `It's been ${ctx.daysSinceLastLog} days since you last logged. Get back on track today.`,
    cta: { label: "Log a session", href: "/dashboard/logs" },
    metric: { label: "Days inactive", value: ctx.daysSinceLastLog },
  };
}

/** HIGH: Weakest DSA pattern needs focused practice */
function ruleWeakPattern(ctx: RecommendationContext): Recommendation | null {
  if (ctx.totalProblems < 10) return null;
  // patternStats is sorted ascending by count — weakest first
  const weakest = ctx.patternStats[0];
  if (!weakest || weakest.count > 2) return null;
  return {
    id: `rec-weak-${weakest.pattern.toLowerCase().replaceAll(/\s+/g, "-")}`,
    urgency: "high",
    icon: "🎯",
    title: `Practice ${weakest.pattern}`,
    reason: `You've only solved ${weakest.count} ${weakest.pattern} problem${weakest.count === 1 ? "" : "s"}. Fixing this gap will make your profile much more balanced.`,
    cta: { label: "Solve a problem", href: "/dashboard/problems" },
    metric: { label: "Solved so far", value: weakest.count },
  };
}

/** HIGH: Time to level up from Easy-only to Medium */
function ruleLevelUpToMedium(ctx: RecommendationContext): Recommendation | null {
  if (ctx.easyCount === 0) return null;
  if (ctx.mediumCount > 0) return null;
  return {
    id: "rec-level-up-medium",
    urgency: "high",
    icon: "📈",
    title: "Level up to Medium problems",
    reason: `You've solved ${ctx.easyCount} Easy problem${ctx.easyCount === 1 ? "" : "s"} — you're ready for a Medium challenge.`,
    cta: { label: "Try a Medium problem", href: "/dashboard/problems" },
    metric: { label: "Easy solved", value: ctx.easyCount },
  };
}

/** HIGH: Time to attempt a Hard problem */
function ruleTryHard(ctx: RecommendationContext): Recommendation | null {
  if (ctx.mediumCount < 5) return null;
  if (ctx.hardCount > 0) return null;
  return {
    id: "rec-try-hard",
    urgency: "high",
    icon: "💪",
    title: "Attempt your first Hard problem",
    reason: `You've solved ${ctx.mediumCount} Medium problems. You're ready to push your limits with a Hard.`,
    cta: { label: "Try a Hard problem", href: "/dashboard/problems" },
    metric: { label: "Medium solved", value: ctx.mediumCount },
  };
}

/** MEDIUM: Low monthly activity — push for more consistency */
function ruleLowMonthlyActivity(ctx: RecommendationContext): Recommendation | null {
  if (ctx.totalProblems === 0 && ctx.daysSinceLastLog === null) return null;
  if (ctx.activeDaysLast30 >= 10) return null;
  return {
    id: "rec-low-monthly",
    urgency: "medium",
    icon: "📅",
    title: "Boost your monthly consistency",
    reason: `You've only logged ${ctx.activeDaysLast30} day${ctx.activeDaysLast30 === 1 ? "" : "s"} this month. Aim for at least 10 active days to build a strong habit.`,
    cta: { label: "Log today", href: "/dashboard/logs" },
    metric: { label: "Active days this month", value: ctx.activeDaysLast30 },
  };
}

/** MEDIUM: Has projects but no milestones */
function ruleAddMilestone(ctx: RecommendationContext): Recommendation | null {
  if (ctx.totalProjects === 0) return null;
  if (ctx.completedMilestones > 0) return null;
  return {
    id: "rec-add-milestone",
    urgency: "medium",
    icon: "🏁",
    title: "Break your project into milestones",
    reason: "Projects with milestones are 3× more likely to be completed. Add your first milestone now.",
    cta: { label: "View projects", href: "/dashboard/projects" },
  };
}

/** MEDIUM: No projects created yet */
function ruleCreateProject(ctx: RecommendationContext): Recommendation | null {
  if (ctx.totalProjects > 0) return null;
  if (ctx.totalProblems < 5) return null; // don't overwhelm brand-new users
  return {
    id: "rec-create-project",
    urgency: "medium",
    icon: "🗂️",
    title: "Start tracking a project",
    reason: "Pair your DSA practice with real project work to grow as a complete developer.",
    cta: { label: "Create a project", href: "/dashboard/projects" },
  };
}

/** LOW: Diversify patterns if only one pattern practiced */
function ruleDiversifyPattern(ctx: RecommendationContext): Recommendation | null {
  if (ctx.patternStats.length !== 1) return null;
  if (ctx.totalProblems < 5) return null;
  return {
    id: "rec-diversify",
    urgency: "low",
    icon: "🌐",
    title: "Diversify your patterns",
    reason: `You've only practiced ${ctx.patternStats[0].pattern}. Exploring other patterns will make you interview-ready.`,
    cta: { label: "Browse problems", href: "/dashboard/problems" },
  };
}

/** LOW: Streak encouragement / positive reinforcement */
function ruleStreakCelebration(ctx: RecommendationContext): Recommendation | null {
  if (ctx.currentStreak < 7) return null;
  if (!ctx.loggedToday) return null; // already shown streak-at-risk otherwise
  return {
    id: `rec-streak-champ-${ctx.currentStreak}`,
    urgency: "low",
    icon: "🏆",
    title: `${ctx.currentStreak}-day streak — keep going!`,
    reason: "You're building an impressive habit. Stay consistent and aim for the next milestone.",
    cta: { label: "View your progress", href: "/dashboard" },
    metric: { label: "Current streak", value: `${ctx.currentStreak} days` },
  };
}

// ─── Ordered rule pipeline ────────────────────────────────────────────────────
// Evaluated in order; first MAX_RECOMMENDATIONS matching rules win.

const RULES: Array<(ctx: RecommendationContext) => Recommendation | null> = [
  // Critical
  ruleNeverLogged,
  ruleStreakAtRisk,
  ruleActivityDropped,
  // High
  ruleWeakPattern,
  ruleLevelUpToMedium,
  ruleTryHard,
  // Medium
  ruleLowMonthlyActivity,
  ruleAddMilestone,
  ruleCreateProject,
  // Low
  ruleDiversifyPattern,
  ruleStreakCelebration,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate up to MAX_RECOMMENDATIONS prescriptive next-step recommendations.
 * Pure and synchronous — callers must supply a fully populated RecommendationContext.
 */
export function generateRecommendations(
  ctx: RecommendationContext
): Recommendation[] {
  const results: Recommendation[] = [];

  for (const rule of RULES) {
    if (results.length >= MAX_RECOMMENDATIONS) break;
    const rec = rule(ctx);
    if (rec) results.push(rec);
  }

  return results;
}
