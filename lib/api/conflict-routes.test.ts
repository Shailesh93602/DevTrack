import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// A request that conflicts with the record's state must answer 409, not 500.
// Prisma returns an ended session for every lookup; any write throws.

const endedSession = {
  id: "s1",
  userId: "user-1",
  startedAt: new Date("2026-10-24T09:00:00Z"),
  endedAt: new Date("2026-10-24T10:00:00Z"),
  activities: [],
};
const neverWrite = async () => {
  throw new Error("write reached the database");
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    session: {
      findFirst: async () => endedSession,
      create: neverWrite,
      update: neverWrite,
    },
  },
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

const sessions = await import("@/app/api/session/route");
const session = await import("@/app/api/session/[id]/route");

function request(method: string, body: object) {
  return new NextRequest("http://localhost/api/x", {
    method,
    body: JSON.stringify(body),
  });
}

const CASES: Array<[string, () => Promise<Response>, string]> = [
  [
    "POST /session with a session already active",
    () => sessions.POST(request("POST", {})),
    "You already have an active session. Please end it first.",
  ],
  [
    "PATCH /session/[id] on an ended session",
    () =>
      session.PATCH(request("PATCH", {}), {
        params: Promise.resolve({ id: "s1" }),
      }),
    "Session is already ended.",
  ],
];

describe("state conflicts answer 409", () => {
  it.each(CASES)("%s", async (_route, call, message) => {
    const response = await call();
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({
      success: false,
      error: { message, code: "CONFLICT" },
    });
  });
});
