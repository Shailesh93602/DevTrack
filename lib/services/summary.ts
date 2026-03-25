import { getDashboardStats } from "@/lib/services/dashboard";
import { formatLogDate } from "@/lib/utils/formatters";

export interface WeeklySummary {
  period: string;
  totalSolved: number;
  solvedDelta: number;
  consistencyScore: number;
  topPattern: string;
  mainInsight: string;
  recommendation: string;
}

export async function getWeeklySummary(userId: string): Promise<WeeklySummary> {
  const stats = await getDashboardStats(userId);

  const end = new Date();
  const start = new Date();
  start.setUTCDate(end.getUTCDate() - 7);

  const topInsight =
    stats.insights.length > 0
      ? stats.insights[0]
      : {
          title: "Doing Great!",
          message: "Keep up your consistent logging activity.",
        };

  const recommendation =
    stats.insights.find((i) => i.type === "weakness" || i.type === "suggestion")
      ?.message ?? "Consider exploring a new problem pattern this week.";

  return {
    period: `${formatLogDate(start)} - ${formatLogDate(end)}`,
    totalSolved: stats.trends.problemsThisWeek,
    solvedDelta: stats.trends.problemsThisWeek - stats.trends.problemsLastWeek,
    consistencyScore: stats.consistencyScore,
    topPattern: stats.patternAnalysis.summary.mostPracticed?.pattern ?? "None",
    mainInsight: topInsight.message,
    recommendation,
  };
}

export function formatSummaryToMarkdown(summary: WeeklySummary): string {
  const deltaText =
    summary.solvedDelta >= 0
      ? `📈 Up by ${summary.solvedDelta} from last week`
      : `📉 Down by ${Math.abs(summary.solvedDelta)} from last week`;

  return `
# Your Weekly DevTrack Summary
**Period**: ${summary.period}

---

### 📊 Performance Overview
- **Problems Solved**: ${summary.totalSolved} (${deltaText})
- **Coding Consistency**: ${summary.consistencyScore}%
- **Top Pattern**: ${summary.topPattern}

### 💡 Key Insight
${summary.mainInsight}

### 🚀 Recommendation
${summary.recommendation}

*Keep going! Consistency is the key to mastery.*
  `.trim();
}
