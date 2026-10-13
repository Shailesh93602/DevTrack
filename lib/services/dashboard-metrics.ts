import {
  CONSISTENCY_TARGET_LOGS_PER_WEEK,
  CONSISTENCY_WEEKS_CHECK,
  DAYS_IN_WEEK,
  MS_PER_DAY,
} from "@/lib/constants";
import { normalizeToUtcMidnight } from "@/lib/utils/date";

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface ActivityTrends {
  problemsThisWeek: number;
  problemsLastWeek: number;
  logsThisWeek: number;
  logsLastWeek: number;
}

export interface PeakTime {
  hour: number;
  count: number;
  label: string;
}

/** Folds a Prisma `groupBy(difficulty)` result into easy/medium/hard counts. */
export function toDifficultyDistribution(
  difficultyCounts: readonly { difficulty: string; _count: number }[]
): DifficultyDistribution {
  const distribution = { easy: 0, medium: 0, hard: 0 };
  for (const group of difficultyCounts) {
    if (group.difficulty === "EASY") distribution.easy = group._count;
    else if (group.difficulty === "MEDIUM") distribution.medium = group._count;
    else if (group.difficulty === "HARD") distribution.hard = group._count;
  }
  return distribution;
}

/** Share (0-100) of the last N UTC weeks that met the weekly log target. */
export function calculateConsistencyScore(
  logs: readonly { date: Date }[],
  now: Date
): number {
  const weekMap = new Map<number, number>();
  for (const log of logs) {
    const weekStart = normalizeToUtcMidnight(log.date);
    weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
    const weekKey = weekStart.getTime();
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
  }

  let weeksMet = 0;
  for (let weekIndex = 0; weekIndex < CONSISTENCY_WEEKS_CHECK; weekIndex++) {
    const checkDate = normalizeToUtcMidnight(now);
    checkDate.setUTCDate(checkDate.getUTCDate() - weekIndex * DAYS_IN_WEEK);
    checkDate.setUTCDate(checkDate.getUTCDate() - checkDate.getUTCDay());
    if (
      (weekMap.get(checkDate.getTime()) ?? 0) >=
      CONSISTENCY_TARGET_LOGS_PER_WEEK
    )
      weeksMet++;
  }

  return Math.round((weeksMet / CONSISTENCY_WEEKS_CHECK) * 100);
}

/** Whole local-calendar days since the last log, or null with no log. */
export function calculateDaysSinceLastLog(
  lastLog: { date: Date } | null
): number | null {
  if (!lastLog) return null;
  const lastDate = new Date(lastLog.date);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  return Math.floor((todayDate.getTime() - lastDate.getTime()) / MS_PER_DAY);
}

function countInRange(dates: readonly Date[], from: Date, until?: Date) {
  return dates.filter(
    (date) => date >= from && (until === undefined || date < until)
  ).length;
}

/** This-week vs last-week counts, weeks starting Sunday (UTC). */
export function calculateTrends(
  problems: readonly { solvedAt: Date }[],
  logs: readonly { date: Date }[],
  today: Date
): ActivityTrends {
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setUTCDate(startOfThisWeek.getUTCDate() - DAYS_IN_WEEK);

  const solvedDates = problems.map((problem) => new Date(problem.solvedAt));
  const logDates = logs.map((log) => new Date(log.date));

  return {
    problemsThisWeek: countInRange(solvedDates, startOfThisWeek),
    problemsLastWeek: countInRange(
      solvedDates,
      startOfLastWeek,
      startOfThisWeek
    ),
    logsThisWeek: countInRange(logDates, startOfThisWeek),
    logsLastWeek: countInRange(logDates, startOfLastWeek, startOfThisWeek),
  };
}

/** The local hour most logs were created in (earliest hour wins ties). */
export function calculatePeakTime(
  logs: readonly { createdAt: Date }[]
): PeakTime | null {
  const hourCounts = new Array<number>(24).fill(0);
  for (const log of logs) {
    hourCounts[new Date(log.createdAt).getHours()]++;
  }

  let peakHour = -1;
  let maxCount = 0;
  for (let hour = 0; hour < 24; hour++) {
    if (hourCounts[hour] > maxCount) {
      maxCount = hourCounts[hour];
      peakHour = hour;
    }
  }

  if (peakHour === -1) return null;

  const period = peakHour >= 12 ? "PM" : "AM";
  const displayHour = peakHour % 12 || 12;

  return {
    hour: peakHour,
    count: maxCount,
    label: `${displayHour} ${period}`,
  };
}
