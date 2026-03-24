import type { SerializedDailyLog } from "@/types";
import { toUtcDateString } from "./date";
import type { DsaProblem } from "@/types/dsa-problem";
import type { Project } from "@/components/dashboard/ProjectList";

type RawLog = {
  id: string;
  date: Date;
  problemsSolved: number;
  topics: string[];
  notes: string | null;
};

export function serializeLog(log: RawLog): SerializedDailyLog {
  return {
    id: log.id,
    date: toUtcDateString(log.date),
    problemsSolved: log.problemsSolved,
    topics: log.topics,
    notes: log.notes,
  };
}

export type RawProblem = {
  id: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  pattern: string;
  platform: string;
  solvedAt: Date;
};

export function serializeProblem(problem: RawProblem): DsaProblem {
  return {
    id: problem.id,
    title: problem.title,
    difficulty: problem.difficulty,
    pattern: problem.pattern,
    platform: problem.platform,
    solvedAt: problem.solvedAt.toISOString(),
  };
}

export type RawProject = {
  id: string;
  name: string;
  description: string | null;
  status: "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  progress: number;
  dueDate: Date | null;
  techStack: string[];
  createdAt: Date;
};

export function serializeProject(project: RawProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    progress: project.progress,
    dueDate: project.dueDate?.toISOString() ?? null,
    techStack: project.techStack,
    createdAt: project.createdAt.toISOString(),
  };
}

export type RawMilestone = {
  id: string;
  title: string;
  description: string | null;
  completedAt: Date | null;
  order: number;
};

export function serializeMilestone(m: RawMilestone) {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    completedAt: m.completedAt?.toISOString() ?? null,
    order: m.order,
  };
}
