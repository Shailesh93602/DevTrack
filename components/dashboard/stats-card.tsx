import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsCard } from "@/types";

export function StatsCard({ title, value, description }: StatsCard) {
  return (
    <Card className="rounded-lg border border-gray-100 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {description && (
          <p className="mt-0.5 text-xs text-gray-400">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
