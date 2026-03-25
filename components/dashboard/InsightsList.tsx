"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Target,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import type { Insight, InsightType, InsightPriority } from "@/types/insights";

interface InsightsListProps {
  insights: Insight[];
  maxInsights?: number;
}

const typeIcons: Record<InsightType, React.ReactNode> = {
  strength: <TrendingUp className="h-4 w-4" />,
  weakness: <AlertCircle className="h-4 w-4" />,
  activity: <Target className="h-4 w-4" />,
  milestone: <Sparkles className="h-4 w-4" />,
  suggestion: <Lightbulb className="h-4 w-4" />,
};

const priorityVariants: Record<InsightPriority, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

export function InsightsList({ insights, maxInsights = 3 }: InsightsListProps) {
  const displayInsights = insights.slice(0, maxInsights);

  if (displayInsights.length === 0) {
    return (
      <Card className="border-border/60 bg-muted/20 rounded-xl border-2 border-dashed shadow-sm">
        <CardContent className="py-10 text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <ClipboardList className="text-primary h-6 w-6" />
          </div>
          <p className="text-foreground font-semibold">No Insights Yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Start logging activity to get personalized insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 rounded-xl border shadow-sm backdrop-blur transition-all">
      <CardHeader className="border-border/40 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Sparkles className="text-primary h-4 w-4" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <ul className="space-y-6">
          {displayInsights.map((insight) => (
            <li key={insight.id} className="group flex gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm ${priorityVariants[insight.priority]}`}
                aria-hidden="true"
              >
                {typeIcons[insight.type]}
              </div>
              <div className="flex-1 space-y-1.5 pt-0.5">
                <p className="text-foreground text-sm font-semibold tracking-tight">
                  {insight.title}
                </p>
                <p className="text-muted-foreground text-sm leading-snug">
                  {insight.message}
                </p>
                {insight.metric && (
                  <div className="pt-1">
                    <Badge
                      variant="secondary"
                      className="bg-muted hover:bg-muted font-medium"
                    >
                      {insight.metric.label}:{" "}
                      <span className="text-foreground ml-1 font-bold">
                        {insight.metric.value}
                      </span>
                    </Badge>
                  </div>
                )}
                {insight.action && (
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="bg-background group-hover:bg-accent h-8 text-xs font-medium transition-colors"
                    >
                      <Link href={insight.action.href}>
                        {insight.action.label}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
