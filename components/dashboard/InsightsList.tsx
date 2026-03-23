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
      <Card className="border-border rounded-lg border shadow-none">
        <CardContent className="py-8 text-center">
          <ClipboardList className="text-muted-foreground mx-auto h-8 w-8" />
          <p className="text-muted-foreground mt-3 text-sm">
            Start logging activity to get personalized insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border rounded-lg border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight) => (
          <div key={insight.id} className="flex gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${priorityVariants[insight.priority]}`}
            >
              {typeIcons[insight.type]}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-foreground text-sm font-medium">
                {insight.title}
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {insight.message}
              </p>
              {insight.metric && (
                <Badge variant="secondary" className="text-xs">
                  {insight.metric.label}: {insight.metric.value}
                </Badge>
              )}
              {insight.action && (
                <div className="pt-1">
                  <Button
                    asChild
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                  >
                    <Link href={insight.action.href}>
                      {insight.action.label}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
