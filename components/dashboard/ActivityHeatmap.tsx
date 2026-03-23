"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ActivityHeatmapProps {
  data: { date: string; count: number }[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const daysToShow = 91; // 13 weeks
  
  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = [];
    const dataMap = new Map(data.map(d => [d.date, d.count]));
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dates.push({
        date: dateStr,
        count: dataMap.get(dateStr) ?? 0,
        dayOfWeek: d.getDay(),
      });
    }
    return dates;
  }, [data]);

  // Group by week
  const weeks = useMemo(() => {
    const w = [];
    let currentWeek = [];
    
    // Pad first week if needed
    const firstDay = heatmapData[0].dayOfWeek;
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    for (const day of heatmapData) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        w.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      w.push(currentWeek);
    }
    return w;
  }, [heatmapData]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-primary/20";
    if (count === 2) return "bg-primary/40";
    if (count === 3) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <Card className="rounded-lg border border-border shadow-none overflow-hidden">
      <CardHeader className="pb-3 px-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Consistency (Last 90 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {weeks.map((week, wi) => {
            const weekKey = week.find(d => d !== null)?.date ?? `week-${wi}`;
            return (
              <div key={weekKey} className="grid grid-rows-7 gap-1 shrink-0">
                {week.map((day, di) => (
                  <div
                    key={day ? day.date : `empty-${wi}-${di}`}
                    className={cn(
                      "h-3 w-3 rounded-[2px]",
                      day ? getColor(day.count) : "bg-transparent opacity-0"
                    )}
                    title={day ? `${day.date}: ${day.count} log` : undefined}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-2 w-2 rounded-[1px] bg-muted/30" />
            <div className="h-2 w-2 rounded-[1px] bg-primary/20" />
            <div className="h-2 w-2 rounded-[1px] bg-primary/40" />
            <div className="h-2 w-2 rounded-[1px] bg-primary/60" />
            <div className="h-2 w-2 rounded-[1px] bg-primary" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
