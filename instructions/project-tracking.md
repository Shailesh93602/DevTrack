# Task: Advanced Project Tracking System

## Context

DevTrack is a Next.js (App Router) + TypeScript + Prisma + Supabase project.
You are extending the existing `Project` model with milestones, activity logs, and
auto-calculated progress. This task covers schema, validations, and services only.
No UI components or pages.

Read these files before writing any code:

- `CLAUDE.md` — all rules are mandatory, no exceptions
- `prisma/schema.prisma` — current schema you will extend
- `lib/services/dsa-problem.ts` — pattern for a complete service file
- `lib/validations/daily-log.ts` — pattern for a complete validation file
- `lib/services/daily-log.ts` — pattern for query params and service structure

---

## What You Are Building

Five things, in this order:

1. **Schema** — extend `prisma/schema.prisma`
2. **Validations** — `lib/validations/project.ts` (new)
3. **Validations** — `lib/validations/milestone.ts` (new)
4. **Service** — `lib/services/project.ts` (new)
5. **Service** — `lib/services/milestone.ts` (new)

Then: run `npx prisma generate` and update `CLAUDE.md` session notes.

---

## Step 1 — Schema Changes (`prisma/schema.prisma`)

### 1a — Extend the `Project` model

Replace the existing `Project` model with:

```prisma
model Project {
  id          String        @id @default(cuid())
  userId      String
  name        String
  description String?
  status      ProjectStatus @default(IN_PROGRESS)
  progress    Int           @default(0)
  dueDate     DateTime?
  techStack   String[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user         User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  milestones   Milestone[]
  activityLogs ProjectActivityLog[]

  @@index([userId, status])
}
```

Changes from original:

- Added `description String?`
- Added `dueDate DateTime?`
- Added `techStack String[]`
- Added `milestones` and `activityLogs` relations

### 1b — Add the `Milestone` model

Add after the `Project` model:

```prisma
model Milestone {
  id          String    @id @default(cuid())
  projectId   String
  userId      String
  title       String
  description String?
  dueDate     DateTime?
  completedAt DateTime?
  order       Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId, order])
  @@index([userId])
}
```

### 1c — Add the `ProjectActivityLog` model

Add after the `Milestone` model:

```prisma
model ProjectActivityLog {
  id        String              @id @default(cuid())
  projectId String
  userId    String
  action    ProjectActivityType
  metadata  Json?
  createdAt DateTime            @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId, createdAt])
}
```

### 1d — Add the `ProjectActivityType` enum

Add to the enums section at the bottom of the file:

```prisma
enum ProjectActivityType {
  PROJECT_CREATED
  PROJECT_UPDATED
  STATUS_CHANGED
  MILESTONE_ADDED
  MILESTONE_COMPLETED
  MILESTONE_DELETED
}
```

### 1e — Extend the `User` model

Add two new relation lines to the existing `User` model:

```prisma
  milestones   Milestone[]
  activityLogs ProjectActivityLog[]
```

The full `User` model should then look like:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())

  dailyLogs    DailyLog[]
  problems     DSAProblem[]
  projects     Project[]
  milestones   Milestone[]
  activityLogs ProjectActivityLog[]
}
```

### After schema changes

Run:

```
npx prisma generate
```

Do NOT run `prisma migrate dev` or `prisma db push` — schema migration is the developer's responsibility.

---

## Step 2 — `lib/validations/project.ts` (new file)

```ts
import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  status: z.nativeEnum(ProjectStatus).default("IN_PROGRESS"),
  dueDate: z.coerce.date().optional(),
  techStack: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdSchema = z.object({
  id: z.string().cuid(),
});

