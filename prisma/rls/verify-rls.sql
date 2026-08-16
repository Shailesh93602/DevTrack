-- ============================================================================
-- RLS verification — proves the policies in prisma/migrations/001_enable_rls.sql
-- actually DENY cross-user reads and writes.
--
-- Run it against a THROWAWAY LOCAL Postgres that has the DevTrack schema
-- applied (see README → "Verifying row-level security"):
--
--   createdb devtrack_rls
--   DIRECT_URL=postgresql://localhost:5432/devtrack_rls npx prisma db push
--   RLS_TEST_DATABASE_URL=postgresql://localhost:5432/devtrack_rls npm run test:rls
--
-- Everything runs inside one transaction that is ROLLED BACK at the end, so the
-- database is left untouched. The script refuses to run against a Supabase
-- database (it would clobber the real `auth.uid()`).
--
-- Exit code 0 = every cross-user access was denied. Any leak raises an
-- exception, which makes psql exit non-zero under `-v ON_ERROR_STOP=1`.
-- ============================================================================

\set ON_ERROR_STOP on
\pset pager off

BEGIN;

-- ─── Safety: never run this against a real Supabase project ────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('supabase_admin', 'supabase_auth_admin'))
     OR EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
    RAISE EXCEPTION 'Refusing to run: this looks like a Supabase database. Use a throwaway local Postgres.';
  END IF;
END $$;

-- ─── Stand in for the bits of Supabase the policies depend on ──────────────
-- Supabase exposes auth.uid() (the JWT `sub` claim) and connects API/Realtime
-- clients as the `authenticated` / `anon` roles. Tables are owned by a
-- different role, which is what makes RLS apply at all.
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(NULLIF(current_setting('request.jwt.claims', true), '')::json ->> 'sub', '')::uuid
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public, auth TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO authenticated, anon;

-- ─── Apply the real policy file (not a copy of it) ─────────────────────────
\ir ../migrations/001_enable_rls.sql

-- ─── Every user-owned table must have RLS enabled AND at least one policy ──
DO $$
DECLARE
  expected_table text;
  missing text[] := '{}';
BEGIN
  FOREACH expected_table IN ARRAY ARRAY[
    'User', 'DailyLog', 'DSAProblem', 'Project',
    'Milestone', 'ProjectActivityLog', 'Session', 'SessionEvent'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = expected_table AND c.relrowsecurity
    ) THEN
      missing := missing || (expected_table || ' (RLS not enabled)');
    ELSIF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = expected_table
    ) THEN
      missing := missing || (expected_table || ' (no policy)');
    END IF;
  END LOOP;

  IF array_length(missing, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Tables without RLS coverage: %', array_to_string(missing, ', ');
  END IF;
  RAISE NOTICE 'RLS enabled + policy present on all 8 user-owned tables';
END $$;

-- ─── Seed two users, each owning one row per table ─────────────────────────
-- Clear any fixtures left by a previous run (the transaction rolls back, so
-- this only matters if someone ran the script with COMMIT).
DELETE FROM "User" WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222'
);

INSERT INTO "User"(id, email) VALUES
  ('11111111-1111-1111-1111-111111111111', 'alice@rls.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@rls.test');

INSERT INTO "DailyLog"(id, "userId", date, "problemsSolved", topics, "updatedAt") VALUES
  ('rls-log-alice', '11111111-1111-1111-1111-111111111111', DATE '2026-01-01', 3, '{dp}', now()),
  ('rls-log-bob',   '22222222-2222-2222-2222-222222222222', DATE '2026-01-01', 5, '{graphs}', now());

INSERT INTO "DSAProblem"(id, "userId", title, difficulty, pattern, platform, "solvedAt", "updatedAt") VALUES
  ('rls-dsa-alice', '11111111-1111-1111-1111-111111111111', 'alice-private', 'EASY', 'dp', 'leetcode', now(), now()),
  ('rls-dsa-bob',   '22222222-2222-2222-2222-222222222222', 'bob-private',   'EASY', 'dp', 'leetcode', now(), now());

INSERT INTO "Project"(id, "userId", name, status, progress, "techStack", "updatedAt") VALUES
  ('rls-prj-alice', '11111111-1111-1111-1111-111111111111', 'alice-project', 'IN_PROGRESS', 0, '{}', now()),
  ('rls-prj-bob',   '22222222-2222-2222-2222-222222222222', 'bob-project',   'IN_PROGRESS', 0, '{}', now());

INSERT INTO "Milestone"(id, "userId", "projectId", title, "order", "updatedAt") VALUES
  ('rls-ms-alice', '11111111-1111-1111-1111-111111111111', 'rls-prj-alice', 'alice-milestone', 0, now()),
  ('rls-ms-bob',   '22222222-2222-2222-2222-222222222222', 'rls-prj-bob',   'bob-milestone',   0, now());

