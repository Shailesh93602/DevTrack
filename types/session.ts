import { Prisma } from "@prisma/client";

export type SessionWithActivities = Prisma.SessionGetPayload<{
  include: { activities: true };
}>;

export interface SessionSummary {
  id: string;
  title: string | null;
  category: string | null;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number | null;
  isActive: boolean;
  activityCount: number;
}
