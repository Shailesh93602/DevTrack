# DevTrack – CLAUDE.md

> Claude must read this file before starting any work session.
> Claude must update the "Session Notes" section after each session.

---

## Project Overview

**DevTrack** is a developer progress tracking dashboard. It allows developers to log daily coding activity, track DSA problems solved, manage side projects, and visualize progress over time.

**Stage:** Foundation / Setup (no full features yet)

**Live URL:** Not deployed yet

---

## Tech Stack

| Layer      | Technology                    |
| ---------- | ----------------------------- |
| Framework  | Next.js (App Router)          |
| Language   | TypeScript (strict)           |
| Styling    | Tailwind CSS                  |
| Components | Shadcn UI (Radix)             |
| ORM        | Prisma                        |
| Database   | PostgreSQL (via Supabase)     |
| Auth       | Supabase Auth + @supabase/ssr |
| Validation | Zod                           |
| Forms      | React Hook Form               |
| Charts     | Recharts                      |
| Icons      | Lucide React                  |

---

## Folder Structure

```
/app
  /(auth)          # Login, signup pages (no layout chrome)
  /(dashboard)     # Protected dashboard pages
  /api             # API route handlers

/components
  /ui              # Shadcn UI primitives (do not modify manually)
  /shared          # Reusable cross-feature components
  /dashboard       # Dashboard-specific components (sidebar, header, etc.)

/lib
  /auth            # Supabase client (browser + server), server actions
  /db              # Prisma singleton
  /utils           # Utility functions (cn, etc.)

/prisma
  schema.prisma    # Database schema

/types
  index.ts         # Shared TypeScript types
```

---

## Naming Conventions

> Consistent naming is non-negotiable. Vague names are a bug.

- **Variables & functions** — `camelCase` (e.g. `userId`, `fetchProblems`, `isLoading`)
- **Components** — `PascalCase` (e.g. `StatsCard`, `AuthForm`, `DashboardLayout`)
- **Types & interfaces** — `PascalCase` (e.g. `StatsCardProps`, `AuthFormState`)
- **Files** — `kebab-case` for non-component files (e.g. `supabase-server.ts`); `PascalCase` only for React component files (e.g. `StatsCard.tsx`) — **exception:** Next.js special files (`page.tsx`, `layout.tsx`, `middleware.ts`) stay lowercase
- **Forbidden names** — never use vague names like `data`, `item`, `obj`, `val`, `temp`, `thing`, `foo`; always name after the domain concept (e.g. `problem`, `project`, `logEntry`)
- **Booleans** — prefix with `is`, `has`, or `can` (e.g. `isLoading`, `hasError`, `canSubmit`)
- **Event handlers** — prefix with `handle` (e.g. `handleSubmit`, `handleDelete`)
- **Server actions** — named as verbs describing the operation (e.g. `createProblem`, `updateProject`, `deleteLog`)

---

## Coding Rules

> Violations of these rules must be fixed before any feature is considered complete.

- **TypeScript strict mode** — no `any`, no type suppression, no `@ts-ignore`
- **File size** — target ≤200 lines per file; split if exceeded. Exceptions: config/generated files up to 500 lines; `schema.prisma` and `globals.css` up to 1000 lines
- **Separation of concerns** — server actions and data-fetching logic live in `lib/`, never inside components
- **No dummy data or mock logic** in components — use placeholder values only during development
- **Absolute imports only** via `@/` — never use relative `../../` paths
- **`cn()` utility** — always import from `@/lib/utils`; never from `@/lib/utils/cn`
- **Prisma client** is a singleton via `lib/db/prisma.ts` — never instantiate `PrismaClient` elsewhere
- **Supabase client**: use `lib/auth/supabase.ts` (browser) and `lib/auth/supabase-server.ts` (server) — never create ad-hoc clients
- Always run `prisma generate` after any change to `schema.prisma`
- **Prisma 7:** datasource URL lives in `prisma.config.ts` (not in `schema.prisma`) — this is a Prisma 7 breaking change

