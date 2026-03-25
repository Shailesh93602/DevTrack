"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DeveloperScore, SubScore } from "@/types/scoring";
import { BrainCircuit } from "lucide-react";

// ─── Sub-score bar ────────────────────────────────────────────────────────────

interface SubScoreBarProps {
  sub: SubScore;
  color: string;
}

function SubScoreBar({ sub, color }: SubScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{sub.label}</span>
        <span className="font-semibold tabular-nums">
          {sub.score}
          <span className="text-muted-foreground font-normal">/100</span>
        </span>
      </div>

      {/* Accessible progress bar */}
      <progress
        className={`[&::-webkit-progress-bar]:bg-muted h-1.5 w-full appearance-none overflow-hidden rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:${color} [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:${color}`}
        value={sub.score}
        max={100}
        aria-label={`${sub.label} score: ${sub.score} out of 100`}
      />

      {/* Breakdown pills */}
      <div className="flex flex-wrap gap-1 pt-0.5">
        {Object.entries(sub.breakdown).map(([k, v]) => {
          const label = k
            .replaceAll(/([A-Z])/g, " $1")
            .replace(/^./, (s) => s.toUpperCase());
          return (
            <span
              key={k}
              className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]"
            >
              <span className="font-medium">{label}:</span>
              <span>{String(v)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DeveloperScoreCardProps {
  score: DeveloperScore;
}

export function DeveloperScoreCard({ score }: DeveloperScoreCardProps) {
  const subScores: Array<{ sub: SubScore; color: string }> = [
    { sub: score.consistency, color: "bg-blue-500" },
    { sub: score.dsa, color: "bg-violet-500" },
    { sub: score.productivity, color: "bg-emerald-500" },
  ];

  return (
    <Card
      className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all"
      id="developer-score-card"
    >
      <CardHeader className="border-border/40 flex flex-row items-center justify-between space-y-0 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          <BrainCircuit className="text-primary h-4 w-4" />
          Developer Score
        </CardTitle>
        <span
          className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-semibold"
          aria-label={`Grade: ${score.grade}`}
        >
          {score.gradeIcon} {score.grade}
        </span>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Big total */}
        <div className="flex items-end gap-2">
          <span
            className="text-foreground text-4xl font-bold tracking-tight tabular-nums drop-shadow-sm sm:text-5xl"
            aria-label={`Total developer score: ${score.total} out of 100`}
          >
            {score.total}
          </span>
          <span className="text-muted-foreground mb-1.5 text-lg font-medium">
            /100
          </span>
        </div>

        {/* Overall progress */}
        <progress
          className="[&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary h-2 w-full appearance-none overflow-hidden rounded-full [&::-moz-progress-bar]:rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full"
          value={score.total}
          max={100}
          aria-label={`Overall developer score: ${score.total} out of 100`}
        />

        {/* Sub-scores */}
        <div className="space-y-4 pt-1">
          {subScores.map(({ sub, color }) => (
            <SubScoreBar key={sub.label} sub={sub} color={color} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
