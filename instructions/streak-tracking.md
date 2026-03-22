# Task: Implement Streak Tracking for DevTrack

## Context

DevTrack is a Next.js (App Router) + TypeScript + Prisma + Supabase project.
You are implementing a streak tracking feature based on existing `DailyLog` records.

Read the following files before writing any code:
- `CLAUDE.md` — project rules (naming, design, coding, API rules — all mandatory)
- `prisma/schema.prisma` — current DB schema
- `lib/services/daily-log.ts` — how existing services are structured
- `lib/services/dashboard.ts` — how dashboard stats services are structured
- `app/(dashboard)/dashboard/page.tsx` — how the dashboard page consumes services
- `components/dashboard/stats-card.tsx` — the StatsCard component you will reuse

---

## What You Are Building

Three things, in this order:

1. `lib/services/streak.ts` — pure calculation service
2. Wire streak data into `lib/services/dashboard.ts` — add to `getDashboardStats`
3. Display on `app/(dashboard)/dashboard/page.tsx` — two new `StatsCard` entries

No new pages. No new components. No schema changes.

---

## Step 1 — Create `lib/services/streak.ts`

Create the file `lib/services/streak.ts`.

### What it must export

```ts
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
}

export async function calculateStreaks(userId: string): Promise<StreakStats>
```

### Implementation rules

**Query:** Fetch only the `date` field from `DailyLog` for the given `userId`, ordered `ASC` by date.

```ts
const logs = await prisma.dailyLog.findMany({
  where: { userId },
  select: { date: true },
  orderBy: { date: "asc" },
});
```

**Import prisma** from `@/lib/db/prisma` (singleton — never instantiate PrismaClient directly).

**Early return:** If `logs.length === 0`, return `{ currentStreak: 0, longestStreak: 0 }`.

**Normalize dates to UTC date strings.** Each `date` from Prisma is a `Date` object representing UTC midnight (stored as `@db.Date`). Normalize using:

```ts
function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
```

Do NOT use `getFullYear()` / `getMonth()` / `getDate()` — those are local-time methods and will produce wrong results on servers not in UTC.

**Check if two date strings are consecutive days.** Use this helper:

```ts
function isNextDay(a: string, b: string): boolean {
  const dateA = new Date(a + "T00:00:00Z");
  const dateB = new Date(b + "T00:00:00Z");
  const diffMs = dateB.getTime() - dateA.getTime();
  return diffMs === 86_400_000; // exactly 1 day in ms
}
```

**Compute `longestStreak` — single forward pass:**

```
streak = 1, longest = 1
for i from 1 to dates.length - 1:
  if isNextDay(dates[i-1], dates[i]):
    streak++
    longest = max(longest, streak)
  else:
    streak = 1
return longest
```

**Compute `currentStreak` — backward pass from last date:**

```
todayStr     = toUtcDateString(new Date())
yesterdayStr = toUtcDateString(new Date(Date.now() - 86_400_000))
lastDate     = dates[dates.length - 1]

// Streak is alive if user logged today OR logged yesterday
// (they haven't broken it today yet)
if lastDate !== todayStr AND lastDate !== yesterdayStr:
  currentStreak = 0
else:
  currentStreak = 1
  for i from dates.length - 2 down to 0:
    if isNextDay(dates[i], dates[i+1]):
      currentStreak++
    else:
      break
```

### Rules to enforce in this file

- No `any` types
- No hardcoded colors or UI concerns — this is pure logic
- All imports use `@/` prefix
- Keep the file under 80 lines — these helpers are small

---

## Step 2 — Add streak data to `getDashboardStats`

Open `lib/services/dashboard.ts`.

**Import** `calculateStreaks` from `@/lib/services/streak`.

**Update the `DashboardStats` interface** to add:

```ts
currentStreak: number;
longestStreak: number;
```

**In `getDashboardStats`**, call `calculateStreaks(userId)` in the existing `Promise.all` alongside the other queries:

```ts
const [totalProblemsResult, todaysLog, recentLogsResult, streakStats] =
  await Promise.all([
    prisma.dSAProblem.count({ where: { userId } }),
    prisma.dailyLog.findFirst({ ... }),
    prisma.dailyLog.findMany({ ... }),
    calculateStreaks(userId),
  ]);
```

**Return** the new fields in the return object:

```ts
return {
  totalProblems: totalProblemsResult,
  todaysProblems: todaysLog?.problemsSolved ?? 0,
  recentLogs,
  currentStreak: streakStats.currentStreak,
  longestStreak: streakStats.longestStreak,
};
```

Do not change anything else in this file.

---

## Step 3 — Display streaks on the dashboard page

Open `app/(dashboard)/dashboard/page.tsx`.

The page already renders a grid of `StatsCard` components:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <StatsCard title="Total Problems" ... />
  <StatsCard title="Today's Progress" ... />
  <StatsCard title="Recent Logs" ... />
</div>
```

Add two more `StatsCard` entries **inside the same grid div**, after the existing three:

```tsx
<StatsCard
  title="Current Streak"
  value={stats.currentStreak}
  description={stats.currentStreak === 1 ? "day in a row" : "days in a row"}
/>
<StatsCard
  title="Longest Streak"
  value={stats.longestStreak}
  description={stats.longestStreak === 1 ? "day" : "days"}
/>
```

Update the grid class to accommodate 5 cards. Change:

```tsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
```

to:

```tsx
className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
```

No other changes to this file.

---

## Rules Checklist (verify before finishing)

Go through each item and confirm:

- [ ] `lib/services/streak.ts` uses `@/lib/db/prisma` import, not a new PrismaClient
- [ ] No `any` types anywhere in the new or modified code
- [ ] No hardcoded colors, no `dark:` classes, no gradients in any JSX
- [ ] No `style={{}}` props in any JSX
- [ ] No relative `../../` imports — all imports use `@/`
- [ ] `cn()` is not imported or used (no styling in service files)
- [ ] `toISOString().slice(0, 10)` is used for UTC date normalization, not local-time getters
- [ ] `isNextDay` uses `86_400_000` ms comparison, not string manipulation
- [ ] `calculateStreaks` is called in `Promise.all` — not awaited separately
- [ ] The `DashboardStats` interface is updated to include the two new fields
- [ ] Both `StatsCard` entries use `description` that is grammatically correct (singular/plural handled)
- [ ] No new files created other than `lib/services/streak.ts`
- [ ] No new components created
- [ ] No schema changes made
- [ ] `CLAUDE.md` Session Notes updated with a dated summary of what was done

---

## Expected file changes summary

| File | Action |
|---|---|
| `lib/services/streak.ts` | **Create** |
| `lib/services/dashboard.ts` | **Modify** — add import, extend interface, add to Promise.all, return new fields |
| `app/(dashboard)/dashboard/page.tsx` | **Modify** — add two StatsCards, update grid class |
| `CLAUDE.md` | **Modify** — append to Session Notes |

No other files should be touched.
