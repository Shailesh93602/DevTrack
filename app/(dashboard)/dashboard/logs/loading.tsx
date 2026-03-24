import { ListSkeleton } from "@/components/dashboard/SkeletonCards";

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 pt-6">
      <div className="flex items-center justify-between space-y-2 pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Daily Logs</h2>
      </div>
      <ListSkeleton count={10} />
    </div>
  );
}
