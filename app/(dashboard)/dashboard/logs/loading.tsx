import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-60" />
      </div>

      <Separator />

      <div className="rounded-lg border border-border p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-28 w-full rounded-md" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <div className="rounded-lg border border-border">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={`log-row-${i}`} className="flex flex-col gap-2 p-6 border-b border-border last:border-0">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
