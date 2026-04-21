import { prisma } from "@/lib/db/prisma";

export async function ensureUserInDb(id: string, email: string) {
  try {
    // Match by email rather than id. Supabase ids are stable within a
    // session but NOT across delete+recreate, whereas email is the real
    // cross-session identity. A user who was deleted server-side (test
    // fixtures, admin action) and re-signs-up with the same email got
    // a NEW Supabase id; upserting by id tried to INSERT a second row
    // with the same email, tripping the User.email @unique constraint
    // as "unique constraint errors on every create" from the tester's
    // point of view.
    //
    // Matching by email keeps the Prisma User row as the canonical
    // record + updates its id to the current Supabase session so
    // downstream foreign-key writes (Project.userId, etc.) work.
    return await prisma.user.upsert({
      where: { email },
      update: { id },
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
