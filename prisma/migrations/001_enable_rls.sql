-- Enable Row-Level Security on every user-owned table.
--
-- Runs against Supabase PostgreSQL. Safe to re-run: uses DROP POLICY IF EXISTS
-- + CREATE POLICY per table. Does NOT disable RLS on the `User` table — if you
-- need to bypass these policies (e.g. a server-side action that already
-- validated auth), use the service-role key which bypasses RLS by design.
--
-- User.id is the Supabase auth.uid() UUID (see lib/services/user.ts:
-- ensureUserInDb upserts by email and writes the Supabase session id).
-- All child tables reference User.id via their `userId` column, so
-- `auth.uid()::text = "userId"` is the canonical rule.
--
-- Apply in the Supabase SQL editor or via `supabase db push` after running
-- `prisma migrate deploy`.

-- ─── User table ────────────────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User: select own row" ON "User";
CREATE POLICY "User: select own row" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "User: update own row" ON "User";
CREATE POLICY "User: update own row" ON "User"
  FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- Users are created server-side via ensureUserInDb, which runs under the
-- service-role key and bypasses RLS. Intentionally no INSERT policy here so
-- the public anon role cannot fabricate user rows.

-- ─── DailyLog ──────────────────────────────────────────────────────────────
ALTER TABLE "DailyLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DailyLog: owner full access" ON "DailyLog";
CREATE POLICY "DailyLog: owner full access" ON "DailyLog"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── DSAProblem ────────────────────────────────────────────────────────────
ALTER TABLE "DSAProblem" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "DSAProblem: owner full access" ON "DSAProblem";
CREATE POLICY "DSAProblem: owner full access" ON "DSAProblem"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── Project ───────────────────────────────────────────────────────────────
ALTER TABLE "Project" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project: owner full access" ON "Project";
CREATE POLICY "Project: owner full access" ON "Project"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── Milestone ─────────────────────────────────────────────────────────────
ALTER TABLE "Milestone" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Milestone: owner full access" ON "Milestone";
CREATE POLICY "Milestone: owner full access" ON "Milestone"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── ProjectActivityLog ────────────────────────────────────────────────────
ALTER TABLE "ProjectActivityLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ProjectActivityLog: owner full access" ON "ProjectActivityLog";
CREATE POLICY "ProjectActivityLog: owner full access" ON "ProjectActivityLog"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── Session ───────────────────────────────────────────────────────────────
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Session: owner full access" ON "Session";
CREATE POLICY "Session: owner full access" ON "Session"
  FOR ALL USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");

-- ─── SessionEvent ──────────────────────────────────────────────────────────
-- SessionEvent has no userId of its own; it joins to Session which has one.
-- Policy checks via the parent row's owner.

ALTER TABLE "SessionEvent" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SessionEvent: owner full access via Session" ON "SessionEvent";
CREATE POLICY "SessionEvent: owner full access via Session" ON "SessionEvent"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "SessionEvent"."sessionId"
        AND "Session"."userId" = auth.uid()::text
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Session"
      WHERE "Session".id = "SessionEvent"."sessionId"
        AND "Session"."userId" = auth.uid()::text
    )
  );
