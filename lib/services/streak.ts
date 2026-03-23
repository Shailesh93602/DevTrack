import { prisma } from "@/lib/db/prisma";

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
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
    return { currentStreak: 0, longestStreak: 0 };
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

  // Calculate current streak
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

  return { currentStreak, longestStreak: longest };
}
