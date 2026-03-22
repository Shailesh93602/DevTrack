import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import type { CreateDailyLogInput, UpdateDailyLogInput, DailyLogQueryParams } from "@/lib/validations/daily-log";

export type DailyLogWithUser = Prisma.DailyLogGetPayload<{
  include: { user: { select: { id: true; email: true } } };
}>;

const defaultSelect = {
  id: true,
  userId: true,
  date: true,
  problemsSolved: true,
  topics: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DailyLogSelect;

export async function createDailyLog(
  userId: string,
  data: CreateDailyLogInput
) {
  return prisma.dailyLog.create({
    data: {
      ...data,
      userId,
    },
    select: defaultSelect,
  });
}

export async function getDailyLogs(userId: string, params: DailyLogQueryParams) {
  const { startDate, endDate, limit, offset } = params;

  const where: Prisma.DailyLogWhereInput = { userId };

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = startDate;
    if (endDate) where.date.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.dailyLog.findMany({
      where,
      orderBy: { date: "desc" },
      take: limit,
      skip: offset,
      select: defaultSelect,
    }),
    prisma.dailyLog.count({ where }),
  ]);

  return { logs, total, limit, offset };
}

export async function getDailyLogById(userId: string, id: string) {
  return prisma.dailyLog.findFirst({
    where: { id, userId },
    select: defaultSelect,
  });
}

export async function updateDailyLog(
  userId: string,
  id: string,
  data: UpdateDailyLogInput
) {
  return prisma.dailyLog.updateMany({
    where: { id, userId },
    data,
  });
}

export async function deleteDailyLog(userId: string, id: string) {
  return prisma.dailyLog.deleteMany({
    where: { id, userId },
  });
}

export async function getDailyLogByDate(userId: string, date: Date) {
  // @db.Date stores date-only in Postgres. Normalize to UTC midnight so the
  // comparison is timezone-safe regardless of the server's local timezone.
  const dateOnly = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

  return prisma.dailyLog.findFirst({
    where: { userId, date: dateOnly },
    select: defaultSelect,
  });
}