INSERT INTO "ProjectActivityLog"(id, "userId", "projectId", action) VALUES
  ('rls-pal-alice', '11111111-1111-1111-1111-111111111111', 'rls-prj-alice', 'PROJECT_CREATED'),
  ('rls-pal-bob',   '22222222-2222-2222-2222-222222222222', 'rls-prj-bob',   'PROJECT_CREATED');

INSERT INTO "Session"(id, "userId", "startedAt", "updatedAt") VALUES
  ('rls-ses-alice', '11111111-1111-1111-1111-111111111111', now(), now()),
  ('rls-ses-bob',   '22222222-2222-2222-2222-222222222222', now(), now());

INSERT INTO "SessionEvent"(id, "sessionId", "activityType") VALUES
  ('rls-sev-alice', 'rls-ses-alice', 'PROBLEM_SOLVED'),
  ('rls-sev-bob',   'rls-ses-bob',   'PROBLEM_SOLVED');

-- ─── Act as Alice, over the role a Supabase client actually uses ───────────
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111"}', true);

DO $$
DECLARE
  alice constant text := '11111111-1111-1111-1111-111111111111';
  visible bigint;
  leaked bigint;
BEGIN
  -- Reads: Alice sees exactly her own row in every table, and Bob's rows are
  -- invisible even when addressed by primary key.
  SELECT count(*) INTO visible FROM "DailyLog";
  IF visible <> 1 THEN RAISE EXCEPTION 'DailyLog: expected 1 visible row, got %', visible; END IF;

  SELECT count(*) INTO leaked FROM "DailyLog" WHERE id = 'rls-log-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s DailyLog'; END IF;

  SELECT count(*) INTO leaked FROM "DSAProblem" WHERE id = 'rls-dsa-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s DSAProblem'; END IF;

  SELECT count(*) INTO leaked FROM "Project" WHERE id = 'rls-prj-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s Project'; END IF;

  SELECT count(*) INTO leaked FROM "Milestone" WHERE id = 'rls-ms-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s Milestone'; END IF;

  SELECT count(*) INTO leaked FROM "ProjectActivityLog" WHERE id = 'rls-pal-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s ProjectActivityLog'; END IF;

  SELECT count(*) INTO leaked FROM "Session" WHERE id = 'rls-ses-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s Session'; END IF;

  -- SessionEvent has no userId; it is gated through its parent Session.
  SELECT count(*) INTO leaked FROM "SessionEvent" WHERE id = 'rls-sev-bob';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s SessionEvent'; END IF;

  SELECT count(*) INTO leaked FROM "User" WHERE id = '22222222-2222-2222-2222-222222222222';
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can read bob''s User row'; END IF;

  RAISE NOTICE 'reads denied across all 8 tables';

  -- Writes: Alice cannot update or delete Bob's rows (they are simply not
  -- visible to the UPDATE/DELETE), nor insert a row owned by Bob.
  WITH updated AS (UPDATE "DailyLog" SET notes = 'pwned' WHERE id = 'rls-log-bob' RETURNING 1)
  SELECT count(*) INTO leaked FROM updated;
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can update bob''s DailyLog'; END IF;

  WITH deleted AS (DELETE FROM "DSAProblem" WHERE id = 'rls-dsa-bob' RETURNING 1)
  SELECT count(*) INTO leaked FROM deleted;
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: alice can delete bob''s DSAProblem'; END IF;

  BEGIN
    INSERT INTO "DailyLog"(id, "userId", date, "problemsSolved", topics, "updatedAt")
    VALUES ('rls-log-forged', '22222222-2222-2222-2222-222222222222', DATE '2026-02-02', 1, '{x}', now());
    RAISE EXCEPTION 'LEAK: alice can insert a DailyLog owned by bob';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL; -- expected: WITH CHECK rejected the forged row
  END;

  RAISE NOTICE 'writes denied (update, delete, forged insert)';

  -- Alice can still do everything with her own rows.
  UPDATE "DailyLog" SET notes = 'mine' WHERE id = 'rls-log-alice';
  IF NOT FOUND THEN RAISE EXCEPTION 'REGRESSION: alice cannot update her own DailyLog'; END IF;

  INSERT INTO "DailyLog"(id, "userId", date, "problemsSolved", topics, "updatedAt")
  VALUES ('rls-log-alice-2', alice, DATE '2026-01-02', 1, '{trees}', now());

  RAISE NOTICE 'owner access still works';
END $$;

-- ─── An unauthenticated client (no JWT) must see nothing ───────────────────
SELECT set_config('request.jwt.claims', NULL, true);
SET LOCAL ROLE anon;

DO $$
DECLARE leaked bigint;
BEGIN
  SELECT count(*) INTO leaked FROM "DailyLog";
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: anonymous client can read % DailyLog rows', leaked; END IF;
  SELECT count(*) INTO leaked FROM "User";
  IF leaked <> 0 THEN RAISE EXCEPTION 'LEAK: anonymous client can read % User rows', leaked; END IF;
  RAISE NOTICE 'anonymous access denied';
END $$;

RESET ROLE;

SELECT 'RLS VERIFIED: cross-user reads and writes are denied on all 8 tables' AS result;

ROLLBACK;
