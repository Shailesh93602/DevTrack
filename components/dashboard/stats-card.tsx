import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCard } from "@/types";

export function StatsCard({ title, value, description }: StatsCard) {
  return (
    <Card className="rounded-lg border border-border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
