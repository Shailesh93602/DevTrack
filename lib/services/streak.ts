import { prisma } from "@/lib/db/prisma";

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  currentStreakWithFreeze: number;
  freezesAvailable: number;
  freezesUsedThisWeek: number;
  currentMilestone: StreakMilestone | null;
  nextMilestone: StreakMilestone | null;
  progressToNext: number;
}

export interface StreakMilestone {
  days: number;
  name: string;
  badge: string;
  description: string;
}

const MILESTONES: StreakMilestone[] = [
  { days: 7, name: "Week Warrior", badge: "🎯", description: "7-day streak" },
  { days: 30, name: "Monthly Master", badge: "🔥", description: "30-day streak" },
  { days: 60, name: "Consistency King", badge: "⚡", description: "60-day streak" },
  { days: 100, name: "Century Champion", badge: "👑", description: "100-day streak" },
];

function getMilestonesForStreak(streak: number): { current: StreakMilestone | null; next: StreakMilestone | null; progress: number } {
  const achieved = MILESTONES.filter((m) => streak >= m.days);
  const current = achieved.length > 0 ? achieved[achieved.length - 1] : null;
  const nextIndex = achieved.length;
  const next = nextIndex < MILESTONES.length ? MILESTONES[nextIndex] : null;

  let progress = 0;
  if (next) {
    const prevDays = current?.days ?? 0;
    progress = Math.min(100, Math.round(((streak - prevDays) / (next.days - prevDays)) * 100));
  } else if (current) {
    progress = 100;
  }

  return { current, next, progress };
}

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isNextDay(a: string, b: string): boolean {
  const dateA = new Date(a + "T00:00:00Z");
  const dateB = new Date(b + "T00:00:00Z");
  const diffMs = dateB.getTime() - dateA.getTime();
  return diffMs === 86_400_000;
}

function getWeekStart(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  const dayOfWeek = date.getUTCDay();
  const weekStart = new Date(date);
  weekStart.setUTCDate(date.getUTCDate() - dayOfWeek);
  return toUtcDateString(weekStart);
}

function calculateStreakWithFreeze(
  dates: string[],
  referenceDate: string
): { streak: number; freezesUsed: number } {
  if (dates.length === 0) return { streak: 0, freezesUsed: 0 };

  // Check if reference date is today or yesterday of last log
  const lastDate = dates.at(-1)!;
  const today = toUtcDateString(new Date());
  const yesterday = toUtcDateString(new Date(Date.now() - 86_400_000));

  if (lastDate !== today && lastDate !== yesterday) {
    return { streak: 0, freezesUsed: 0 };
  }

  let streak = 0;
  let freezesUsed = 0;
  let currentWeekFreezes = 0;
  let lastWeekStart: string | null = null;

  // Work backwards from the reference date
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const expectedDate = toUtcDateString(
      new Date(new Date(referenceDate + "T00:00:00Z").getTime() - streak * 86_400_000)
    );

    if (date === expectedDate) {
      streak++;
    } else {
      // Check if we can use a freeze
      const dateWeekStart = getWeekStart(expectedDate);

      if (lastWeekStart !== dateWeekStart) {
        currentWeekFreezes = 0;
        lastWeekStart = dateWeekStart;
      }

      if (currentWeekFreezes < 1) {
        // Use freeze for this day
        streak++;
        freezesUsed++;
        currentWeekFreezes++;
        // Continue checking with the same date (it should match the next expected)
        i++; // Don't advance, check same date against next expected
      } else {
        // Streak broken
        break;
      }
    }
  }

  return { streak, freezesUsed };
}

export async function calculateStreaks(userId: string): Promise<StreakStats> {
  // Only fetch last 120 days - sufficient for current streak calc, avoids loading all history
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 120);

  const logs = await prisma.dailyLog.findMany({
    where: { userId, date: { gte: cutoffDate } },
    select: { date: true },
    orderBy: { date: "asc" },
  });

  if (logs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      currentStreakWithFreeze: 0,
      freezesAvailable: 1,
      freezesUsedThisWeek: 0,
      currentMilestone: null,
      nextMilestone: MILESTONES[0] ?? null,
      progressToNext: 0,
    };
  }

  const dates = logs.map((log) => toUtcDateString(log.date));

  // Calculate longest streak
  let streak = 1;
  let longest = 1;
  for (let i = 1; i < dates.length; i++) {
    if (isNextDay(dates[i - 1], dates[i])) {
      streak++;
      longest = Math.max(longest, streak);
    } else {
      streak = 1;
    }
  }

  // Calculate current streak (without freeze)
  const todayStr = toUtcDateString(new Date());
  const yesterdayStr = toUtcDateString(
    new Date(Date.now() - 86_400_000)
  );
  const lastDate = dates.at(-1)!;

  let currentStreak = 0;
  if (lastDate === todayStr || lastDate === yesterdayStr) {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      if (isNextDay(dates[i], dates[i + 1])) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate streak with freeze
  const today = toUtcDateString(new Date());
  const { streak: currentStreakWithFreeze, freezesUsed: _freezesUsed } = calculateStreakWithFreeze(
    dates,
    today
  );

  // Calculate freezes available this week
  const todayWeekStart = getWeekStart(today);
  const freezesUsedThisWeek = dates.filter((d, i) => {
    if (getWeekStart(d) !== todayWeekStart) return false;
    // Check if this date used a freeze (gap from previous day)
    if (i === 0) return false;
    const prevDate = dates[i - 1];
    return !isNextDay(prevDate, d);
  }).length;

  const { current, next, progress } = getMilestonesForStreak(currentStreak);

  // Persist longest streak if new record achieved
  const effectiveLongest = Math.max(longest, currentStreak);
  if (effectiveLongest > 0) {
    await prisma.user.updateMany({
      where: { id: userId, longestStreak: { lt: effectiveLongest } },
      data: { longestStreak: effectiveLongest },
    });
  }

  return {
    currentStreak,
    longestStreak: effectiveLongest,
    currentStreakWithFreeze,
    freezesAvailable: Math.max(0, 1 - freezesUsedThisWeek),
    freezesUsedThisWeek,
    currentMilestone: current,
    nextMilestone: next,
    progressToNext: progress,
  };
}
