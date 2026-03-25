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
          <p className="text-muted-foreground text-sm py-4">
            No problems solved yet. Start practicing to see your strongest pattern!
          </p>
        );
      }

      return (
        <div className="space-y-2 py-4">
          <p className="text-foreground text-2xl font-bold tracking-tight">
            {mostPracticed.pattern}
          </p>
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
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
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-destructive" />
            {leastPracticed.count} problems solved ({leastPracticed.percentage}%)
          </p>
        </div>
      );
    }

    return (
      <p className="text-muted-foreground text-sm py-4 italic">
        {mostPracticed 
          ? "All patterns have equal practice. Diversify your logic!" 
          : "No problems recorded yet."}
      </p>
    );
  };

  return (
    <Card className="rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 h-full transition-all hover:bg-card/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {content()}
      </CardContent>
    </Card>
  );
}
