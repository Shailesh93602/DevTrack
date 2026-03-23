# DevTrack — Todo

> Sections ordered by priority. Tasks within each section ordered by dependency.
> Last updated: 2026-03-23

---

## Critical

- [x] **Fix type-unsafe casts in `lib/services/dashboard.ts`** — No explicit casts found; Prisma types properly inferred
- [x] **Fix timezone bug in `getDashboardStats`** — Changed to use `Date.UTC()` for @db.Date column comparison
- [x] **Add `prisma generate` step to dev setup docs** — schema changes won't reflect without it; at minimum document in README

---

## High

### Streak System ✓ Complete

- [x] Implement streak calculation service (`lib/services/streak.ts`)
- [x] Calculate current streak (consecutive days with DailyLog)
- [x] Calculate longest streak
- [x] Handle missed days (streak breaks on gap > 1 day)
- [x] UTC-safe date handling
- [x] Persist longest streak to User table
- [x] Add streak display to dashboard

### Pattern Analysis ✓ Complete

- [x] Create pattern analysis service (`lib/services/dsa-problem.ts`)
- [x] Group problems by pattern with counts
- [x] Calculate percentage distribution
- [x] Identify strongest pattern (most practiced)
- [x] Identify weakest pattern (least practiced)
- [x] Add API route `/api/dsa-problem/patterns`
- [x] Display patterns on dashboard

### Insights System ✓ Complete

- [x] Design rule-based insight engine (`lib/services/insights.ts`)
- [x] Implement strength insights ("You are strong in X")
- [x] Implement weakness insights ("Practice X more")
- [x] Implement activity insights ("Your activity dropped")
- [x] Implement milestone insights (streak achievements)
- [x] Add `InsightsList` component to dashboard
- [x] Configurable thresholds for all rules

### Project Tracker ✓ Complete

- [x] Project CRUD with activity logs
- [x] Milestone management (create, complete, delete, reorder)
- [x] Auto-calculate progress from milestone completion %
- [x] Project detail page with milestones
- [x] Activity log history per project
- [x] Tech stack tags
- [x] Status workflow (In Progress, Completed, On Hold)

### UX Improvements ✓ Complete

- [x] Simplify dashboard stats (4 key metrics vs 7)
- [x] Improve spacing and visual hierarchy
- [x] Add icons to empty states
- [x] Extract conditional render to PatternCard component
- [x] Consistent section headers

---

## Medium

### Daily Logs — Improvements

- [x] Add edit support to `DailyLogList.tsx`
- [x] Add `problemsSolved` to the log list row display
- [ ] Add a date range filter to the logs list (e.g., last 7 days / 30 days / all)
- [ ] Cap logs list to 10 entries with a "Load more" control

### DSA Problems — Edit Support

- [x] Add edit button + pre-filled form to `DsaProblemList.tsx`
- [x] Add `updateDsaProblem` to `lib/services/dsa-problem.ts`
- [ ] Add `notes` field to `DSAProblem` for review notes

### Analytics — Chart Improvements

- [ ] Replace `Week 1 … Week N` labels with actual date ranges
- [ ] Add difficulty breakdown bar chart per week
- [ ] Add daily log activity heatmap (GitHub-style) for last 90 days

### Navigation & UX

- [x] Add active state highlight to sidebar links
- [ ] Add mobile-responsive sidebar (collapsible drawer)
- [ ] Add loading skeletons to dashboard, logs, and problems pages

---

## Low

### Insights Enhancements

- [ ] Add weekly summary email/generation
- [ ] Add productivity trends (compare current week vs previous)
- [ ] Add peak productivity time analysis

### Code Quality

- [ ] Extract `formatLogDate` from `dashboard/page.tsx` into `lib/utils.ts`
- [ ] Add `error.tsx` boundary pages for dashboard routes
- [ ] Add `not-found.tsx` for the dashboard group
- [ ] Audit all Prisma queries for missing `userId` scoping

### Auth Improvements

- [ ] Add password reset flow
- [ ] Add email confirmation handling page
- [ ] Add `AuthForm` loading state disable on submit

### Developer Experience

- [ ] Add `prisma migrate dev` to the project README quickstart
- [ ] Add `.env.example` values documentation
- [ ] Set up ESLint rule to flag `any` usage

---

## Code Review — Issues Found (2026-03-23)

