/*
# Fix breathing_sessions RLS to read device id from request.headers JSON

## Why
The previous policies used `current_setting('request.header.x-device-id', true)`,
which always returns NULL. PostgREST does NOT expose individual headers as
separate GUCs named `request.header.<name>`. Instead it exposes the ENTIRE
header set as a single JSON blob via `current_setting('request.headers', true)`.
Because the setting was NULL, every INSERT failed its WITH CHECK and every
SELECT/UPDATE/DELETE matched zero rows — the app could not save sessions.

## Changes
1. New helper function
- `public.get_request_header(name text)` — reads the `request.headers` JSON
  blob and returns the value of the named header (case-insensitive), or NULL
  if the blob or header is absent. Marked SECURITY DEFINER, owned by postgres,
  and granted to `anon, authenticated` so it is usable inside RLS policies.
  It only reads request metadata, so exposing it is safe.

2. Security
- Recreate all four CRUD policies on `breathing_sessions` to compare
  `device_id` against `public.get_request_header('x-device-id')`.
- A device can now SELECT/INSERT/UPDATE/DELETE only its own sessions, and the
  app's supabase-js client (which sends `x-device-id` via global headers)
  satisfies the check.
- RLS stays enabled. Policy roles stay `TO anon, authenticated` (no-auth app).

3. Tables
- No schema changes to `breathing_sessions`.
*/

CREATE OR REPLACE FUNCTION public.get_request_header(header_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NULLIF(
    COALESCE(
      (current_setting('request.headers', true))::jsonb ->> lower(header_name),
      (current_setting('request.headers', true))::jsonb #>> (ARRAY[lower(header_name)])
    ),
    ''
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_request_header(text) TO anon, authenticated;

ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_select_breathing_sessions"
  ON breathing_sessions FOR SELECT
  TO anon, authenticated
  USING (device_id = public.get_request_header('x-device-id'));

DROP POLICY IF EXISTS "anon_insert_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_insert_breathing_sessions"
  ON breathing_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (device_id = public.get_request_header('x-device-id'));

DROP POLICY IF EXISTS "anon_update_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_update_breathing_sessions"
  ON breathing_sessions FOR UPDATE
  TO anon, authenticated
  USING (device_id = public.get_request_header('x-device-id'))
  WITH CHECK (device_id = public.get_request_header('x-device-id'));

DROP POLICY IF EXISTS "anon_delete_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_delete_breathing_sessions"
  ON breathing_sessions FOR DELETE
  TO anon, authenticated
  USING (device_id = public.get_request_header('x-device-id'));
