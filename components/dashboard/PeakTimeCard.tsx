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
      <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all">
        <CardHeader className="border-border/40 border-b pb-4">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
            <Clock className="text-primary h-4 w-4" />
            Peak Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-[160px] flex-col items-center justify-center pt-5 text-center">
          <Clock className="text-muted mb-2 h-8 w-8 opacity-50" />
          <p className="text-muted-foreground text-xs">
            Log more sessions to identify your peak hours.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all">
      <CardHeader className="border-border/40 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold">
          <Zap className="text-primary h-4 w-4" />
          Peak Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
            <Zap className="fill-primary h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">
              {peakTime.label}
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
              Your most active time for logging activity.
            </p>
          </div>
        </div>
        <div className="text-muted-foreground bg-muted/40 border-border/40 rounded-md border p-3 text-[10px] leading-relaxed">
          💡 Tip: You tend to be most productive around this window. Schedule
          your hardest deep-work sessions accordingly.
        </div>
      </CardContent>
    </Card>
  );
}
