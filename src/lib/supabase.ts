import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const DEVICE_ID_KEY = 'breathe-easy-device-id';

/**
 * Returns a stable per-browser identifier so each device only sees its own
 * session history. The app has no sign-in, so isolation is handled by sending
 * this id as the `x-device-id` header on every request; an RLS policy on
 * `breathing_sessions` compares each row's `device_id` against that header.
 */
export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-device-id': getDeviceId(),
    },
  },
});
