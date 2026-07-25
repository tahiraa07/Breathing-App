/*
# Scope breathing_sessions RLS policies by device_id

## Why
The original policies used `USING (true)` / `WITH CHECK (true)` for the anon
role. That bypasses row-level security entirely: any client could read, update,
or delete every row in the table, not just its own. This migration replaces
those always-true predicates with a real ownership check so each device can
only access its own sessions.

## How isolation works (no sign-in)
The app has no auth screen, so there is no `auth.uid()` to bind ownership to.
Instead, each browser generates a stable `device_id` (stored in localStorage)
and sends it as the `x-device-id` request header on every Supabase request.
The policies compare the row's `device_id` against that header via
`current_setting('request.header.x-device-id', true)`:

- If the header is missing, the setting is NULL and no rows match — no access.
- A client can only SELECT/UPDATE/DELETE rows whose `device_id` equals the
  device id it sends, and can only INSERT rows tagged with its own device id.
- A client cannot read or tamper with another device's sessions by spoofing a
  different `device_id` value in a query, because the policy re-derives the
  allowed device id from the request header, not from the query payload.

Note: because there is no authenticated identity, a determined client can still
spoof the header itself to impersonate another device. This is an inherent
limitation of anonymous (no-auth) apps. The policies below are the strongest
enforcement possible without adding sign-in, and they satisfy the requirement
that RLS predicates must not be trivially true.

## Changes
1. Security
- Drop and recreate all four CRUD policies on `breathing_sessions`.
- SELECT:  USING (device_id = current_setting('request.header.x-device-id', true))
- INSERT:  WITH CHECK (device_id = current_setting('request.header.x-device-id', true))
- UPDATE:  USING (...) WITH CHECK (...)
- DELETE:  USING (...)
- All policies remain `TO anon, authenticated` (no-auth app uses the anon key).
- RLS stays enabled.

2. Tables
- No schema changes. `breathing_sessions` columns are unchanged.

3. Frontend requirement
- The supabase-js client MUST send `x-device-id` on every request (set via
  `global.headers` in createClient). Without it, all reads return empty and
  all writes fail the policy check.
*/

ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_select_breathing_sessions"
  ON breathing_sessions FOR SELECT
  TO anon, authenticated
  USING (device_id = current_setting('request.header.x-device-id', true));

DROP POLICY IF EXISTS "anon_insert_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_insert_breathing_sessions"
  ON breathing_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (device_id = current_setting('request.header.x-device-id', true));

DROP POLICY IF EXISTS "anon_update_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_update_breathing_sessions"
  ON breathing_sessions FOR UPDATE
  TO anon, authenticated
  USING (device_id = current_setting('request.header.x-device-id', true))
  WITH CHECK (device_id = current_setting('request.header.x-device-id', true));

DROP POLICY IF EXISTS "anon_delete_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_delete_breathing_sessions"
  ON breathing_sessions FOR DELETE
  TO anon, authenticated
  USING (device_id = current_setting('request.header.x-device-id', true));
