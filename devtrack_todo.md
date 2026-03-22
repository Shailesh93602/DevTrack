# DevTrack — Todo

> Sections ordered by priority. Tasks within each section ordered by dependency.

---

## Critical

- [ ] **Fix type-unsafe casts in `lib/services/dashboard.ts`** — `recentLogs` result uses `log as unknown` then re-casts to specific types (lines 40–45); replace with a typed Prisma `select` return and remove the casts
- [ ] **Fix timezone bug in `getDashboardStats`** — `today.setHours(0,0,0,0)` uses local server time for a `@db.Date` column; use `Date.UTC` to match the fix already applied in `getDailyLogByDate`
- [ ] **Add `prisma generate` step to dev setup docs** — schema changes won't reflect without it; at minimum document in README

---

## High

### Projects Feature (zero implementation exists)

- [ ] Add `lib/validations/project.ts` — Zod schema for create/update (name, description, status, repoUrl, liveUrl)
- [ ] Add `lib/services/project.ts` — `createProject`, `updateProject`, `deleteProject`, `getProjects`, `getProjectById`
- [ ] Add `components/dashboard/ProjectForm.tsx` — React Hook Form + Zod; create/edit mode from `project` prop
- [ ] Add `components/dashboard/ProjectList.tsx` — list with status badge, 2-step delete, empty state
- [ ] Add `app/(dashboard)/dashboard/projects/page.tsx` — server component; auth check; fetch + serialize; render form + list
- [ ] Add Projects link to `components/dashboard/sidebar.tsx`

### Settings Page

- [ ] Add `app/(dashboard)/dashboard/settings/page.tsx` — display email, sign-out button (call existing `signOut` action from `lib/auth/actions.ts`)
- [ ] Add Settings link to sidebar

### DSA Problems — Filtering & Pagination

- [ ] Add difficulty filter UI to `DsaProblemList.tsx` (Easy / Medium / Hard / All) — pass filter state up to page or handle client-side
- [ ] Add platform filter UI to `DsaProblemList.tsx`
- [ ] Replace hardcoded `limit: 50` in `problems/page.tsx` with load-more or paginated fetch via `getDsaProblems` offset param
- [ ] Add search/filter by title or pattern to `DsaProblemList.tsx`

### Dashboard Stats — Missing Metrics

- [ ] Add `totalProjects` and `activeProjects` count to `getDashboardStats` in `lib/services/dashboard.ts`
- [ ] Add corresponding `StatsCard` for projects on `dashboard/page.tsx`
- [ ] Add current streak (consecutive days with a daily log) to `getDashboardStats`
- [ ] Render streak stat in a `StatsCard`

---

## Medium

### Daily Logs — Improvements

- [ ] Add edit support to `DailyLogList.tsx` — "Edit" button per row that opens `DailyLogForm` pre-filled with that log's data
- [ ] Add `problemsSolved` to the log list row display in `DailyLogList.tsx` (currently only topics shown)
- [ ] Add a date range filter to the logs list (e.g., last 7 days / 30 days / all)
- [ ] Cap logs list to 10 entries with a "Load more" control; currently fetches all

### DSA Problems — Edit Support

- [ ] Add edit button + pre-filled form to `DsaProblemList.tsx` (same pattern as daily logs)
- [ ] Add `updateDsaProblem` to `lib/services/dsa-problem.ts` and expose it via an API route or server action
- [ ] Add `notes` field to `DSAProblem` in `schema.prisma` for review notes; run migration

### Analytics — Chart Improvements

- [ ] Replace `Week 1 … Week N` labels in `WeeklyProgressChart` with actual date ranges (e.g., `Mar 10–16`) using the `weekStart` date already computed in `getWeeklyProblemStats`
- [ ] Add a difficulty breakdown bar chart — Easy / Medium / Hard counts per week — using data from `getDsaProblems` grouped by difficulty
- [ ] Add a daily log activity heatmap (GitHub-style) for the last 90 days — requires a new `getDailyLogHeatmap` service function

### Navigation & UX

- [ ] Add active state highlight to sidebar links based on current pathname (`usePathname`)
- [ ] Add mobile-responsive sidebar (collapsible drawer) — currently sidebar is always visible
- [ ] Add loading skeletons to dashboard, logs, and problems pages using Next.js `loading.tsx`

---

## Low

### Code Quality

- [ ] Extract `formatLogDate` from `dashboard/page.tsx` into `lib/utils.ts` — it's duplicated in `DailyLogList.tsx`
- [ ] Add `error.tsx` boundary pages for dashboard routes — unhandled service errors currently crash the page with no UI
- [ ] Add `not-found.tsx` for the dashboard group
- [ ] Audit all Prisma queries for missing `userId` scoping — ensure no cross-user data leaks on any list or find query

### Auth Improvements

- [ ] Add password reset flow — "Forgot password?" link on login page → Supabase `resetPasswordForEmail`
- [ ] Add email confirmation handling — redirect after signup to a "check your email" page instead of straight to dashboard
- [ ] Add `AuthForm` loading state disable on submit to prevent double-submission (currently only `isLoading` text changes)

### Developer Experience

- [ ] Add `prisma migrate dev` to the project README quickstart
- [ ] Add `.env.example` values documentation (which Supabase project settings each var maps to)
- [ ] Set up ESLint rule to flag `any` usage — enforces the TypeScript strict-mode rule from CLAUDE.md
