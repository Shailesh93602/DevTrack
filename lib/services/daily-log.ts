import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { parseUtcDate, normalizeToUtcMidnight } from "@/lib/utils/date";
import type { CreateDailyLogInput, UpdateDailyLogInput, DailyLogQueryParams } from "@/lib/validations/daily-log";
import { ensurePrismaUser } from "./user";

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
  data: CreateDailyLogInput,
  email?: string
) {
  if (email) {
    await ensurePrismaUser(userId, email);
  }
  return prisma.dailyLog.create({
    data: {
      ...data,
      date: parseUtcDate(data.date),
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
  data: UpdateDailyLogInput & { topics?: string[] }
) {
  const { date, ...rest } = data;
  const dateUpdate = date ? { date: parseUtcDate(date) } : {};

  const updateData: Prisma.DailyLogUpdateInput = {
    ...rest,
    ...dateUpdate,
  };

  const existing = await prisma.dailyLog.findFirst({
    where: { id, userId },
  });

  if (!existing) return null;

  return prisma.dailyLog.update({
    where: { id },
    data: updateData,
    select: defaultSelect,
  });
}

export async function deleteDailyLog(userId: string, id: string) {
  return prisma.dailyLog.deleteMany({
    where: { id, userId },
  });
}

export async function getDailyLogByDate(userId: string, date: Date) {
  const dateOnly = normalizeToUtcMidnight(date);

  return prisma.dailyLog.findFirst({
    where: { userId, date: dateOnly },
    select: defaultSelect,
  });
}
