import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queryRaw = vi.fn();
vi.mock("@/lib/db/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

const { GET, POST } = await import("@/app/api/cron/keepalive/route");

const SECRET = "test-cron-secret-value";
const URL_KEEPALIVE = "http://localhost/api/cron/keepalive";

function cronRequest(authorization?: string): Request {
  const headers = authorization ? { authorization } : undefined;
  return new Request(URL_KEEPALIVE, { headers });
}

describe("/api/cron/keepalive auth (fails closed)", () => {
  beforeEach(() => {
    queryRaw.mockReset();
    queryRaw.mockResolvedValue([{ now: new Date("2026-01-01T00:00:00Z") }]);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 503 and never touches the DB when CRON_SECRET is unset", async () => {
    vi.stubEnv("CRON_SECRET", undefined);
    const response = await GET(cronRequest());
    expect(response.status).toBe(503);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 503 when CRON_SECRET is empty, even with an empty bearer", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const response = await GET(cronRequest("Bearer "));
    expect(response.status).toBe(503);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("returns 401 when the bearer is missing", async () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    const response = await GET(cronRequest());
    expect(response.status).toBe(401);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it.each([
    ["wrong secret", "Bearer not-the-secret"],
    ["secret without the Bearer scheme", SECRET],
    ["secret prefix only", `Bearer ${SECRET.slice(0, -1)}`],
    ["secret with a suffix", `Bearer ${SECRET}x`],
  ])("returns 401 for %s", async (_label, authorization) => {
    vi.stubEnv("CRON_SECRET", SECRET);
    const response = await POST(cronRequest(authorization));
    expect(response.status).toBe(401);
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it("runs the keepalive query for the correct bearer", async () => {
    vi.stubEnv("CRON_SECRET", SECRET);
    const response = await GET(cronRequest(`Bearer ${SECRET}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});

// Any future cron route must use the shared guard rather than its own check.
describe("every /api/cron/* route uses authorizeCronRequest", () => {
  const cronDir = join(process.cwd(), "app", "api", "cron");
  const routeFiles = readdirSync(cronDir, { recursive: true, encoding: "utf8" })
    .filter((relativePath) => relativePath.endsWith("route.ts"))
    .map((relativePath) => join(cronDir, relativePath));

  it("finds at least one cron route", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it.each(routeFiles)("%s calls the shared guard", (routeFile) => {
    expect(readFileSync(routeFile, "utf8")).toMatch(
      /authorizeCronRequest\(request\)/
    );
  });
});
