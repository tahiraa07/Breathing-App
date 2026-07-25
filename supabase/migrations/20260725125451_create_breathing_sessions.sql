/*
# Create breathing_sessions table (single-tenant, no auth)

1. New Tables
- `breathing_sessions`
- `id` (uuid, primary key)
- `device_id` (text, not null) — a client-generated per-browser identifier so each
  device only sees its own session history in the UI (no server-side auth).
- `pattern` (text, not null) — the breathing technique used, e.g. "Box Breathing".
- `duration_seconds` (integer, not null) — how long the completed session lasted.
- `completed_at` (timestamptz, defaults to now()) — when the session finished.

2. Security
- Enable RLS on `breathing_sessions`.
- This is a single-tenant app with no sign-in screen, so the anon-key client must
  be able to read and write its own data. CRUD is open to `anon, authenticated`
  (USING (true) is acceptable here because the data is intentionally public to
  the anon client; per-device isolation is handled client-side via device_id).

3. Indexes
- Index on (device_id, completed_at desc) for fast history retrieval per device.
*/

CREATE TABLE IF NOT EXISTS breathing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  pattern text NOT NULL,
  duration_seconds integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE breathing_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_select_breathing_sessions"
  ON breathing_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_insert_breathing_sessions"
  ON breathing_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_update_breathing_sessions"
  ON breathing_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_breathing_sessions" ON breathing_sessions;
CREATE POLICY "anon_delete_breathing_sessions"
  ON breathing_sessions FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_breathing_sessions_device_completed
  ON breathing_sessions (device_id, completed_at DESC);
