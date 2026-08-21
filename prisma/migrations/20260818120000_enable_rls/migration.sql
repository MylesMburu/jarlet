-- Enable Row-Level Security on all tables and deny access to the Supabase
-- `anon` / `authenticated` roles. The app connects as a superuser (Prisma),
-- which bypasses RLS, so its queries are unaffected. Supabase's public API
-- uses those roles, and without RLS anyone with the project URL + anon key
-- could read/write/delete every table.
--
-- The roles only exist on Supabase deployments, so policies are created
-- conditionally; on plain Postgres (local dev) the guard is a no-op.

DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT LIKE 'pg\_%'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOR r IN SELECT unnest(ARRAY['anon', 'authenticated']) LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      FOR t IN
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename NOT LIKE 'pg\_%'
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS deny_%I ON %I', r, t);
        EXECUTE format(
          'CREATE POLICY deny_%I ON %I AS PERMISSIVE FOR ALL TO %I USING (false) WITH CHECK (false)',
          r, t, r
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;