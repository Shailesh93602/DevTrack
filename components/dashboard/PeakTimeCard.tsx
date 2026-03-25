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
      <Card className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full transition-all hover:bg-card/60">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
             <Clock className="h-4 w-4 text-primary" />
             Peak Focus Time
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[160px] text-center pt-5">
          <Clock className="h-8 w-8 text-muted mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">Log more sessions to identify your peak hours.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full transition-all hover:bg-card/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
           <Zap className="h-4 w-4 text-primary" />
           Peak Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Zap className="h-6 w-6 fill-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight">{peakTime.label}</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">Your most active time for logging activity.</p>
          </div>
        </div>
        <div className="text-[10px] text-muted-foreground bg-muted/40 p-3 rounded-md leading-relaxed border border-border/40">
           💡 Tip: You tend to be most productive around this window. Schedule your hardest deep-work sessions accordingly.
        </div>
      </CardContent>
    </Card>
  );
}
