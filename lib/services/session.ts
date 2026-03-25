import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import {
  StartSessionInput,
  EndSessionInput,
  CreateSessionEventInput,
  SessionQueryParams,
} from "@/lib/validations";

/**
 * Service to manage user learning sessions.
 */

export async function startSession(userId: string, data: StartSessionInput) {
  // Check if user already has an active session
  const activeSession = await getActiveSession(userId);
  if (activeSession) {
    throw new Error("You already have an active session. Please end it first.");
  }

  return prisma.session.create({
    data: {
      userId,
      ...data,
      startedAt: new Date(),
    },
  });
}

export async function endSession(userId: string, sessionId: string, data: EndSessionInput) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Session not found.");
  }

  if (session.endedAt) {
    throw new Error("Session is already ended.");
  }

  const endedAt = new Date();
  const durationSec = Math.floor((endedAt.getTime() - session.startedAt.getTime()) / 1000);

  return prisma.session.update({
    where: { id: sessionId },
    data: {
      endedAt,
      durationSec,
      notes: data.notes,
    },
  });
}

export async function addSessionActivity(
  userId: string,
  sessionId: string,
  data: CreateSessionEventInput
) {
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Session not found.");
  }

  if (session.endedAt) {
    throw new Error("Cannot add activity to an ended session.");
  }

  return prisma.sessionEvent.create({
    data: {
      sessionId,
      ...data,
    },
  });
}

export async function getActiveSession(userId: string) {
  return prisma.session.findFirst({
    where: {
      userId,
      endedAt: null,
    },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getSessionsByUser(userId: string, params: SessionQueryParams) {
  const { startDate, endDate, limit, offset } = params;

  const where: Prisma.SessionWhereInput = { userId };
  if (startDate || endDate) {
    where.startedAt = {};
    if (startDate) where.startedAt.gte = startDate;
    if (endDate) where.startedAt.lte = endDate;
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { activities: true },
        },
      },
    }),
    prisma.session.count({ where }),
  ]);

  return { sessions, total, limit, offset };
}

export async function getSessionById(userId: string, sessionId: string) {
  return prisma.session.findFirst({
    where: { id: sessionId, userId },
    include: {
      activities: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
