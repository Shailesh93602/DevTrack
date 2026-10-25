import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// PATCH /api/project/[id] — the edit form's endpoint. Prisma is an in-memory
// table whose findFirst honours every key in `where`, so dropping the userId
// scope from the service lets user-1 edit user-2's project and fails here.

type ProjectRow = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: string;
  techStack: string[];
  dueDate: Date | null;
};

const rows = new Map<string, ProjectRow>();
const activityLogs: unknown[] = [];
const consume = vi.fn();

function matches(row: ProjectRow, where: Partial<ProjectRow>) {
  return Object.entries(where).every(
    ([key, value]) => row[key as keyof ProjectRow] === value
  );
}

const tx = {
  project: {
    findFirst: async ({ where }: { where: Partial<ProjectRow> }) =>
      [...rows.values()].find((row) => matches(row, where)) ?? null,
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Partial<ProjectRow>;
    }) => {
      const row = rows.get(where.id);
      if (!row) throw new Error("update of a missing row");
      const updated = { ...row, ...data };
      rows.set(where.id, updated);
      return updated;
    },
  },
  projectActivityLog: {
    create: async (entry: unknown) => activityLogs.push(entry),
  },
};

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    $transaction: async (run: (client: typeof tx) => unknown) => run(tx),
  },
}));
vi.mock("@/lib/services/rate-limit", () => ({
  consumeRateLimit: (...args: unknown[]) => consume(...args),
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

const { PATCH } = await import("@/app/api/project/[id]/route");

function patch(id: string, body: string) {
  return PATCH(
    new NextRequest(`http://localhost/api/project/${id}`, {
      method: "PATCH",
      body,
    }),
    { params: Promise.resolve({ id }) }
  );
}

beforeEach(() => {
  rows.clear();
  activityLogs.length = 0;
  consume.mockReset();
  consume.mockResolvedValue({ isAllowed: true, retryAfterSec: 0 });
  rows.set("p-own", {
    id: "p-own",
    userId: "user-1",
    name: "Old name",
    description: null,
    status: "ON_HOLD",
    techStack: ["Go"],
    dueDate: new Date("2026-12-01T00:00:00.000Z"),
  });
  rows.set("p-other", {
    id: "p-other",
    userId: "user-2",
    name: "Not yours",
    description: null,
    status: "IN_PROGRESS",
    techStack: [],
    dueDate: null,
  });
});

describe("PATCH /api/project/[id]", () => {
  it("updates the user's project and returns the changed fields", async () => {
    const response = await patch(
      "p-own",
      JSON.stringify({ name: "  New name  ", status: "COMPLETED" })
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toMatchObject({ name: "New name", status: "COMPLETED" });
    expect(rows.get("p-own")).toMatchObject({
      name: "New name",
      status: "COMPLETED",
      techStack: ["Go"],
    });
    expect(activityLogs).toHaveLength(1);
  });

  it("leaves omitted fields alone (no schema defaults on update)", async () => {
    const response = await patch("p-own", JSON.stringify({ name: "Renamed" }));

    expect(response.status).toBe(200);
    expect(rows.get("p-own")).toMatchObject({
      name: "Renamed",
      status: "ON_HOLD",
      techStack: ["Go"],
    });
  });

  it("clears the due date when the body sends dueDate: null", async () => {
    const response = await patch("p-own", JSON.stringify({ dueDate: null }));

    expect(response.status).toBe(200);
    expect(rows.get("p-own")?.dueDate).toBeNull();
  });

  it("leaves the due date unchanged when dueDate is omitted", async () => {
    const response = await patch("p-own", JSON.stringify({ name: "Renamed" }));

    expect(response.status).toBe(200);
    expect(rows.get("p-own")?.dueDate).toEqual(
      new Date("2026-12-01T00:00:00.000Z")
    );
  });

  it("sets a new due date from an ISO string", async () => {
    const response = await patch(
      "p-own",
      JSON.stringify({ dueDate: "2027-01-15" })
    );

    expect(response.status).toBe(200);
    expect(rows.get("p-own")?.dueDate).toEqual(
      new Date("2027-01-15T00:00:00.000Z")
    );
  });

  it("answers 400 for an invalid due date and keeps the old one", async () => {
    const response = await patch(
      "p-own",
      JSON.stringify({ dueDate: "not-a-date" })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(rows.get("p-own")?.dueDate).toEqual(
      new Date("2026-12-01T00:00:00.000Z")
    );
  });

  it("answers 404 for another user's project and does not touch it", async () => {
    const response = await patch("p-other", JSON.stringify({ name: "Mine" }));

    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe("NOT_FOUND");
    expect(rows.get("p-other")?.name).toBe("Not yours");
    expect(activityLogs).toHaveLength(0);
  });

  it("answers 404 for a missing project", async () => {
    const response = await patch("p-none", JSON.stringify({ name: "X" }));
    expect(response.status).toBe(404);
  });

  it("answers 400 VALIDATION_ERROR for invalid input", async () => {
    const response = await patch(
      "p-own",
      JSON.stringify({ name: "", status: "DONE" })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
    expect(rows.get("p-own")?.name).toBe("Old name");
  });

  it("answers 400 INVALID_JSON for a malformed body", async () => {
    const response = await patch("p-own", "{not json");

    expect(response.status).toBe(400);
    expect((await response.json()).error).toEqual({
      message: "Request body is not valid JSON",
      code: "INVALID_JSON",
    });
  });

  it("answers 429 from the write bucket before any change", async () => {
    consume.mockResolvedValue({ isAllowed: false, retryAfterSec: 7 });
    const response = await patch("p-own", JSON.stringify({ name: "X" }));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("7");
    expect(consume).toHaveBeenCalledWith("user-1", "write");
    expect(rows.get("p-own")?.name).toBe("Old name");
  });
});
