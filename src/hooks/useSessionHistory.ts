import { useCallback, useEffect, useState } from 'react';
import { supabase, getDeviceId } from '@/lib/supabase';

export interface SessionRecord {
  id: string;
  pattern: string;
  duration_seconds: number;
  feeling: string | null;
  completed_at: string;
}

interface UseSessionHistoryResult {
  sessions: SessionRecord[];
  streak: number;
  totalSessions: number;
  totalMinutes: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addSession: (
    pattern: string,
    durationSeconds: number
  ) => Promise<string | null>;
  setFeeling: (sessionId: string, feeling: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

function formatDay(iso: string): string {
  return iso.slice(0, 10);
}

/** Count consecutive days (ending today or yesterday) with at least one session. */
function computeStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((s) => formatDay(s.completed_at)));
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const yesterday = new Date(todayMidnight);
  yesterday.setDate(yesterday.getDate() - 1);

  const startToday = days.has(iso(todayMidnight));
  const startYesterday = days.has(iso(yesterday));
  if (!startToday && !startYesterday) return 0;

  let streak = 0;
  let cursor = startToday ? new Date(todayMidnight) : new Date(yesterday);
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useSessionHistory(): UseSessionHistoryResult {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const deviceId = getDeviceId();
    const { data, error: queryError } = await supabase
      .from('breathing_sessions')
      .select('id, pattern, duration_seconds, feeling, completed_at')
      .eq('device_id', deviceId)
      .order('completed_at', { ascending: false })
      .limit(100);

    if (queryError) {
      setError(queryError.message);
      setSessions([]);
    } else {
      setSessions((data ?? []) as SessionRecord[]);
    }
    setLoading(false);
  }, []);

  const addSession = useCallback(
    async (pattern: string, durationSeconds: number) => {
      const deviceId = getDeviceId();
      const { data, error: insertError } = await supabase
        .from('breathing_sessions')
        .insert({
          device_id: deviceId,
          pattern,
          duration_seconds: durationSeconds,
        })
        .select('id')
        .single();
      if (insertError) {
        setError(insertError.message);
        return null;
      }
      await refresh();
      return data?.id ?? null;
    },
    [refresh]
  );

  const setFeeling = useCallback(
    async (sessionId: string, feeling: string) => {
      const { error: updateError } = await supabase
        .from('breathing_sessions')
        .update({ feeling })
        .eq('id', sessionId)
        .eq('device_id', getDeviceId());
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, feeling } : s))
      );
    },
    []
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      const { error: delError } = await supabase
        .from('breathing_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('device_id', getDeviceId());
      if (delError) {
        setError(delError.message);
        return;
      }
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const streak = computeStreak(sessions);
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(
    sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );

  return {
    sessions,
    streak,
    totalSessions,
    totalMinutes,
    loading,
    error,
    refresh,
    addSession,
    setFeeling,
    deleteSession,
  };
}
