import type { PatternAnalysis } from "@/types/dsa-problem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Target } from "lucide-react";

interface PatternCardProps {
  analysis: PatternAnalysis;
  type: "strongest" | "weakest";
}

export function PatternCard({ analysis, type }: PatternCardProps) {
  const { mostPracticed, leastPracticed } = analysis.summary;

  const title = type === "strongest" ? "Strongest Pattern" : "Needs Practice";
  const Icon = type === "strongest" ? BrainCircuit : Target;

  const content = () => {
    if (type === "strongest") {
      if (!mostPracticed) {
        return (
          <p className="text-muted-foreground py-4 text-sm">
            No problems solved yet. Start practicing to see your strongest
            pattern!
          </p>
        );
      }

      return (
        <div className="space-y-2 py-4">
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {mostPracticed.pattern}
          </p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
            <span className="bg-primary inline-block h-2 w-2 rounded-full" />
            {mostPracticed.count} problems solved ({mostPracticed.percentage}%)
          </p>
        </div>
      );
    }

    if (leastPracticed) {
      return (
        <div className="space-y-2 py-4">
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {leastPracticed.pattern}
          </p>
          <p className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium">
            <span className="bg-destructive inline-block h-2 w-2 rounded-full" />
            {leastPracticed.count} problems solved ({leastPracticed.percentage}
            %)
          </p>
        </div>
      );
    }

    return (
      <p className="text-muted-foreground py-4 text-sm italic">
        {mostPracticed
          ? "All patterns have equal practice. Diversify your logic!"
          : "No problems recorded yet."}
      </p>
    );
  };

  return (
    <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all">
      <CardHeader className="border-border/40 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          <Icon className="text-primary h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">{content()}</CardContent>
    </Card>
  );
}
