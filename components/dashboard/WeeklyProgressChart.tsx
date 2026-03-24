"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyDataPoint {
  week: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

interface WeeklyProgressChartProps {
  data: WeeklyDataPoint[];
}

export function WeeklyProgressChart({ data }: WeeklyProgressChartProps) {

  return (
    <Card className="h-full rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="text-sm font-semibold text-foreground">
          Problems Solved Per Week
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                minTickGap={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              />
              <Bar 
                dataKey="easy" 
                stackId="a" 
                fill="oklch(0.70 0.1 142)" // green
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="medium" 
                stackId="a" 
                fill="oklch(0.75 0.12 70)" // amber
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="hard" 
                stackId="a" 
                fill="oklch(0.65 0.18 27)" // red
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
