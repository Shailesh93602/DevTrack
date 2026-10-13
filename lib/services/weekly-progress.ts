import { DAYS_IN_WEEK } from "@/lib/constants";

export interface WeeklyDataPoint {
  week: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
  weekStart?: Date;
  weekEnd?: Date;
}

interface WeekBucket {
  label: string;
  start: Date;
  end: Date;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

function formatWeekLabel(start: Date, end: Date): string {
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startDay = start.getDate();
  const endDay = end.getDate();

  return startMonth === endMonth
    ? `${startMonth} ${startDay}-${endDay}`
    : `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

/** `weeks` consecutive 7-day buckets ending today (local time), oldest first. */
function initializeWeekBuckets(now: Date, weeks: number): WeekBucket[] {
  const buckets: WeekBucket[] = [];
  for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - weekIndex * DAYS_IN_WEEK);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - (DAYS_IN_WEEK - 1));
    weekStart.setHours(0, 0, 0, 0);

    buckets.unshift({
      label: formatWeekLabel(weekStart, weekEnd),
      start: weekStart,
      end: weekEnd,
      count: 0,
      easy: 0,
      medium: 0,
      hard: 0,
    });
  }
  return buckets;
}

function countIntoBucket(bucket: WeekBucket, difficulty: string): void {
  bucket.count++;
  if (difficulty === "EASY") bucket.easy++;
  else if (difficulty === "MEDIUM") bucket.medium++;
  else if (difficulty === "HARD") bucket.hard++;
}

/** Problems solved per week (with difficulty split) for the last `weeks` weeks. */
export function calculateWeeklyStats(
  problems: readonly { solvedAt: Date; difficulty: string }[],
  now: Date,
  weeks: number
): WeeklyDataPoint[] {
  const buckets = initializeWeekBuckets(now, weeks);
  for (const problem of problems) {
    const solvedDate = new Date(problem.solvedAt);
    const bucket = buckets.find(
      (candidate) =>
        solvedDate >= candidate.start && solvedDate <= candidate.end
    );
    if (bucket) countIntoBucket(bucket, problem.difficulty);
  }

  return buckets.map((bucket) => ({
    week: bucket.label,
    count: bucket.count,
    easy: bucket.easy,
    medium: bucket.medium,
    hard: bucket.hard,
    weekStart: bucket.start,
    weekEnd: bucket.end,
  }));
}
