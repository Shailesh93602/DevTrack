import { prisma } from "@/lib/db/prisma";
import { 
  toUtcDateString, 
  isNextDay, 
  getTodayUtcString, 
  getYesterdayUtcString,
  parseUtcDate,
  DATE_CONSTANTS
} from "@/lib/utils/date";

const { STREAK_CUTOFF_DAYS } = DATE_CONSTANTS;

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Calculate current streak from sorted unique dates
 * Must be consecutive from today or yesterday
 */
function calculateCurrentStreak(uniqueDates: string[]): number {
  const today = getTodayUtcString();
  const yesterday = getYesterdayUtcString();
  const lastDate = uniqueDates.at(-1)!;

  // Only count streak if last log is today or yesterday
  if (lastDate !== today && lastDate !== yesterday) {
    return 0;
  }

  let currentStreak = 0;
  let expectedDate = lastDate;
  let dateIndex = uniqueDates.length - 1;

  while (dateIndex >= 0) {
    const currentDate = uniqueDates[dateIndex];

    if (currentDate === expectedDate) {
      // Found the expected date, count it and move to previous day
      currentStreak++;
      const expectedDateObj = parseUtcDate(expectedDate);
      expectedDateObj.setUTCDate(expectedDateObj.getUTCDate() - 1);
      expectedDate = toUtcDateString(expectedDateObj);
      dateIndex--;
    } else {
      // Gap detected - check if it's before expected date
      const currentDateObj = parseUtcDate(currentDate);
      const expectedDateObj = parseUtcDate(expectedDate);

      if (currentDateObj.getTime() < expectedDateObj.getTime()) {
        // Gap exists, streak ends
        break;
      }
      // Skip dates after expected (shouldn't happen with sorted)
      dateIndex--;
    }
  }

  return currentStreak;
}

/**
 * Calculate current and longest streaks from daily log dates
 * Streak requires CONSECUTIVE days - any gap breaks the streak
 * @param dates - Array of YYYY-MM-DD strings in ascending order
 * @returns Current streak and longest streak
 */
export function calculateStreakFromDates(dates: string[]): StreakResult {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => a.localeCompare(b));

  // Calculate longest streak with forward pass
  let runningStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    if (isNextDay(uniqueDates[i - 1], uniqueDates[i])) {
      runningStreak++;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }

  const currentStreak = calculateCurrentStreak(uniqueDates);

  return { currentStreak, longestStreak };
}

/**
 * Fetch user's daily logs and calculate streak statistics
 * Optimized: only fetches last STREAK_CUTOFF_DAYS days for current streak
 * Longest streak is persisted to avoid full table scans
 */
export async function calculateStreaks(userId: string): Promise<StreakResult> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - STREAK_CUTOFF_DAYS);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: cutoffDate } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const dates = logs.map((log) => toUtcDateString(log.date));
  const { currentStreak, longestStreak } = calculateStreakFromDates(dates);

  return { currentStreak, longestStreak };
}

/**
 * Synchronize user's streak stats by calculating and persisting new records.
 * Fetches recent logs and updates User.longestStreak if new record found.
 */
export async function syncUserStreak(userId: string): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - STREAK_CUTOFF_DAYS);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: cutoffDate } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  if (logs.length === 0) return;

  const dates = logs.map((log) => toUtcDateString(log.date));
  const { longestStreak } = calculateStreakFromDates(dates);

  // We fetch user first to avoid unnecessary updates if current longest is already higher
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { longestStreak: true }
  });

  if (user && longestStreak > user.longestStreak) {
    await prisma.user.update({
      where: { id: userId },
      data: { longestStreak },
    });
  }
}

