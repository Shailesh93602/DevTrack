import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Separator />

      <div className="rounded-lg border border-border space-y-4 p-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="rounded-lg border border-border p-6 space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={`problem-${i}`} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="rounded-lg border border-border p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