---

## API Rules

> All data flow through the API layer must be validated and isolated.

- **Zod validation always** — every server action and API route must validate its inputs with a Zod schema before any processing; never trust raw input
- **No direct DB calls in UI** — components must never import from `@/lib/db` or call `prisma.*` directly; all DB access goes through server actions in `lib/`
- **No direct DB calls in API routes** — API route handlers call service functions in `lib/`, not Prisma directly; keeps routes thin
- **Return typed responses** — server actions return a typed result object (e.g. `{ data, error }`), never untyped plain objects
- **Error handling at the boundary** — catch and transform errors in server actions; components receive structured error states, not raw exceptions

---

## Design Rules

> Hardcoded colors, gradients, and dark: overrides are banned. The design system is CSS-variable-based.

- **No hardcoded colors** — never use hex, rgb, hsl, or named colors (e.g. `text-[#333]`, `bg-red-500`) directly in components; all colors must come from CSS variables mapped via Tailwind
- **No gradients** — `bg-gradient-*`, `from-*`, `to-*`, `via-*` are forbidden
- **No manual `dark:` usage** — dark mode is handled entirely by CSS variables in `globals.css`; never add `dark:` prefixed classes in component files
- **Tailwind variables only** — use semantic utility classes that map to CSS vars (e.g. `bg-background`, `text-foreground`, `border-border`)
- **No shadows** — use `shadow-none`; avoid `shadow-sm`, `shadow-md`, etc.
- **SaaS style** — inspired by Linear, Notion, Stripe; clean, minimal, neutral
- **Spacing:** consistent 4/6/8 units via Tailwind
- **Interactive states:** `hover:bg-accent` for hover, `bg-muted` for subtle backgrounds

---

## Component Rules

> Components must be self-contained, reusable, and free of layout side effects.

- **No business logic in UI** — components render UI only; data fetching, mutations, transformations, and side effects belong in `lib/` server actions or custom hooks
- **No direct DB or API calls** — a component must never import Prisma, call `fetch`, or invoke server actions outside of a form action or hook; pass data in via props or read from a server component parent
- **Reusable components only** — if a component is used in more than one place, it lives in `components/shared/`; single-use components live co-located with their feature
- **No inline styles** — never use the `style={{}}` prop; all styling must go through Tailwind utility classes
- **No hardcoded layout values** — do not hardcode pixel widths, heights, or margins; use Tailwind spacing scale
- **Props over internal state** — prefer controlled components that accept props; keep internal state minimal
- **One responsibility per component** — a component either renders UI or orchestrates logic, not both
- **Accessibility** — all interactive elements must have accessible labels (`aria-label`, `aria-describedby`, or visible text)

---

## AI Rules

> These rules govern Claude's behavior in every session. Violating them is not permitted.

- **Always read CLAUDE.md first** — before writing any code, Claude must read this file in full to understand current rules, structure, and session context
- **Always update CLAUDE.md last** — after completing any work session, Claude must update the "Session Notes" section with a dated summary of what was done and what comes next
- **Never skip Session Notes** — if a session produced no code changes, Claude must still log what was discussed or decided
- **Enforce all rules, always** — Claude must apply Coding Rules, Design Rules, and Component Rules to every file it touches, including files it did not create
- **Flag rule violations proactively** — if existing code violates a rule (hardcoded color, inline style, missing Zod validation, etc.), Claude must flag it even if not asked
- **Do not add features that were not explicitly requested** — only implement what was explicitly asked; no "helpful extras", no speculative abstractions
- **Do not modify Shadcn UI primitives** — files in `components/ui/` are generated; never edit them manually

---

## Auth Flow

1. Unauthenticated users hitting `/dashboard/*` → redirected to `/login` (middleware)
2. Authenticated users hitting `/login` → redirected to `/dashboard` (middleware)
3. Session cookies managed by `@supabase/ssr` via middleware
4. Dashboard layout (`app/(dashboard)/dashboard/layout.tsx`) also validates auth server-side

