/*
# Add feeling column to breathing_sessions

## Why
The new Session Complete screen lets users optionally log how they feel after a
session (e.g. "Much calmer", "Still tense"). This requires storing that value
on each session row.

## Changes
1. Tables
- Add `feeling` (text, nullable) to `breathing_sessions`. Nullable so existing
  rows and sessions where the user skips the mood prompt remain valid.

2. Security
- No policy changes. The existing device-id-scoped RLS policies already cover
  the new column — a device can only UPDATE its own rows, so only the session
  owner can set its `feeling`. No new policy needed.
*/

ALTER TABLE breathing_sessions
  ADD COLUMN IF NOT EXISTS feeling text;
