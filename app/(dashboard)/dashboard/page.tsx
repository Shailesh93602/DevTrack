import { redirect } from "next/navigation";
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

function formatLogDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logDate = new Date(date);
  logDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - logDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return logDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatsCard
          title="Total Problems"
          value={stats.totalProblems}
          description="All DSA problems solved"
        />
        <StatsCard
          title="Today's Progress"
          value={stats.todaysProblems}
          description="Problems solved today"
        />
        <StatsCard
          title="Recent Logs"
          value={stats.recentLogs.length}
          description="Latest daily entries"
        />
        <StatsCard
          title="Current Streak"
          value={stats.currentStreak}
          description={
            stats.currentStreak === 1 ? "day in a row" : "days in a row"
          }
        />
        <StatsCard
          title="Longest Streak"
          value={stats.longestStreak}
          description={stats.longestStreak === 1 ? "day" : "days"}
        />
      </div>

      <div>
        <h3 className="text-foreground mb-4 text-sm font-semibold">Progress</h3>
        <WeeklyProgressChart data={weeklyStats} />
      </div>

      <div>
        <h3 className="text-foreground mb-4 text-sm font-semibold">
          Recent Logs
        </h3>
        <Card className="border-border rounded-lg border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Last 5 Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            {stats.recentLogs.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No logs yet. Start tracking your daily progress!
              </p>
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