---

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

See `.env.example` for reference.

---

## Session Notes

**2026-03-22** — Design system implementation verified and complete:

- CSS variables for light/dark themes configured in `globals.css` using oklch colors
- Tailwind configured via `@theme inline` mapping CSS vars → utilities
- Base typography defined (h1-h6 with proper weights, line heights, letter spacing)
- UI components use CSS variables (no hardcoded colors, no gradients):
  - `button.tsx`: default, outline, secondary, ghost, destructive, link variants
  - `card.tsx`: with header, title, description, content, footer, action slots
  - `input.tsx`: text input with focus states and validation styling
  - `badge.tsx`: matching button variants for labels
- Clean SaaS aesthetic: neutral palette (black/white/gray), subtle borders, no shadows

**Next:** Dashboard feature implementation

**2026-03-22** — CLAUDE.md rules hardened:

- Coding Rules: added hard limits on `any`, `@ts-ignore`, file size, and singleton enforcement
- Design Rules: explicit bans on hardcoded colors, gradients, and manual `dark:` usage; CSS-variable-only policy enforced
- Component Rules: new section added — no inline styles, no hardcoded layout values, one responsibility per component, accessibility required
- AI Rules: new section added — Claude must always read CLAUDE.md first, update Session Notes last, flag violations proactively, and never touch `components/ui/` manually

**Next:** Dashboard feature implementation

**2026-03-22** — Project structure audit and cleanup:

- **Design rule violations fixed:** All hardcoded colors (`bg-white`, `bg-gray-50`, `text-gray-900`, `text-gray-500`, `text-gray-400`, `border-gray-100`) replaced with semantic CSS variable utilities (`bg-background`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `hover:bg-accent`, `hover:text-accent-foreground`) across:
  - `app/(auth)/login/page.tsx`
  - `app/(auth)/signup/page.tsx`
  - `app/(dashboard)/dashboard/layout.tsx`
  - `app/(dashboard)/dashboard/page.tsx`
  - `components/dashboard/sidebar.tsx`
  - `components/dashboard/header.tsx`
  - `components/dashboard/stats-card.tsx`
- **Duplicate utility resolved:** `lib/utils/cn.ts` was a copy of `lib/utils.ts`; converted to a re-export so `@/lib/utils` is the single canonical import point (matches shadcn alias)
- **Metadata updated:** `app/layout.tsx` title/description changed from Create Next App placeholder to "DevTrack"
- **Canonical import rule added to Coding Rules:** all `cn()` imports must use `@/lib/utils`, never `@/lib/utils/cn`

**Next:** Dashboard feature implementation (DSA problems, projects, daily logs, settings pages)

**2026-03-22** — Rules overhauled to production standard:

- **Naming Conventions** — new section added: camelCase vars, PascalCase components/types, kebab-case non-component files; booleans prefixed `is/has/can`; handlers prefixed `handle`; server actions named as verbs; vague names (`data`, `item`, `obj`) explicitly forbidden
- **Coding Rules** — file size updated from 120-line hard cap to tiered limit: ≤200 target, ≤500 for config/generated files, ≤1000 for `schema.prisma` and `globals.css`
- **API Rules** — new section: Zod validation required on all server actions/routes; no direct DB calls in UI or route handlers; typed return shapes; errors caught and transformed at the boundary
- **Component Rules** — sharpened: explicit ban on business logic and DB/API calls in components; rule order reorganized for clarity

**Next:** Dashboard feature implementation (DSA problems, projects, daily logs, settings pages)

**2026-03-22** — Prisma schema refactored for DevTrack MVP:

