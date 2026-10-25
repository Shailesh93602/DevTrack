import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
const deleteMany = vi.fn();
const logError = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
    rateLimit: { deleteMany: (...args: unknown[]) => deleteMany(...args) },
  },
}));
vi.mock("@/lib/utils/logger", () => ({
  logger: { error: (...args: unknown[]) => logError(...args) },
}));

const { consumeRateLimit, RATE_LIMITS, RATE_LIMIT_WINDOW_MS, windowStartFor } =
  await import("@/lib/services/rate-limit");

const WINDOW_START = Date.UTC(2026, 9, 25, 12, 0, 0);
const NOW = WINDOW_START + 4 * 60 * 1000 + 500;

function sqlValues(): unknown[] {
  return queryRaw.mock.calls[0].slice(1);
}

beforeEach(() => {
  queryRaw.mockReset();
  deleteMany.mockReset().mockResolvedValue({ count: 0 });
  logError.mockReset();
});

describe("consumeRateLimit", () => {
  it("allows up to the write limit and refuses the next one", async () => {
    queryRaw.mockResolvedValueOnce([
      { bucket: "write", count: RATE_LIMITS.write },
    ]);
    expect(await consumeRateLimit("u1", "write", NOW)).toEqual({
      isAllowed: true,
    });

    queryRaw.mockResolvedValueOnce([
      { bucket: "write", count: RATE_LIMITS.write + 1 },
    ]);
    expect(await consumeRateLimit("u1", "write", NOW)).toEqual({
      isAllowed: false,
      retryAfterSec: 360,
    });
  });

  it("refuses a create over the create limit even with writes to spare", async () => {
    queryRaw.mockResolvedValueOnce([
      { bucket: "write", count: RATE_LIMITS.create + 1 },
      { bucket: "create", count: RATE_LIMITS.create + 1 },
    ]);
    const decision = await consumeRateLimit("u1", "create", NOW);
    expect(decision.isAllowed).toBe(false);
  });

  it("increments both buckets for a create and only write otherwise", async () => {
    queryRaw.mockResolvedValue([{ bucket: "write", count: 2 }]);
    await consumeRateLimit("u1", "create", NOW);
    expect(sqlValues()).toEqual([
      "u1",
      new Date(WINDOW_START).toISOString(),
      ["write", "create"],
    ]);

    queryRaw.mockClear();
    await consumeRateLimit("u1", "write", NOW);
    expect(sqlValues()[2]).toEqual(["write"]);
  });

  it("is one atomic upsert-increment", async () => {
    queryRaw.mockResolvedValue([{ bucket: "write", count: 2 }]);
    await consumeRateLimit("u1", "write", NOW);
    const sql = (queryRaw.mock.calls[0][0] as string[]).join("?");
    expect(sql).toMatch(/ON CONFLICT \("userId", "bucket", "windowStart"\)/);
    expect(sql).toMatch(/"count" = "RateLimit"\."count" \+ 1/);
    expect(sql).toMatch(/RETURNING "bucket", "count"/);
  });

  it("prunes the user's older windows on the first hit of a window only", async () => {
    queryRaw.mockResolvedValueOnce([{ bucket: "write", count: 1 }]);
    await consumeRateLimit("u1", "write", NOW);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", windowStart: { lt: new Date(WINDOW_START) } },
    });

    deleteMany.mockClear();
    queryRaw.mockResolvedValueOnce([{ bucket: "write", count: 2 }]);
    await consumeRateLimit("u1", "write", NOW);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("fails open and logs when the database errors", async () => {
    queryRaw.mockRejectedValueOnce(new Error("connection refused"));
    expect(await consumeRateLimit("u1", "write", NOW)).toEqual({
      isAllowed: true,
    });
    expect(logError).toHaveBeenCalledTimes(1);
  });

  it("reads a bigint count from the driver", async () => {
    queryRaw.mockResolvedValueOnce([
      { bucket: "write", count: BigInt(RATE_LIMITS.write + 1) },
    ]);
    const decision = await consumeRateLimit("u1", "write", NOW);
    expect(decision.isAllowed).toBe(false);
  });

  it("rounds Retry-After up to a whole second", async () => {
    queryRaw.mockResolvedValueOnce([
      { bucket: "write", count: RATE_LIMITS.write + 1 },
    ]);
    const lastMs = WINDOW_START + RATE_LIMIT_WINDOW_MS - 1;
    expect(await consumeRateLimit("u1", "write", lastMs)).toEqual({
      isAllowed: false,
      retryAfterSec: 1,
    });
  });
});

describe("windowStartFor", () => {
  it("floors to the 10-minute window", () => {
    expect(windowStartFor(NOW)).toBe(WINDOW_START);
    expect(windowStartFor(WINDOW_START + RATE_LIMIT_WINDOW_MS)).toBe(
      WINDOW_START + RATE_LIMIT_WINDOW_MS
    );
  });
});
