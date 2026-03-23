"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap } from "lucide-react";

interface PeakTimeCardProps {
  peakTime: {
    hour: number;
    count: number;
    label: string;
  } | null;
}

export function PeakTimeCard({ peakTime }: PeakTimeCardProps) {
  if (!peakTime) {
    return (
      <Card className="rounded-lg border border-border shadow-none h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Peak Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[120px] text-center">
          <Clock className="h-8 w-8 text-muted mb-2" />
          <p className="text-xs text-muted-foreground">Log more sessions to identify your peak hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border border-border shadow-none h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Peak Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Zap className="h-6 w-6 fill-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{peakTime.label}</div>
            <p className="text-xs text-muted-foreground">Your most active time for logging activity.</p>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground bg-muted/50 p-2 rounded leading-tight">
          Tip: You tend to be most productive around this time. Schedule your hardest deep-work sessions accordingly.
        </div>
      </CardContent>
    </Card>
  );
}
