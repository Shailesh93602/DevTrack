import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";

// Per-user fixed-window write limits in Postgres; design notes in README "Rate limits".
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export const RATE_LIMITS = {
  write: 120,
  create: 30,
} as const;

export type RateLimitKind = keyof typeof RATE_LIMITS;

export type RateLimitDecision =
  | { isAllowed: true }
  | { isAllowed: false; retryAfterSec: number };

type BucketCount = { bucket: string; count: number };

export function windowStartFor(nowMs: number): number {
  return Math.floor(nowMs / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS;
}

export async function consumeRateLimit(
  userId: string,
  kind: RateLimitKind,
  nowMs: number = Date.now()
): Promise<RateLimitDecision> {
  const windowStartMs = windowStartFor(nowMs);
  const windowStartIso = new Date(windowStartMs).toISOString();
  // A create also spends a write.
  const buckets: RateLimitKind[] =
    kind === "create" ? ["write", "create"] : ["write"];

  try {
    // UTC via the ISO cast, whatever the session time zone.
    const rows = await prisma.$queryRaw<BucketCount[]>`
      INSERT INTO "RateLimit" ("userId", "bucket", "windowStart", "count")
      SELECT ${userId}, bucket, (${windowStartIso}::timestamptz AT TIME ZONE 'UTC'), 1
      FROM unnest(${buckets}::text[]) AS bucket
      ON CONFLICT ("userId", "bucket", "windowStart")
      DO UPDATE SET "count" = "RateLimit"."count" + 1
      RETURNING "bucket", "count"`;

    // First hit of a new window: drop this user's older windows.
    if (rows.some((row) => Number(row.count) === 1)) {
      await prisma.rateLimit.deleteMany({
        where: { userId, windowStart: { lt: new Date(windowStartMs) } },
      });
    }

    const isOverLimit = rows.some(
      (row) => Number(row.count) > RATE_LIMITS[row.bucket as RateLimitKind]
    );
    if (!isOverLimit) {
      return { isAllowed: true };
    }
    const retryAfterSec = Math.ceil(
      (windowStartMs + RATE_LIMIT_WINDOW_MS - nowMs) / 1000
    );
    return { isAllowed: false, retryAfterSec };
  } catch (error) {
    // Fail open: a limiter fault must not lock users out of their own data.
    logger.error("Rate limit check failed; allowing request", error);
    return { isAllowed: true };
  }
}
