import { prisma } from "@/lib/db/prisma";

export async function ensurePrismaUser(userId: string, email: string) {
  return prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: {
      id: userId,
      email,
    },
  });
}
