import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function StatCardSkeleton() {
  return (
    <Card className="border-border rounded-lg border shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-1" />
        <Skeleton className="h-3 w-[100px]" />
      </CardContent>
    </Card>
  );
}

export function PatternCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-[140px]" />
      <Card className="border-border rounded-lg border shadow-none">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </div>
          <div className="space-y-2">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-[80%]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function InsightCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-[120px]" />
      <Card className="border-border rounded-lg border shadow-none h-full">
        <CardContent className="pt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg">
              <Skeleton className="h-5 w-5 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ActivityHeatmapSkeleton() {
  return (
    <Card className="border-border rounded-lg border shadow-none">
      <CardContent className="pt-6 space-y-2">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 90 }).map((_, i) => (
            <Skeleton key={`heatmap-cell-${i}`} className="h-3 w-3 rounded-sm" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TrendsCardSkeleton() {
  return (
    <Card className="border-border rounded-lg border shadow-none h-[230px]">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-[140px]" />
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
             <Skeleton className="h-3 w-[80px]" />
             <div className="flex items-center gap-2">
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-6 w-[40px]" />
                <Skeleton className="h-3 w-[100px]" />
             </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={`stat-${i}`} />
        ))}
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-5 w-[140px]" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
        <div className="space-y-4 lg:col-span-1">
          <Skeleton className="h-5 w-[100px]" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
        <div className="space-y-4 lg:col-span-1">
           <InsightCardSkeleton />
        </div>
      </div>

      {/* Trends row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TrendsCardSkeleton />
        <TrendsCardSkeleton />
      </div>

      {/* Patterns row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PatternCardSkeleton />
        <PatternCardSkeleton />
      </div>

      {/* Activity row */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-[120px]" />
        <ActivityHeatmapSkeleton />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={`list-card-${i}`} className="border-border rounded-lg border shadow-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex gap-4 flex-1">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-2 pt-1">
                <Skeleton className="h-4 w-[60%] max-w-[200px]" />
                <Skeleton className="h-3 w-[80%] max-w-[350px]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
