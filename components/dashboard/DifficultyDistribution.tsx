"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DifficultyDistributionProps {
  easy: number;
  medium: number;
  hard: number;
}

export function DifficultyDistribution({ easy, medium, hard }: DifficultyDistributionProps) {
  const total = easy + medium + hard;
  
  if (total === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Difficulty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No problems tracked yet.</p>
        </CardContent>
      </Card>
    );
  }

  const easyPct = Math.round((easy / total) * 100);
  const mediumPct = Math.round((medium / total) * 100);
  const hardPct = Math.round((hard / total) * 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Difficulty Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Pie chart representation using conic gradient */}
        <div className="flex items-center gap-4">
          <div
            className="h-24 w-24 rounded-full"
            style={{
              background: `conic-gradient(
                #22c55e 0deg ${easyPct * 3.6}deg,
                #eab308 ${easyPct * 3.6}deg ${(easyPct + mediumPct) * 3.6}deg,
                #ef4444 ${(easyPct + mediumPct) * 3.6}deg 360deg
              )`,
            }}
          />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>Easy: {easy} ({easyPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>Medium: {medium} ({mediumPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>Hard: {hard} ({hardPct}%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
