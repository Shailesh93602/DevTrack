export type { User, DailyLog, DSAProblem, Project } from "@prisma/client";
export { Difficulty, ProjectStatus } from "@prisma/client";

export interface StatsCard {
  title: string;
  value: string | number;
  description?: string;
}
