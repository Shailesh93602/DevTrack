import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Bad client input answers 400 (never 500), validated input is what gets
// written, and an unexpected failure does not echo its internals.

const existingLog = { id: "log-1", userId: "user-1" };
const dailyLogUpdate = vi.fn(async () => existingLog);
const dbFailure = new Error(
  "Can't reach database server at `db.secret-host.supabase.co:5432`"
);

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    dailyLog: {
      findFirst: async () => existingLog,
      update: (...args: unknown[]) => dailyLogUpdate(...(args as [])),
    },
    dSAProblem: { findMany: async () => [] },
    session: {
      findFirst: async () => null,
      create: async () => {
        throw dbFailure;
      },
    },
  },
}));
vi.mock("@/lib/services/streak", () => ({ syncUserStreak: async () => {} }));
vi.mock("@/lib/auth/supabase-server", () => ({
  createServerSupabaseClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1" } } }),
      exchangeCodeForSession: async () => ({ error: null }),
    },
  }),
}));
vi.mock("@/lib/utils/logger", () => ({
  logger: { error: () => {}, warn: () => {}, info: () => {} },
}));
vi.mock("next/cache", () => ({ revalidatePath: () => {} }));

const sessions = await import("@/app/api/session/route");
const dailyLog = await import("@/app/api/daily-log/[id]/route");
const patterns = await import("@/app/api/dsa-problem/patterns/route");
const callback = await import("@/app/auth/callback/route");

const params = { params: Promise.resolve({ id: "log-1" }) };

beforeEach(() => dailyLogUpdate.mockClear());

describe("request boundary", () => {
  it("answers 400 INVALID_JSON for a malformed body", async () => {
    const response = await sessions.POST(
      new NextRequest("http://localhost/api/session", {
        method: "POST",
        body: "{not json",
      })
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_JSON");
  });

  it("answers 400 for an invalid patterns limit", async () => {
    const response = await patterns.GET(
      new NextRequest("http://localhost/api/dsa-problem/patterns?limit=-3")
    );
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });

  it("writes the validated (trimmed) topics, not the raw body", async () => {
    const response = await dailyLog.PUT(
      new NextRequest("http://localhost/api/daily-log/log-1", {
        method: "PUT",
        body: JSON.stringify({ topics: ["  graphs  "] }),
      }),
      params
    );
    expect(response.status).toBe(200);
    expect(dailyLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ topics: ["graphs"] }),
      })
    );
  });

  it("does not echo an internal error message", async () => {
    const response = await sessions.POST(
      new NextRequest("http://localhost/api/session", {
        method: "POST",
        body: "{}",
      })
    );
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).not.toContain("secret-host");
    expect(JSON.parse(text).error.code).toBe("INTERNAL_ERROR");
  });

  it.each(["@evil.test", ".evil.test", "//evil.test", "https://evil.test"])(
    "keeps the post-login redirect on this origin for next=%s",
    async (next) => {
      const response = await callback.GET(
        new Request(
          `https://devtrack.test/auth/callback?code=ok&next=${encodeURIComponent(next)}`
        )
      );
      const location = new URL(String(response.headers.get("location")));
      expect(location.host).toBe("devtrack.test");
    }
  );

  it("still honours a same-origin next path", async () => {
    const response = await callback.GET(
      new Request(
        "https://devtrack.test/auth/callback?code=ok&next=/dashboard/projects"
      )
    );
    expect(response.headers.get("location")).toBe(
      "https://devtrack.test/dashboard/projects"
    );
  });
});
