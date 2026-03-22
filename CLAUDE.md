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

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| Components | Shadcn UI (Radix) |
| ORM | Prisma |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth + @supabase/ssr |
| Validation | Zod |
| Forms | React Hook Form |
| Charts | Recharts |
| Icons | Lucide React |

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

- **TypeScript strict mode** — no `any`, no type suppression
- **Components must be small** — split if a file exceeds ~120 lines
- **Separate logic from UI** — server actions live in `lib/`, not in components
- **Server actions use Zod** for all input validation
- **No dummy data or mock logic** in components — use placeholder values only
- **Absolute imports** via `@/` — never use relative `../../`
- **Prisma client** is a singleton via `lib/db/prisma.ts`
- **Supabase client**: use `lib/auth/supabase.ts` (browser) and `lib/auth/supabase-server.ts` (server)
- Always run `prisma generate` after changing `schema.prisma`
- **Prisma 7:** datasource URL lives in `prisma.config.ts` (not in `schema.prisma`) — this is a Prisma 7 breaking change

---

## Design Rules

- **Color palette:** neutral — black, white, gray only
- **No gradients**, no bright colors, no shadows (use `shadow-none`)
- **SaaS style** — inspired by Linear, Notion, Stripe
- **Border:** `border-gray-100` for subtle dividers
- **Spacing:** consistent 4/6/8 units via Tailwind
- **Typography:** `text-gray-900` for headings, `text-gray-500` for secondary text
- **Interactive states:** `hover:bg-gray-50` for subtle hover, active via `bg-gray-100`

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

_(Empty — update after each work session with: what was done, what's next, any decisions made)_

---