- `DailyLog` — added `topics String[]` (native PostgreSQL array); added `@db.Date` to store date-only values without a time component
- `DSAProblem` — added `platform String` (kept as `String`, not enum, for flexibility as platforms change); added `updatedAt` for re-review tracking
- Indexes added: `DSAProblem @@index([userId, difficulty])` and `@@index([userId, solvedAt])`; `Project @@index([userId, status])` — covers the most common filter/sort patterns
- `DailyLog @@unique([userId, date])` retained — enforces one log per day per user and doubles as the primary lookup index
- `platform` is `String` not enum — avoids migration churn when new platforms are added
- All cascades, enums (`Difficulty`, `ProjectStatus`), and audit fields retained

**Next:** Run `prisma generate` + `prisma migrate dev`, then begin dashboard feature implementation

**2026-03-22** — DailyLog UI built and backend bugs fixed:

- **Bug fix — `lib/services/daily-log.ts`:** `getDailyLogByDate` used `setHours(0,0,0,0)` (local time) for a `@db.Date` column; fixed to use `Date.UTC` exact equality — timezone-safe in all server environments
- **Bug fix — `lib/validations/daily-log.ts`:** Topics lacked `.trim()`, per-topic `.max(50)`, and array `.max(20)`; notes lacked `.trim()` — all fixed
- **New — `components/ui/textarea.tsx`:** Shadcn-style textarea primitive matching `input.tsx` styling; CSS-variable-only, no `dark:` overrides
- **New — `components/dashboard/DailyLogForm.tsx`:** Create/edit form with React Hook Form + Zod v4; tag-style topic input (add on Enter or button, remove with X); notes char counter (turns destructive at 90%); proper `aria-invalid`, `aria-describedby`, `role="alert"` on errors; create vs edit detected from `log` prop; calls `router.refresh()` on success
- **New — `components/dashboard/DailyLogList.tsx`:** History list with date formatting (Today/Yesterday/date); topic badges; 2-step delete confirmation (click → confirm/cancel) to prevent accidental deletes; per-item error surfaces; empty state
- **New — `app/(dashboard)/dashboard/logs/page.tsx`:** Server component; fetches logs via service (not Prisma directly); serializes `Date → string` before passing to client components; splits logs into today vs history; renders form + list in Card layout

**Next:** DSA Problems UI, Projects UI, Settings page

**2026-03-22** — Auth/dashboard flow fixed and Playwright tests reviewed:

- **Root cause fixed — database error after login:** `DATABASE_URL` in `.env.local` used pgbouncer (port 6543 with `?pgbouncer=true`). The `PrismaPg` adapter hangs on DDL and causes "table does not exist" at runtime. Fixed by switching to session-mode URL (port 5432, no pgbouncer param) in `.env.local`.
- **`prisma.config.ts` updated:** CLI operations now prefer `DIRECT_URL` env var (falls back to `DATABASE_URL`) so `prisma db push` / `prisma generate` don't hang.
- **Design violations fixed:**
  - `auth-form.tsx`: replaced `text-red-600`, `bg-red-50`, `dark:bg-red-950/50`, `dark:text-red-400` with `text-destructive` / `bg-destructive/10`
  - `login/page.tsx`: removed forbidden gradient and shadow; uses `bg-background` / `shadow-none`
  - `signup/page.tsx`: changed h1 from "DevTrack" → "Create account" (UX + test selector)
- **TypeScript fixed — `lib/services/dashboard.ts`:** Removed `(log: unknown)` cast; Prisma infers types correctly.
- **Playwright tests:** 10/11 pass. Test [06] (signup → dashboard) blocked by Supabase "Email not confirmed" on the test user.
- **`e2e/global-setup.ts` added:** Deletes all `devtrack.e2e.*@gmail.com` test users before each run when `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`.
- **Blocker for test [06]:** Fix by either: (a) Supabase Dashboard → Authentication → Settings → disable "Enable email confirmations", or (b) add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`.

**Next:** Resolve Supabase email confirmation setting for tests, then DSA Problems UI, Projects UI, Settings page

---
