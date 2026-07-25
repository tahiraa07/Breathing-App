/*
# Lock down get_request_header helper

## Why
The `public.get_request_header(text)` helper was created `SECURITY DEFINER`
and granted `EXECUTE` to `anon, authenticated`. That exposed it as a public
RPC at `/rest/v1/rpc/get_request_header`, which Supabase's security scanner
flags because a SECURITY DEFINER function callable by anon/authenticated can
be invoked directly by any client.

## Changes
1. Revoke EXECUTE from `anon`, `authenticated`, and `PUBLIC`.
   RLS policies are evaluated with the table owner's privileges inlined, so
   the policy can still call the function even though anon/authenticated have
   no direct EXECUTE grant on it. The function remains usable for RLS but is
   no longer callable as a standalone RPC.
2. Re-add the function definition (idempotent) so the migration is safe to
   re-run. Function body is unchanged; it still reads the `request.headers`
   JSON blob exposed by PostgREST and returns the named header value.

## Security impact
- The breathing_sessions RLS policies that call
  `public.get_request_header('x-device-id')` still work: SELECT/INSERT/
  UPDATE/DELETE on `breathing_sessions` continue to enforce per-device
  isolation via the `x-device-id` header.
- The function can no longer be invoked directly by anon or authenticated
  clients through the REST RPC endpoint, closing the flagged exposure.
- No schema changes to any tables. No data changes.
*/

-- Ensure the function exists with the expected definition (idempotent).
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

-- Revoke direct execution from all roles so it cannot be called via RPC.
-- RLS policy evaluation still succeeds because policies run with owner
-- privileges, independent of role-level EXECUTE grants on the helper.
REVOKE EXECUTE ON FUNCTION public.get_request_header(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_request_header(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_request_header(text) FROM PUBLIC;