export const projectQuerySchema = z.object({
  status: z.nativeEnum(ProjectStatus).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectIdParams = z.infer<typeof projectIdSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
```

---

## Step 3 — `lib/validations/milestone.ts` (new file)

```ts
import { z } from "zod";

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(500).optional(),
  dueDate: z.coerce.date().optional(),
  order: z.number().int().min(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export const milestoneIdSchema = z.object({
  id: z.string().cuid(),
});

export const reorderMilestonesSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
export type MilestoneIdParams = z.infer<typeof milestoneIdSchema>;
export type ReorderMilestonesInput = z.infer<typeof reorderMilestonesSchema>;
```

---

## Step 4 — `lib/services/project.ts` (new file)

### Imports and types

```ts
import { prisma } from "@/lib/db/prisma";
import { Prisma, ProjectActivityType, ProjectStatus } from "@prisma/client";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
} from "@/lib/validations/project";
```

### `defaultSelect` constant

Define a typed select that all queries use:

```ts
const defaultSelect = {
  id: true,
  userId: true,
  name: true,
  description: true,
  status: true,
  progress: true,
  dueDate: true,
  techStack: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;
```

### `createProject(userId, data)`

Creates a project and logs `PROJECT_CREATED` in a single Prisma transaction.

```ts
export async function createProject(userId: string, data: CreateProjectInput) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: { ...data, userId },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId: project.id,
        userId,
        action: ProjectActivityType.PROJECT_CREATED,
        metadata: { name: project.name },
      },
    });

    return project;
  });
}
```

### `getProjects(userId, params)`

```ts
export async function getProjects(userId: string, params: ProjectQueryParams) {
  const { status, limit, offset } = params;

  const where: Prisma.ProjectWhereInput = { userId };
  if (status) where.status = status;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      select: defaultSelect,
    }),
    prisma.project.count({ where }),
  ]);

  return { projects, total, limit, offset };
}
```

### `getProjectById(userId, id)`

Returns the project with its milestones (ordered) and the 10 most recent activity logs:

```ts
export async function getProjectById(userId: string, id: string) {
  return prisma.project.findFirst({
    where: { id, userId },
    select: {
      ...defaultSelect,
      milestones: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          dueDate: true,
          completedAt: true,
          order: true,
          createdAt: true,
        },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          action: true,
          metadata: true,
          createdAt: true,
        },
      },
    },
  });
}
```

### `updateProject(userId, id, data)`

Detects status changes vs general updates, logs the correct activity type, and
runs everything in a transaction.

```ts
export async function updateProject(
  userId: string,
  id: string,
  data: UpdateProjectInput
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.project.findFirst({
      where: { id, userId },
      select: { status: true },
    });

    if (!existing) return null;

    const updatedProject = await tx.project.update({
      where: { id },
      data,
      select: defaultSelect,
    });

    const isStatusChange =
      data.status !== undefined && data.status !== existing.status;

    await tx.projectActivityLog.create({
      data: {
        projectId: id,
        userId,
        action: isStatusChange
          ? ProjectActivityType.STATUS_CHANGED
          : ProjectActivityType.PROJECT_UPDATED,
        metadata: isStatusChange
          ? { from: existing.status, to: data.status }
          : { fields: Object.keys(data) },
      },
    });

    return updatedProject;
  });
}
```

### `deleteProject(userId, id)`

```ts
export async function deleteProject(userId: string, id: string) {
  return prisma.project.deleteMany({
    where: { id, userId },
  });
}
```

### `recalculateProgress(projectId, tx?)` — internal helper

Called internally after any milestone mutation. Accepts an optional transaction
client so it can be composed inside transactions.

```ts
async function recalculateProgress(
  projectId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const [total, completed] = await Promise.all([
    tx.milestone.count({ where: { projectId } }),
    tx.milestone.count({ where: { projectId, completedAt: { not: null } } }),
  ]);

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  await tx.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
```

**Important:** `recalculateProgress` must not be exported. It is an internal implementation detail of this service module only.

---

## Step 5 — `lib/services/milestone.ts` (new file)

### Imports

```ts
import { prisma } from "@/lib/db/prisma";
import { Prisma, ProjectActivityType } from "@prisma/client";
import type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
  ReorderMilestonesInput,
} from "@/lib/validations/milestone";
```

### `defaultSelect` constant

```ts
const defaultSelect = {
  id: true,
  projectId: true,
  userId: true,
  title: true,
  description: true,
  dueDate: true,
  completedAt: true,
  order: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MilestoneSelect;
```

### `createMilestone(userId, projectId, data)`

Verifies the project belongs to the user before creating.
Logs `MILESTONE_ADDED`. Recalculates progress.

```ts
export async function createMilestone(
  userId: string,
  projectId: string,
  data: CreateMilestoneInput
) {
  return prisma.$transaction(async (tx) => {
    const projectExists = await tx.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!projectExists) return null;

    const milestone = await tx.milestone.create({
      data: { ...data, projectId, userId },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId,
        userId,
        action: ProjectActivityType.MILESTONE_ADDED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(projectId, tx);

    return milestone;
  });
}
```

### `completeMilestone(userId, milestoneId)`

Sets `completedAt` to now. If already completed, returns the milestone unchanged.
Logs `MILESTONE_COMPLETED`. Recalculates progress.

```ts
export async function completeMilestone(userId: string, milestoneId: string) {
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.findFirst({
      where: { id: milestoneId, userId },
      select: { id: true, projectId: true, title: true, completedAt: true },
    });

    if (!milestone) return null;
    if (milestone.completedAt) return milestone; // already completed, no-op

    const updatedMilestone = await tx.milestone.update({
      where: { id: milestoneId },
      data: { completedAt: new Date() },
      select: defaultSelect,
    });

    await tx.projectActivityLog.create({
      data: {
        projectId: milestone.projectId,
        userId,
        action: ProjectActivityType.MILESTONE_COMPLETED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(milestone.projectId, tx);

    return updatedMilestone;
  });
}
```

### `deleteMilestone(userId, milestoneId)`

Logs `MILESTONE_DELETED`. Recalculates progress.

```ts
export async function deleteMilestone(userId: string, milestoneId: string) {
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.milestone.findFirst({
      where: { id: milestoneId, userId },
      select: { id: true, projectId: true, title: true },
    });

    if (!milestone) return null;

    await tx.milestone.delete({ where: { id: milestoneId } });

    await tx.projectActivityLog.create({
      data: {
        projectId: milestone.projectId,
        userId,
        action: ProjectActivityType.MILESTONE_DELETED,
        metadata: { milestoneTitle: milestone.title },
      },
    });

    await recalculateProgress(milestone.projectId, tx);

    return { success: true };
  });
}
```

### `reorderMilestones(userId, projectId, input)`

Updates the `order` field for each milestone in a single transaction.
Validates all IDs belong to the user + project before updating.

```ts
export async function reorderMilestones(
  userId: string,
  projectId: string,
  input: ReorderMilestonesInput
) {
  const { orderedIds } = input;

  return prisma.$transaction(async (tx) => {
    const existingMilestones = await tx.milestone.findMany({
      where: { projectId, userId },
      select: { id: true },
    });

    const existingIds = new Set(existingMilestones.map((m) => m.id));
    const allValid = orderedIds.every((id) => existingIds.has(id));

    if (!allValid) return null;

    await Promise.all(
      orderedIds.map((id, index) =>
        tx.milestone.update({
          where: { id },
          data: { order: index },
        })
      )
    );

    return tx.milestone.findMany({
      where: { projectId, userId },
      orderBy: { order: "asc" },
      select: defaultSelect,
    });
  });
}
```

### `recalculateProgress` helper (copy from project service)

This private helper is duplicated in `milestone.ts` because milestone mutations
need it too. Keep it unexported.

```ts
async function recalculateProgress(
  projectId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const [total, completed] = await Promise.all([
    tx.milestone.count({ where: { projectId } }),
    tx.milestone.count({ where: { projectId, completedAt: { not: null } } }),
  ]);

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  await tx.project.update({
    where: { id: projectId },
    data: { progress },
  });

  return progress;
}
```

---

## Behaviour Reference

### Progress calculation

```
progress = 0                          if no milestones exist
progress = round(completed / total * 100)  otherwise
```

Stored denormalized on `Project.progress` for fast reads without joins.
Updated atomically inside every milestone mutation transaction.

### Activity log `metadata` shapes

| `action`              | `metadata` shape                             |
| --------------------- | -------------------------------------------- |
| `PROJECT_CREATED`     | `{ name: string }`                           |
| `PROJECT_UPDATED`     | `{ fields: string[] }`                       |
| `STATUS_CHANGED`      | `{ from: ProjectStatus, to: ProjectStatus }` |
| `MILESTONE_ADDED`     | `{ milestoneTitle: string }`                 |
| `MILESTONE_COMPLETED` | `{ milestoneTitle: string }`                 |
| `MILESTONE_DELETED`   | `{ milestoneTitle: string }`                 |

### Edge cases handled

| Case                                  | Behaviour                                                               |
| ------------------------------------- | ----------------------------------------------------------------------- |
| Project not found on milestone create | Return `null`, no activity logged                                       |
| Milestone already completed           | `completeMilestone` returns existing record unchanged, no duplicate log |
| `reorderMilestones` with foreign IDs  | Returns `null` after validation, no updates applied                     |
| No milestones on project              | `progress` stays `0`, never NaN                                         |
| Project deleted                       | Cascades delete all milestones and activity logs (defined in schema)    |

---

## Rules Checklist (verify before finishing)

- [ ] No `any` types in any new or modified file
- [ ] All imports use `@/` prefix
- [ ] `prisma` singleton imported from `@/lib/db/prisma` everywhere
- [ ] No Prisma direct calls from within a component or API route (these are service-layer only)
- [ ] Every mutation that writes an activity log does so inside a `$transaction`
- [ ] `recalculateProgress` is NOT exported from either service file
- [ ] `completeMilestone` handles the already-completed no-op case
- [ ] `reorderMilestones` validates all IDs belong to the user before updating
- [ ] `getProjectById` includes milestones ordered by `order ASC` and activity logs ordered by `createdAt DESC`
- [ ] All Zod schemas export both the schema and the inferred type
- [ ] No UI code, no components, no pages created
- [ ] `npx prisma generate` has been run after schema changes
- [ ] `CLAUDE.md` Session Notes updated with a dated summary

---

## Expected file changes summary

| File                           | Action                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------ |
| `prisma/schema.prisma`         | **Modify** — extend Project, add Milestone, ProjectActivityLog, ProjectActivityType, extend User |
| `lib/validations/project.ts`   | **Create**                                                                                       |
| `lib/validations/milestone.ts` | **Create**                                                                                       |
| `lib/services/project.ts`      | **Create**                                                                                       |
| `lib/services/milestone.ts`    | **Create**                                                                                       |
| `CLAUDE.md`                    | **Modify** — append to Session Notes                                                             |

No other files should be touched.
