import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import {
  getDashboardStats,
  getWeeklyProblemStats,
} from "@/lib/services/dashboard";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { InsightsList } from "@/components/dashboard/InsightsList";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { DifficultyDistribution } from "@/components/dashboard/DifficultyDistribution";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { TrendsCard } from "@/components/dashboard/TrendsCard";
import { PeakTimeCard } from "@/components/dashboard/PeakTimeCard";
import { formatLogDate } from "@/lib/utils/formatters";
import { BookOpen } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);
  const weeklyStats = await getWeeklyProblemStats(user.id, 8);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-foreground text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          Your developer progress at a glance.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatsCard
          title="Problems"
          value={stats.totalProblems}
          description="Total solved"
        />
        <StatsCard
          title="Streak"
          value={stats.currentStreak}
          description={stats.currentStreak === 1 ? "day" : "days"}
        />
        <StatsCard
          title="Projects"
          value={stats.activeProjects}
          description="Active"
        />
        <StatsCard
          title="Today"
          value={stats.todaysProblems}
          description="Solved"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-2">
          <h3 className="text-foreground text-sm font-semibold">
            Weekly Progress
          </h3>
          <WeeklyProgressChart data={weeklyStats} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-foreground text-sm font-semibold">
            Difficulty
          </h3>
          <DifficultyDistribution data={stats.difficultyDistribution} />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-foreground text-sm font-semibold">Insights</h3>
          <InsightsList insights={stats.insights} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TrendsCard trends={stats.trends} />
        <PeakTimeCard peakTime={stats.peakTime} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-foreground text-sm font-semibold">
            Strongest Pattern
          </h3>
          <Card className="border-border rounded-lg border shadow-none">
            <CardContent className="pt-6">
              <PatternCard analysis={stats.patternAnalysis} type="strongest" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <h3 className="text-foreground text-sm font-semibold">
            Needs Practice
          </h3>
          <Card className="border-border rounded-lg border shadow-none">
            <CardContent className="pt-6">
              <PatternCard analysis={stats.patternAnalysis} type="weakest" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-foreground text-sm font-semibold">Activity</h3>
        <ActivityHeatmap data={stats.activityData} />
      </div>

      <div className="space-y-4">
        <h3 className="text-foreground text-sm font-semibold">Recent Logs</h3>
        <Card className="border-border rounded-lg border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Last 5 Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            {stats.recentLogs.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground mt-3 text-sm">
                  No logs yet. Start tracking your daily progress!
                </p>
              </div>
            ) : (
              <div className="divide-border divide-y">
                {stats.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-foreground text-sm font-medium">
                        {formatLogDate(log.date)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {log.problemsSolved}{" "}
                        {log.problemsSolved === 1 ? "problem" : "problems"}
                      </span>
                    </div>
                    {log.topics.length > 0 && (
                      <div className="flex gap-1">
                        {log.topics.slice(0, 3).map((topic) => (
                          <Badge
                            key={topic}
                            variant="secondary"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                        {log.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{log.topics.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
