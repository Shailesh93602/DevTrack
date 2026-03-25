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
    <Card className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full transition-all hover:bg-card/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          Productivity Trends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        {renderTrend(problemDiff, "Problems Solved")}
        {renderTrend(logDiff, "Coding Days")}
      </CardContent>
    </Card>
  );
}
