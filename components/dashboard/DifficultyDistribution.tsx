"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";

interface DifficultyDistributionProps {
  data: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export function DifficultyDistribution({ data }: DifficultyDistributionProps) {
  const chartData = [
    { name: "Easy", value: data.easy, color: "var(--chart-easy)" },
    { name: "Medium", value: data.medium, color: "var(--chart-medium)" },
    { name: "Hard", value: data.hard, color: "var(--chart-hard)" },
  ].filter((d) => d.value > 0);

  if (chartData.length === 0) {
    return (
      <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all">
        <CardHeader className="border-border/40 border-b pb-4">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
            <PieChartIcon className="text-primary h-4 w-4" />
            Difficulty Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground text-xs">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 hover:bg-card/60 h-full rounded-xl border shadow-sm backdrop-blur transition-all">
      <CardHeader className="border-border/40 border-b pb-4">
        <CardTitle className="text-foreground flex items-center gap-2 text-sm font-semibold tracking-tight">
          <PieChartIcon className="text-primary h-4 w-4" />
          Difficulty Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
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
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
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
