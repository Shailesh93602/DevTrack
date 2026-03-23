import { prisma } from "@/lib/db/prisma";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Convert Date to UTC YYYY-MM-DD string for safe comparison
 * Avoids timezone issues with setHours(0,0,0,0) which uses local time
 */
function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Check if dateB is exactly 1 day after dateA
 * Both inputs are YYYY-MM-DD strings
 */
function isNextDay(a: string, b: string): boolean {
  const dateA = new Date(a + "T00:00:00Z");
  const dateB = new Date(b + "T00:00:00Z");
  const diffMs = dateB.getTime() - dateA.getTime();
  return diffMs === 86_400_000; // Exactly 24 hours
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

  // Remove duplicates and sort
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

  // Calculate current streak - MUST be consecutive from today
  const today = toUtcDateString(new Date());
  const yesterday = toUtcDateString(new Date(Date.now() - 86_400_000));

  let currentStreak = 0;
  const lastDate = uniqueDates.at(-1)!;

  // Only count streak if last log is today or yesterday
  if (lastDate === today || lastDate === yesterday) {
    // Start from expected date and work backwards through dates
    // Each date must be exactly 1 day before the expected date
    let expectedDate = lastDate;
    let dateIndex = uniqueDates.length - 1;

    while (dateIndex >= 0) {
      const currentDate = uniqueDates[dateIndex];

      if (currentDate === expectedDate) {
        // Found the expected date, count it and move to previous day
        currentStreak++;
        // Calculate previous expected date
        const expectedDateObj = new Date(expectedDate + "T00:00:00Z");
        expectedDateObj.setUTCDate(expectedDateObj.getUTCDate() - 1);
        expectedDate = toUtcDateString(expectedDateObj);
        dateIndex--;
      } else {
        // Gap detected - expected date not found
        // Check if this is just a date we haven't reached yet
        const currentDateObj = new Date(currentDate + "T00:00:00Z");
        const expectedDateObj = new Date(expectedDate + "T00:00:00Z");

        if (currentDateObj.getTime() < expectedDateObj.getTime()) {
          // Current date is before expected - gap exists, break streak
          break;
        }
        // Current date is after expected (shouldn't happen with sorted), skip it
        dateIndex--;
      }
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Fetch user's daily logs and calculate streak statistics
 * Optimized: only fetches last 120 days for current streak
 * Longest streak is persisted to avoid full table scans
 */
export async function calculateStreaks(userId: string): Promise<StreakResult> {
  // Only fetch last 120 days - sufficient for current streak calc
  // Current streaks beyond 120 days are extremely rare
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 120);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: cutoffDate } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  const dates = logs.map((log) => toUtcDateString(log.date));
  const { currentStreak, longestStreak } = calculateStreakFromDates(dates);

  // Persist longest streak if it's a new record
  // This allows future calls to skip full history scan
  const effectiveLongest = Math.max(longestStreak, currentStreak);
  if (effectiveLongest > 0) {
    await prisma.user.updateMany({
      where: { id: userId, longestStreak: { lt: effectiveLongest } },
      data: { longestStreak: effectiveLongest },
    });
  }

  return { currentStreak, longestStreak: effectiveLongest };
}
