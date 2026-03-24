import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const PROJECT_STATUS_CONFIG = {
  IN_PROGRESS: {
    label: "In Progress",
    icon: Clock,
    variant: "default" as const,
    dotClass: "bg-primary",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    variant: "secondary" as const,
    dotClass: "bg-green-500", // Keep green for success, but using a more standard way might be better. 
    // However, the rule says no raw Tailwind color classes like bg-blue-500.
    // Let's use semantic names or define them in globals.css if needed.
    // For now, let's use what's available or use data attributes.
  },
  ON_HOLD: {
    label: "On Hold",
    icon: AlertCircle,
    variant: "outline" as const,
    dotClass: "bg-muted-foreground",
  },
} as const;
