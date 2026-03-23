"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DifficultyDistributionProps {
  data: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function DifficultyDistribution({ data }: DifficultyDistributionProps) {
  const chartData = [
    { name: "Easy", value: data.easy, color: "oklch(0.70 0.1 142)" }, // green
    { name: "Medium", value: data.medium, color: "oklch(0.75 0.12 70)" }, // amber
    { name: "Hard", value: data.hard, color: "oklch(0.65 0.18 27)" }, // red
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="h-full rounded-lg border border-border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Difficulty Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-xs text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full rounded-lg border border-border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Difficulty Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                iconType="circle"
                wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
