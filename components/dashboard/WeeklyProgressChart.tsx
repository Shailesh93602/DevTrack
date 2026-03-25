"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

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
    <Card className="h-full rounded-xl border border-border/60 bg-card/50 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all hover:bg-card/60">
      <CardHeader className="border-b border-border/40 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground tracking-tight">
          <BarChart3 className="h-4 w-4 text-primary" />
          Weekly Momentum
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "var(--chart-muted)", opacity: 0.4 }}
              />
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <Bar 
                dataKey="easy" 
                stackId="a" 
                fill="var(--chart-easy)"
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="medium" 
                stackId="a" 
                fill="var(--chart-medium)"
                radius={[0, 0, 0, 0]} 
              />
              <Bar 
                dataKey="hard" 
                stackId="a" 
                fill="var(--chart-hard)"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
