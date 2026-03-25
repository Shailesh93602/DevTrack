import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import type { Recommendation, RecommendationUrgency } from "@/types/recommendations";
import { cn } from "@/lib/utils";

interface RecommendationsCardProps {
  recommendations: Recommendation[];
}

const urgencyConfig: Record<
  RecommendationUrgency,
  { border: string; badge: string; label: string }
> = {
  critical: {
    border: "border-l-4 border-l-destructive",
    badge: "bg-destructive/10 text-destructive",
    label: "Critical",
  },
  high: {
    border: "border-l-4 border-l-amber-500",
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    label: "High",
  },
  medium: {
    border: "border-l-4 border-l-primary",
    badge: "bg-primary/10 text-primary",
    label: "Medium",
  },
  low: {
    border: "border-l-4 border-l-muted-foreground/40",
    badge: "bg-muted text-muted-foreground",
    label: "Low",
  },
};

function RecommendationItem({ rec }: { rec: Recommendation }) {
  const config = urgencyConfig[rec.urgency];

  return (
    <div
      className={cn(
        "rounded-xl bg-card/30 p-4 transition-colors hover:bg-card/50",
        config.border
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <span
          className="mt-0.5 shrink-0 text-xl leading-none"
          aria-hidden="true"
        >
          {rec.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground leading-tight">
              {rec.title}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                config.badge
              )}
            >
              {config.label}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-snug">
            {rec.reason}
          </p>

          {rec.metric && (
            <p className="text-[11px] text-muted-foreground/80 font-medium">
              {rec.metric.label}:{" "}
              <span className="text-foreground font-bold">{rec.metric.value}</span>
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-3 flex justify-end">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 px-3 text-xs font-semibold bg-background hover:bg-accent transition-colors"
        >
          <Link href={rec.cta.href}>
            {rec.cta.label}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card
      className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all hover:bg-card/60"
      id="recommendations-card"
    >
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
          <Sparkles className="h-4 w-4 text-primary" />
          Next Steps
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-5 space-y-3">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <CheckCircle2 className="h-10 w-10 text-primary/60" />
            <p className="text-sm font-semibold text-foreground">
              You&apos;re all caught up!
            </p>
            <p className="text-xs text-muted-foreground max-w-[180px]">
              Keep up the great work. Check back tomorrow for new suggestions.
            </p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <RecommendationItem key={rec.id} rec={rec} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
