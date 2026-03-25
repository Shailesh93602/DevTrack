import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Flame, FolderKanban, Calendar } from "lucide-react";
import type { StatsCard as StatsCardType } from "@/types";

const icons: Record<string, React.ElementType> = {
  Problems: Code2,
  Streak: Flame,
  Projects: FolderKanban,
  Today: Calendar,
};

export function StatsCard({ title, value, description }: StatsCardType) {
  const Icon = icons[title] || Code2;

  return (
    <Card className="border-border/60 bg-card/50 supports-[backdrop-filter]:bg-background/60 rounded-xl border shadow-sm backdrop-blur transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
          <Icon className="text-primary h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-foreground text-3xl font-bold tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-muted-foreground mt-1 text-xs font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
