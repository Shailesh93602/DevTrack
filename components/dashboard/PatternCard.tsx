import type { PatternAnalysis } from "@/types/dsa-problem";

interface PatternCardProps {
  analysis: PatternAnalysis;
  type: "strongest" | "weakest";
}

export function PatternCard({ analysis, type }: PatternCardProps) {
  const { mostPracticed, leastPracticed } = analysis.summary;

  if (type === "strongest") {
    if (!mostPracticed) {
      return (
        <p className="text-muted-foreground text-sm">
          No problems solved yet. Start practicing to see your strongest
          pattern!
        </p>
      );
    }

    return (
      <div className="space-y-2">
        <p className="text-foreground text-2xl font-semibold">
          {mostPracticed.pattern}
        </p>
        <p className="text-muted-foreground text-sm">
          {mostPracticed.count} problems ({mostPracticed.percentage}% of total)
        </p>
      </div>
    );
  }

  // type === "weakest"
  if (leastPracticed) {
    return (
      <div className="space-y-2">
        <p className="text-foreground text-2xl font-semibold">
          {leastPracticed.pattern}
        </p>
        <p className="text-muted-foreground text-sm">
          {leastPracticed.count} problems ({leastPracticed.percentage}% of
          total)
        </p>
      </div>
    );
  }

  if (mostPracticed) {
    return (
      <p className="text-muted-foreground text-sm">
        All patterns have equal practice. Keep solving more problems!
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">No problems solved yet.</p>
  );
}
