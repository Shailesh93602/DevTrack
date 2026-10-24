import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

// A record that does not exist for this user must answer 404 NOT_FOUND, not
// 500. Prisma is stubbed to find nothing, so each route runs its real service.

const findNothing = { findFirst: async () => null };
const tx = { project: findNothing, milestone: findNothing };

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: async (run: (client: typeof tx) => unknown) => run(tx),
    session: findNothing,
    project: { deleteMany: async () => ({ count: 0 }) },
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

const project = await import("@/app/api/project/[id]/route");
const milestones = await import("@/app/api/project/[id]/milestones/route");
const milestone =
  await import("@/app/api/project/[id]/milestones/[milestoneId]/route");
const complete =
  await import("@/app/api/project/[id]/milestones/[milestoneId]/complete/route");
const session = await import("@/app/api/session/[id]/route");
const activity = await import("@/app/api/session/[id]/activity/route");

function request(method: string, body?: object) {
  return new NextRequest("http://localhost/api/x", {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

const projectParams = { params: Promise.resolve({ id: "missing" }) };
const milestoneParams = {
  params: Promise.resolve({ id: "p", milestoneId: "missing" }),
};

const CASES: Array<[string, () => Promise<Response>]> = [
  [
    "DELETE /project/[id]",
    () => project.DELETE(request("DELETE"), projectParams),
  ],
  [
    "POST /project/[id]/milestones",
    () =>
      milestones.POST(request("POST", { title: "M", order: 0 }), projectParams),
  ],
  [
    "DELETE /project/[id]/milestones/[milestoneId]",
    () => milestone.DELETE(request("DELETE"), milestoneParams),
  ],
  [
    "POST /project/[id]/milestones/[milestoneId]/complete",
    () => complete.POST(request("POST"), milestoneParams),
  ],
  ["GET /session/[id]", () => session.GET(request("GET"), projectParams)],
  [
    "PATCH /session/[id]",
    () => session.PATCH(request("PATCH", {}), projectParams),
  ],
  [
    "POST /session/[id]/activity",
    () =>
      activity.POST(
        request("POST", { activityType: "READING" }),
        projectParams
      ),
  ],
];

describe("not-found answers 404", () => {
  it.each(CASES)("%s", async (_route, call) => {
    const response = await call();
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toMatchObject({
      success: false,
      error: { code: "NOT_FOUND" },
    });
  });
});
