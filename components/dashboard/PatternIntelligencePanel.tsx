"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle } from "lucide-react";
import type { PatternAnalysis } from "@/lib/services/pattern-intelligence";

interface PatternIntelligencePanelProps {
  analysis: PatternAnalysis;
}

export function PatternIntelligencePanel({ analysis }: PatternIntelligencePanelProps) {
  const { mostPracticed, weakPatterns, recommendedPattern, masteryProgress } = analysis;

  return (
    <div className="space-y-4">
      {recommendedPattern && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4">
            <Lightbulb className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Recommended to Learn</p>
              <p className="text-sm text-muted-foreground">{recommendedPattern}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Most Practiced Patterns
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mostPracticed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No patterns tracked yet.</p>
          ) : (
            mostPracticed.map((p) => (
              <div key={p.pattern} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{p.pattern}</span>
                  <span className="text-muted-foreground">{p.count} problems</span>
                </div>
                <Progress value={masteryProgress[p.pattern] ?? 0} className="h-2" />
                <div className="flex gap-1 text-xs">
                  {p.easyCount > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {p.easyCount} Easy
                    </Badge>
                  )}
                  {p.mediumCount > 0 && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {p.mediumCount} Medium
                    </Badge>
                  )}
                  {p.hardCount > 0 && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {p.hardCount} Hard
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {weakPatterns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Patterns to Strengthen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {weakPatterns.map((p) => (
                <Badge key={p.pattern} variant="outline">
                  {p.pattern} ({p.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
