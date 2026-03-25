"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendsCardProps {
  trends: {
    problemsThisWeek: number;
    problemsLastWeek: number;
    logsThisWeek: number;
    logsLastWeek: number;
  };
}

export function TrendsCard({ trends }: TrendsCardProps) {
  const problemDiff = trends.problemsThisWeek - trends.problemsLastWeek;
  const logDiff = trends.logsThisWeek - trends.logsLastWeek;

  const renderTrend = (diff: number, label: string) => {
    const isUp = diff > 0;
    const isDown = diff < 0;
    let color = "text-muted-foreground";
    if (isUp) color = "text-success";
    else if (isDown) color = "text-destructive";

    let Icon = Minus;
    if (isUp) Icon = TrendingUp;
    else if (isDown) Icon = TrendingDown;

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", color)} />
          <span className={cn("text-lg font-bold", color)}>
            {isUp ? "+" : ""}{diff}
          </span>
          <span className="text-xs text-muted-foreground">vs last week</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="rounded-lg border border-border shadow-none h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Productivity Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderTrend(problemDiff, "Problems Solved")}
        {renderTrend(logDiff, "Coding Days")}
      </CardContent>
    </Card>
  );
}
