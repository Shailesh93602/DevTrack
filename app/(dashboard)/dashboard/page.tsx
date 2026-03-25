import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

import { StatsCard } from "@/components/dashboard/stats-card";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getDashboardStats } from "@/lib/services/dashboard";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { InsightsList } from "@/components/dashboard/InsightsList";
import { PatternCard } from "@/components/dashboard/PatternCard";
import { DifficultyDistribution } from "@/components/dashboard/DifficultyDistribution";
import { ActivityHeatmap } from "@/components/dashboard/ActivityHeatmap";
import { TrendsCard } from "@/components/dashboard/TrendsCard";
import { PeakTimeCard } from "@/components/dashboard/PeakTimeCard";
import { DeveloperScoreCard } from "@/components/dashboard/DeveloperScoreCard";
import { formatLogDate } from "@/lib/utils/formatters";
import { BookOpen, History } from "lucide-react";
import { CardErrorBoundary } from "@/components/shared/CardErrorBoundary";
import { RecommendationsCard } from "@/components/dashboard/RecommendationsCard";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getDashboardStats(user.id);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-muted-foreground">
          Here&apos;s a comprehensive look at your development journey.
        </p>
      </div>

      <Separator className="opacity-50" />

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:gap-6">
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

      {/* Personalized Recommendations */}
      <CardErrorBoundary fallbackTitle="Could not load recommendations">
        <RecommendationsCard recommendations={stats.recommendations} />
      </CardErrorBoundary>

      {/* Main Analysis Block: Score & Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-4">
          <CardErrorBoundary fallbackTitle="Could not load developer score">
            <DeveloperScoreCard score={stats.developerScore} />
          </CardErrorBoundary>
        </div>

        <div className="lg:col-span-8">
          <CardErrorBoundary fallbackTitle="Could not load weekly progress">
            <WeeklyProgressChart data={stats.weeklyProgress} />
          </CardErrorBoundary>
        </div>
      </div>

      {/* Secondary Analysis Block: Trends, Patterns, Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardErrorBoundary fallbackTitle="Could not load trends">
            <TrendsCard trends={stats.trends} />
          </CardErrorBoundary>
          
          <CardErrorBoundary fallbackTitle="Could not load peak time stats">
            <PeakTimeCard peakTime={stats.peakTime} />
          </CardErrorBoundary>

          <CardErrorBoundary fallbackTitle="Could not load patterns">
            <PatternCard analysis={stats.patternAnalysis} type="strongest" />
          </CardErrorBoundary>

          <CardErrorBoundary fallbackTitle="Could not load patterns">
            <PatternCard analysis={stats.patternAnalysis} type="weakest" />
          </CardErrorBoundary>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <CardErrorBoundary fallbackTitle="Could not load insights">
            <InsightsList insights={stats.insights} maxInsights={4} />
          </CardErrorBoundary>
          
          <CardErrorBoundary fallbackTitle="Could not load distribution">
            <DifficultyDistribution data={stats.difficultyDistribution} />
          </CardErrorBoundary>
        </div>
      </div>

      {/* Activity Visualization */}
      <CardErrorBoundary fallbackTitle="Could not load heatmap">
        <ActivityHeatmap data={stats.activityData} />
      </CardErrorBoundary>

      {/* Recent History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
               <History className="h-4 w-4" />
            </div>
           <h2 className="text-lg font-semibold text-foreground tracking-tight">Recent Activity</h2>
        </div>
        <CardErrorBoundary fallbackTitle="Could not load recent logs">
          <Card className="border-border rounded-xl border bg-card/20 shadow-none backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {stats.recentLogs.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen className="text-muted-foreground/40 mx-auto h-12 w-12" />
                  <p className="text-muted-foreground mt-4 text-base font-medium">No logs found.</p>
                  <p className="text-muted-foreground/60 mt-1 text-sm">Start tracking your progress to see it here.</p>
                </div>
              ) : (
                <div className="divide-border divide-y divide-border/40">
                  {stats.recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col gap-3 py-5 px-6 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/30"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-semibold">
                          {formatLogDate(log.date)}
                        </span>
                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                          <span>{log.problemsSolved} {log.problemsSolved === 1 ? "problem" : "problems"} solved</span>
                        </div>
                      </div>
                      {log.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {log.topics.slice(0, 4).map((topic) => (
                            <Badge
                              key={topic}
                              variant="secondary"
                              className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-bold px-2.5"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {log.topics.length > 4 && (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground px-2">
                              +{log.topics.length - 4} more
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
        </CardErrorBoundary>
      </div>
    </div>
  );
}
