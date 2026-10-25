import { describe, expect, it } from "vitest";

// Real Postgres: RATE_LIMIT_TEST_DATABASE_URL must be a local database ending
// "_e2e" with prisma/migrations/*_add_rate_limit applied. Skipped otherwise.
const testUrl = process.env.RATE_LIMIT_TEST_DATABASE_URL;

describe.skipIf(!testUrl)("consumeRateLimit against Postgres", () => {
  it("counts concurrent requests exactly and refuses every one over the limit", async () => {
    const url = new URL(testUrl ?? "");
    expect(["localhost", "127.0.0.1"]).toContain(url.hostname);
    expect(url.pathname).toMatch(/_e2e$/);
    process.env.DATABASE_URL = testUrl;

    const { prisma } = await import("@/lib/db/prisma");
    const [{ db }] = await prisma.$queryRaw<
      { db: string }[]
    >`SELECT current_database() AS db`;
    expect(db).toMatch(/_e2e$/);

    const { consumeRateLimit, RATE_LIMITS, RATE_LIMIT_WINDOW_MS } =
      await import("@/lib/services/rate-limit");
    const userId = `pg-test-${Date.now()}`;
    const now = Date.now();

    // A stale window from earlier, which the first hit must prune.
    await prisma.rateLimit.create({
      data: {
        userId,
        bucket: "write",
        windowStart: new Date(now - 3 * RATE_LIMIT_WINDOW_MS),
        count: 5,
      },
    });

    const attempts = RATE_LIMITS.write + 40;
    const decisions = await Promise.all(
      Array.from({ length: attempts }, () =>
        consumeRateLimit(userId, "write", now)
      )
    );

    expect(decisions.filter((d) => d.isAllowed)).toHaveLength(
      RATE_LIMITS.write
    );
    const rows = await prisma.rateLimit.findMany({ where: { userId } });
    expect(rows).toHaveLength(1);
    expect(rows[0].count).toBe(attempts);

    await prisma.rateLimit.deleteMany({ where: { userId } });
    await prisma.$disconnect();
  });
});
