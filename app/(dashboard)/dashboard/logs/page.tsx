import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/auth/supabase-server";
import { getDailyLogs } from "@/lib/services/daily-log";
import {
  DailyLogForm,
} from "@/components/dashboard/DailyLogForm";
import { DailyLogList } from "@/components/dashboard/DailyLogList";
import { serializeLog } from "@/lib/utils/serialization";
import { getTodayUtcString, toUtcDateString } from "@/lib/utils/date";

// Replaced raw types and utilities with unified imports

export default async function DailyLogsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { logs } = await getDailyLogs(user.id, { limit: 50, offset: 0 });

  const todayUTC = getTodayUtcString();
  const rawTodaysLog = logs.find((log) => toUtcDateString(log.date) === todayUTC) ?? null;

  const todaysLog = rawTodaysLog ? serializeLog(rawTodaysLog) : null;
  const allLogs = logs.map(serializeLog);
  const historyLogs = todaysLog
    ? allLogs.filter((log) => log.id !== todaysLog.id)
    : allLogs;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Daily Logs</h2>
        <p className="text-sm text-muted-foreground">
          Track your coding activity day by day.
        </p>
      </div>

      <Separator />

      <Card className="rounded-lg border border-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">
            {todaysLog ? "Today's Log" : "Log Today"}
          </CardTitle>
          <CardDescription>
            {todaysLog
              ? "Update what you worked on today."
              : "What did you work on today?"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DailyLogForm log={todaysLog} />
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-foreground">History</h3>
        <Card className="rounded-lg border border-border shadow-none">
          <CardContent className="px-6 py-0">
            <DailyLogList logs={historyLogs} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
