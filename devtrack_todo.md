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
- [x] Add a date range filter to the logs list (e.g., last 7 days / 30 days / all)
- [x] Cap logs list to 10 entries with a "Load more" control

### DSA Problems — Edit Support

- [x] Add edit button + pre-filled form to `DsaProblemList.tsx`
- [x] Add `updateDsaProblem` to `lib/services/dsa-problem.ts`
- [x] Add `notes` field to `DSAProblem` for review notes

### Analytics — Chart Improvements

- [x] Replace `Week 1 … Week N` labels with actual date ranges
- [x] Add difficulty breakdown bar chart per week
- [x] Add daily log activity heatmap (GitHub-style) for last 90 days

### Navigation & UX

- [x] Add active state highlight to sidebar links
- [x] Add mobile-responsive sidebar (collapsible drawer)
- [ ] Add loading skeletons to dashboard, logs, and problems pages

---

## Low

### Insights Enhancements

- [ ] Add weekly summary email/generation
- [x] Add productivity trends (compare current week vs previous)
- [x] Add peak productivity time analysis

### Code Quality

- [x] Extract `formatLogDate` from `dashboard/page.tsx` into `lib/utils.ts`
- [x] Add `error.tsx` boundary pages for dashboard routes
- [x] Add `not-found.tsx` for the dashboard group
- [ ] Audit all Prisma queries for missing `userId` scoping

### Auth Improvements

- [ ] Add password reset flow
- [ ] Add email confirmation handling page
- [x] Add `AuthForm` loading state disable on submit

### Developer Experience

- [ ] Add `prisma migrate dev` to the project README quickstart
- [x] Add `.env.example` values documentation
- [x] Set up ESLint rule to flag `any` usage

---

## Code Review — Issues Found (2026-03-23)

> Full audit of all local + today's commit changes. Fix these before shipping.

### Design Rule Violations (must fix)

- [x] **`ProjectList.tsx:36-39`** — Hardcoded colors in `statusConfig`: `bg-blue-500`, `bg-green-500`, `bg-amber-500`. Replaced with semantic classes via shared `PROJECT_STATUS_CONFIG`.
- [x] **`projects/[id]/page.tsx:13-15`** — Removed duplicated `statusConfig`, now using shared `PROJECT_STATUS_CONFIG` from `lib/constants/project.ts`.
- [x] **`MilestoneList.tsx:121`** — Replaced inline `style={{ width: ... }}` with `<Progress>` component.

### Coding Rule Violations

- [x] **`lib/services/insights.ts:76-106`** — Deduplicated streak calculation by importing `calculateStreakFromDates` from `@/lib/services/streak.ts`.
- [x] **`lib/services/dashboard.ts:126-127`** — Fixed timezone bug in `getConsistencyScore` by using UTC methods (`setUTCDate`, `Date.UTC`).
- [x] **`lib/utils/formatters.ts:3-4`** — Already using UTC methods for `formatLogDate`

### API Rule Violations

- [x] **`app/api/dsa-problem/patterns/route.ts:21`** — Added Zod validation with `z.coerce.number().int().positive().optional()` for limit param.

### Component Rule Violations

- [x] **`MilestoneList.tsx` — Silent error swallowing** — Added error state with UI feedback for `handleAdd`, `handleToggle`, and `handleDelete`.
- [x] **`MilestoneList.tsx` — Missing aria-labels** — Added `aria-label={\`Complete ${milestone.title}\`}`and`aria-label={\`Delete ${milestone.title}\`}`.

### Architecture / Structure Issues

- [x] **Duplicated `statusConfig`** — Extracted to shared constant in `lib/constants/project.ts` and imported in both `ProjectList.tsx` and `projects/[id]/page.tsx`.
- [x] **Duplicate route handler** — Removed POST handler from `[milestoneId]/route.ts`, keeping only DELETE.
- [x] **Dashboard DB query fan-out** — Optimized by passing pre-fetched context to `generateInsights`, reducing queries from 16+ to ~12.

---

## Recently Completed (2026-03-23)

1. **Streak System** — Full implementation with proper consecutive day handling
2. **Pattern Analysis** — Strong/weak pattern identification with dashboard display
3. **Insights Engine** — 9 rule types with priority-based display
4. **Project Tracker** — Milestones, progress tracking, activity logs
5. **Dashboard UX** — Simplified stats, better spacing, icon-enhanced empty states

---

## Project Audit & Refactoring (10/10 Standard)

### Phase 1: Infrastructure & Utils

- [ ] **Centralize Date Utilities** — Create `@/lib/utils/date.ts` to handle all UTC midnight normalization, ISO slicing, and formatting. Replace all scattered `new Date(Date.UTC(...))` and `toISOString().slice(0,10)` calls.
- [x] **Unified Zod Schemas** — Align `dailyLogFormSchema` and `dailyLogSchema`. Use `z.preprocess` or similar to handle date coercion consistently between forms and API.
- [ ] **Centralized Serialization** — Move `serializeLog` from `logs/page.tsx` and other scattered places to a dedicated `@/lib/utils/serialization.ts` or add to service layer.
- [x] **Remove `any` Usage** — Audit all components (starting with `DailyLogForm.tsx`) and routes to replace `any` with proper types/interfaces.

### Phase 2: Service Layer & API

- [ ] **Standardize Pagination** — Create a shared utility for parsing `limit` and `offset` from `searchParams` and generating the count/metadata response.
- [ ] **Deduplicate Logic** — Remove redundant validation checks in `POST` handlers that are already covered by `handleApiError`.
- [ ] **Centralize Error Logging** — Use a unified utility for server-side error logging instead of scattered `console.error`.

### Phase 3: Component Architecture

- [ ] **Refactor `DailyLogForm`** — Clean up the split logic between `useDailyLogForm` hook and `useForm`. Ensure all form values are type-safe.
- [ ] **File Line Audit** — Split overly large components (>200 lines) into smaller sub-components (e.g., `TopicSelector`, `LogHeader`).
- [ ] **Naming Convention Sync** — Ensure all variables and props follow a consistent pattern (e.g., `isEditing` vs `editing`, `handleX` for events).
- [ ] **Centralize Layout Constants** — Move magic numbers (e.g., `120` days in streaks, `86400000` ms) and business limits (`NOTES_MAX`, `TOPICS_MAX`) to `@/lib/constants`.
- [ ] **Logic Unification in Services** — Refactor `insights.ts` and `streak.ts` to deduplicate logic (e.g., `buildInsightContext` vs `buildInsightContextWithPartialData`). Use optional parameters and shared helper functions.
- [ ] **API Wrapper Centralization** — Move all `fetch` calls from hooks (like `submitDailyLog` in `useDailyLogForm.ts`) to a dedicated `@/lib/api` directory with consistent error handling and type-safe payloads.
