import { StatsCard } from "@/components/dashboard/stats-card";
import { Separator } from "@/components/ui/separator";

const placeholderStats = [
  { title: "Problems Solved", value: 0, description: "Total DSA problems" },
  { title: "Active Projects", value: 0, description: "Currently in progress" },
  { title: "Day Streak", value: 0, description: "Consecutive days logged" },
  { title: "This Week", value: 0, description: "Problems solved this week" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your developer progress at a glance.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {placeholderStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  );
}
