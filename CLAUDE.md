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

## Coding Rules

> Violations of these rules must be fixed before any feature is considered complete.

- **TypeScript strict mode** — no `any`, no type suppression, no `@ts-ignore`
- **File size hard limit** — split any file that exceeds 120 lines; no exceptions
- **Separation of concerns** — server actions and data-fetching logic live in `lib/`, never inside components
- **Server actions use Zod** for all input validation — no raw `req.body` or unvalidated inputs
- **No dummy data or mock logic** in components — use placeholder values only during development
- **Absolute imports only** via `@/` — never use relative `../../` paths
- **`cn()` utility** — always import from `@/lib/utils`; never from `@/lib/utils/cn`
- **Prisma client** is a singleton via `lib/db/prisma.ts` — never instantiate `PrismaClient` elsewhere
- **Supabase client**: use `lib/auth/supabase.ts` (browser) and `lib/auth/supabase-server.ts` (server) — never create ad-hoc clients
- Always run `prisma generate` after any change to `schema.prisma`
- **Prisma 7:** datasource URL lives in `prisma.config.ts` (not in `schema.prisma`) — this is a Prisma 7 breaking change

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

- **Reusable components only** — if a component is used in more than one place, it lives in `components/shared/`; single-use components live co-located with their feature
- **No inline styles** — never use the `style={{}}` prop; all styling must go through Tailwind utility classes
- **No hardcoded layout values** — do not hardcode pixel widths, heights, or margins; use Tailwind spacing scale
- **Props over internal state** — prefer controlled components that accept props; keep internal state minimal
- **One responsibility per component** — a component either renders UI or orchestrates logic, not both
- **No business logic in components** — data mutations, API calls, and transformations belong in `lib/` server actions or hooks
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

---
