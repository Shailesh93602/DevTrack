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
      <Card className="rounded-xl border-dashed border-2 border-border/60 bg-muted/20 shadow-sm">
        <CardContent className="py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <p className="font-semibold text-foreground">No Insights Yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start logging activity to get personalized insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all hover:bg-card/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
          <Sparkles className="h-4 w-4 text-primary" />
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
              <p className="text-sm font-semibold tracking-tight text-foreground">
                {insight.title}
              </p>
              <p className="text-sm leading-snug text-muted-foreground">
                {insight.message}
              </p>
              {insight.metric && (
                <div className="pt-1">
                  <Badge variant="secondary" className="bg-muted font-medium hover:bg-muted">
                    {insight.metric.label}: <span className="ml-1 font-bold text-foreground">{insight.metric.value}</span>
                  </Badge>
                </div>
              )}
              {insight.action && (
                <div className="pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 bg-background text-xs font-medium transition-colors group-hover:bg-accent"
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