> Full audit of all local + today's commit changes. Fix these before shipping.

### Design Rule Violations (must fix)

- [ ] **`ProjectList.tsx:36-39`** — Hardcoded colors in `statusConfig`: `bg-blue-500`, `bg-green-500`, `bg-amber-500`. Replace with semantic CSS-variable-mapped classes or data attributes (e.g. use `text-primary`, `text-destructive`, `text-muted-foreground` or a variant prop pattern). No raw Tailwind color classes allowed per design rules.
- [ ] **`projects/[id]/page.tsx:13-15`** — Identical `statusConfig` with same hardcoded colors duplicated from `ProjectList.tsx`. Needs to be removed AND deduplicated (see architecture issue below).
- [ ] **`MilestoneList.tsx:121`** — Inline `style={{ width: \`${progress}%\` }}` violates the no-inline-styles rule. The `<Progress>` component (already installed and used in `ProjectList.tsx`) should be used here instead.

### Coding Rule Violations

- [ ] **`lib/services/insights.ts:76-106`** — Streak calculation is re-implemented from scratch instead of calling `calculateStreakFromDates` from `@/lib/services/streak.ts`. This is a DRY violation and will diverge if streak logic changes. Import and reuse the existing function.
- [ ] **`lib/services/dashboard.ts:126-127`** — `getConsistencyScore` uses `setHours(0, 0, 0, 0)` (local time) for week bucketing. Same class of timezone bug previously fixed in `getDashboardStats`. Scores near week boundaries will be wrong in non-UTC environments. Use UTC methods consistently.
- [ ] **`lib/utils/formatters.ts:3-4`** — `formatLogDate` uses `setHours(0, 0, 0, 0)` (local time) to compare dates stored as `@db.Date` (UTC). Will misclassify "Today"/"Yesterday" near midnight in non-UTC timezones. Use UTC methods.

### API Rule Violations

- [ ] **`app/api/dsa-problem/patterns/route.ts:21`** — `limit` query param is parsed with `parseInt` but not validated with a Zod schema. `parseInt("abc", 10)` returns `NaN`, which is passed directly to `analyzePatterns`. Add Zod validation (`z.coerce.number().int().positive().optional()`).

### Component Rule Violations

- [ ] **`MilestoneList.tsx` — Silent error swallowing** — `handleAdd`, `handleToggle`, and `handleDelete` catch errors with only `console.error`. Users get no feedback when operations fail. Add per-operation error state and surface it in the UI (same pattern as `ProjectList.tsx` which shows `deleteError`).
- [ ] **`MilestoneList.tsx` — Missing aria-labels** — The `Checkbox` for each milestone has no `aria-label` (screen readers can't identify what is being checked). The delete `Button` has no `aria-label` either. Add descriptive labels: `aria-label={\`Complete ${milestone.title}\`}` and `aria-label={\`Delete ${milestone.title}\`}`.

### Architecture / Structure Issues

- [ ] **Duplicated `statusConfig`** — The status label/color map is defined identically in both `ProjectList.tsx` and `projects/[id]/page.tsx`. Extract to a shared constant in `lib/utils/project.ts` or `types/project.ts` and import from both. Also resolves the hardcoded color issues above in one place.
- [ ] **Duplicate route handler** — `app/api/project/[id]/milestones/[milestoneId]/route.ts` contains a POST handler that duplicates `complete/route.ts` and has a wrong path comment (`// POST .../complete`). The POST handler in `[milestoneId]/route.ts` is dead code (the component calls the `/complete` sub-route). Remove the POST handler and keep only DELETE in `[milestoneId]/route.ts`.
- [ ] **Dashboard DB query fan-out** — `getDashboardStats` fires 12 parallel queries, and `generateInsights` internally fires 4 more (logs, problems, last log, user). That's 16+ DB hits per dashboard render. `generateInsights` re-fetches data already retrieved by `getDashboardStats`. Consider passing pre-fetched context to `generateInsights` instead of letting it re-query.

---

## Recently Completed (2026-03-23)

1. **Streak System** — Full implementation with proper consecutive day handling
2. **Pattern Analysis** — Strong/weak pattern identification with dashboard display
3. **Insights Engine** — 9 rule types with priority-based display
4. **Project Tracker** — Milestones, progress tracking, activity logs
5. **Dashboard UX** — Simplified stats, better spacing, icon-enhanced empty states
