import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Every mutating API route must answer 429 + Retry-After once the limiter
// refuses, before it touches any data.

const consume = vi.fn();
const neverReached = () => {
  throw new Error("route reached the database");
};

vi.mock("@/lib/services/rate-limit", () => ({
  consumeRateLimit: (...args: unknown[]) => consume(...args),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: new Proxy({}, { get: neverReached }),
}));
vi.mock("@/lib/auth/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
  }),
}));
vi.mock("@/lib/utils/logger", () => ({
  logger: { error: () => {}, warn: () => {}, info: () => {} },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

type Handler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<Response>;

const MUTATING = ["POST", "PUT", "PATCH", "DELETE"] as const;
const API_DIR = join(process.cwd(), "app/api");
const params = Promise.resolve({ id: "id-1", milestoneId: "m-1" });

function routeFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    return entry.name === "route.ts" ? [path] : [];
  });
}

// Cron routes are bearer-guarded machine calls, not user writes.
const userRoutes = routeFiles(API_DIR).filter((f) => !f.includes("/cron/"));

const CASES = userRoutes.flatMap((file) => {
  const source = readFileSync(file, "utf8");
  return MUTATING.filter((method) =>
    source.includes(`export async function ${method}(`)
  ).map((method) => [file.slice(API_DIR.length), method, file] as const);
});

const CREATE_ROUTES = new Set([
  "/daily-log/route.ts POST",
  "/project/route.ts POST",
  "/project/[id]/milestones/route.ts POST",
  "/dsa-problem/route.ts POST",
  "/session/route.ts POST",
  "/session/[id]/activity/route.ts POST",
]);

beforeEach(() => {
  consume.mockReset();
});

describe("mutating API routes are rate limited", () => {
  it("finds every mutating handler", () => {
    expect(CASES).toHaveLength(15);
  });

  it.each(CASES)(
    "%s %s → 429 before any write",
    async (route, method, file) => {
      consume.mockResolvedValue({ isAllowed: false, retryAfterSec: 42 });
      const routeModule = (await import(file)) as Record<string, Handler>;
      const response = await routeModule[method](
        new NextRequest("http://localhost/api/x", {
          method,
          body: method === "DELETE" ? undefined : JSON.stringify({}),
        }),
        { params }
      );

      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("42");
      expect(await response.json()).toEqual({
        success: false,
        error: {
          message: "Too many requests. Try again later.",
          code: "RATE_LIMITED",
          details: { retryAfterSec: 42 },
        },
      });
      const kind = CREATE_ROUTES.has(`${route} ${method}`) ? "create" : "write";
      expect(consume).toHaveBeenCalledWith("user-1", kind);
    }
  );
});
