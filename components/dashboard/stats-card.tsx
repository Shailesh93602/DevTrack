import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Flame, FolderKanban, Calendar } from "lucide-react";
import type { StatsCard as StatsCardType } from "@/types";

const icons: Record<string, React.ElementType> = {
  "Problems": Code2,
  "Streak": Flame,
  "Projects": FolderKanban,
  "Today": Calendar,
};

export function StatsCard({ title, value, description }: StatsCardType) {
  const Icon = icons[title] || Code2;
  
  return (
    <Card className="rounded-xl border border-border/60 shadow-sm transition-all hover:shadow-md bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {description && (
          <p className="mt-1 text-xs font-medium text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
