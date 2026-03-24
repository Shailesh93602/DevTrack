import { prisma } from "@/lib/db/prisma";

export async function ensureUserInDb(id: string, email: string) {
  try {
    return await prisma.user.upsert({
      where: { id },
      update: { email },
      create: {
        id,
        email,
      },
    });
  } catch (error) {
    console.error(`[userService] Failed to ensure user ${email} in DB:`, error);
    throw error;
  }
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}
