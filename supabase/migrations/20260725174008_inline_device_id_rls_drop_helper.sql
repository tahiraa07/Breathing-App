/*
# Remove get_request_header helper, inline header read into RLS policies

## Why
The previous migration locked down `public.get_request_header` by revoking
EXECUTE from anon/authenticated. That closed the RPC exposure but also broke
the RLS policies that call it: RLS policy evaluation still requires the
current role to have EXECUTE on any function referenced in a policy, so
every INSERT/SELECT/UPDATE/DELETE on `breathing_sessions` started failing
with `permission denied for function get_request_header`.

The scanner's underlying concern was a SECURITY DEFINER function callable by
anon/authenticated via `/rest/v1/rpc/get_request_header`. The cleanest fix is
to remove the function entirely and inline the header read directly in each
policy. `current_setting('request.headers', true)` is a standard GUC set by
PostgREST per request and is readable by any role inside an RLS policy, so no
helper function is needed. With no function, there is nothing to expose via
RPC and nothing for the scanner to flag.

## Changes
1. Drop all four existing CRUD policies on `breathing_sessions` (they
   referenced the now-removed helper).
2. Recreate all four policies with the device-id check inlined as
   `device_id = NULLIF((current_setting('request.headers', true))::jsonb
   ->> 'x-device-id', '')`.
   - SELECT: USING only
   - INSERT: WITH CHECK only
   - UPDATE: USING + WITH CHECK
   - DELETE: USING only
   All scoped `TO anon, authenticated` (no-auth app).
3. Drop the `public.get_request_header(text)` function. It is no longer
   referenced by any policy and had no other callers.

## Security impact
- No SECURITY DEFINER function remains; nothing is callable via
  `/rest/v1/rpc/get_request_header`.
- Per-device isolation is preserved: a browser can only read/insert/update/
  delete rows whose `device_id` matches its own `x-device-id` request header.
- No schema changes to `breathing_sessions`. No data changes.
*/

ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_select_breathing_sessions"
  ON breathing_sessions FOR SELECT
  TO anon, authenticated
  USING (
    device_id = NULLIF(
      (current_setting('request.headers', true))::jsonb ->> 'x-device-id',
      ''
    )
  );

DROP POLICY IF EXISTS "anon_insert_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_insert_breathing_sessions"
  ON breathing_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    device_id = NULLIF(
      (current_setting('request.headers', true))::jsonb ->> 'x-device-id',
      ''
    )
  );

DROP POLICY IF EXISTS "anon_update_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_update_breathing_sessions"
  ON breathing_sessions FOR UPDATE
  TO anon, authenticated
  USING (
    device_id = NULLIF(
      (current_setting('request.headers', true))::jsonb ->> 'x-device-id',
      ''
    )
  )
  WITH CHECK (
    device_id = NULLIF(
      (current_setting('request.headers', true))::jsonb ->> 'x-device-id',
      ''
    )
  );

DROP POLICY IF EXISTS "anon_delete_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_delete_breathing_sessions"
  ON breathing_sessions FOR DELETE
  TO anon, authenticated
  USING (
    device_id = NULLIF(
      (current_setting('request.headers', true))::jsonb ->> 'x-device-id',
      ''
    )
  );

-- Remove the now-unused helper function. No policies reference it anymore.
DROP FUNCTION IF EXISTS public.get_request_header(text);
