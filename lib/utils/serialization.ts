import type { SerializedDailyLog } from "@/types";
import { toUtcDateString } from "./date";

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
