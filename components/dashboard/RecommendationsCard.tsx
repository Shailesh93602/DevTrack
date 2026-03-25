import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import type {
  Recommendation,
  RecommendationUrgency,
} from "@/types/recommendations";
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
        "bg-card/30 hover:bg-card/50 rounded-xl p-4 transition-colors",
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
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-foreground text-sm leading-tight font-semibold">
              {rec.title}
            </p>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                config.badge
              )}
            >
              {config.label}
            </span>
          </div>

          <p className="text-muted-foreground text-xs leading-snug">
            {rec.reason}
          </p>

          {rec.metric && (
            <p className="text-muted-foreground/80 text-[11px] font-medium">
              {rec.metric.label}:{" "}
              <span className="text-foreground font-bold">
                {rec.metric.value}
              </span>
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
          className="bg-background hover:bg-accent h-7 gap-1.5 px-3 text-xs font-semibold transition-colors"
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

export function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  return (
    <Card
      className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 rounded-xl border shadow-sm backdrop-blur transition-all"
      id="recommendations-card"
    >
      <CardHeader className="border-border/40 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Sparkles className="text-primary h-4 w-4" />
          Next Steps
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pt-5">
        {recommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <CheckCircle2 className="text-primary/60 h-10 w-10" />
            <p className="text-foreground text-sm font-semibold">
              You&apos;re all caught up!
            </p>
            <p className="text-muted-foreground max-w-[180px] text-xs">
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
