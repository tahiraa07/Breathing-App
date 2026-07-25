import { Flame, Calendar, Clock, Trash2, Smile } from 'lucide-react';
import { ScreenShell } from '@/components/ScreenShell';
import { CalendarHeatmap } from '@/components/CalendarHeatmap';
import type { SessionRecord } from '@/hooks/useSessionHistory';

interface HistoryScreenProps {
  sessions: SessionRecord[];
  streak: number;
  totalSessions: number;
  totalMinutes: number;
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onBack: () => void;
  onStart: () => void;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(now - then, 0);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function HistoryScreen({
  sessions,
  streak,
  totalSessions,
  totalMinutes,
  loading,
  error,
  onDelete,
  onBack,
  onStart,
}: HistoryScreenProps) {
  const stats = [
    { icon: Flame, label: 'Day streak', value: streak, accent: 'text-accent-500', ring: 'bg-accent-50' },
    { icon: Calendar, label: 'Sessions', value: totalSessions, accent: 'text-primary-600', ring: 'bg-primary-50' },
    { icon: Clock, label: 'Minutes', value: totalMinutes, accent: 'text-night-600', ring: 'bg-night-100' },
  ];

  return (
    <ScreenShell
      onBack={onBack}
      footer={
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-full bg-primary-500 py-3.5 font-display text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 active:scale-95"
        >
          Breathe again
        </button>
      }
    >
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-night-800">Your journey</h2>
        <p className="mt-1.5 text-sm text-night-500">
          Every session is a small win. Here's how you're building the habit.
        </p>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex flex-col items-center rounded-2xl bg-white/70 px-2 py-4 text-center shadow-sm backdrop-blur"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${s.ring}`}>
                  <Icon className={`h-4 w-4 ${s.accent}`} />
                </span>
                <span className="mt-1.5 font-display text-xl font-bold text-night-800">{s.value}</span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-night-400">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Calendar heatmap */}
        <div className="mt-5 rounded-2xl border border-night-100 bg-white/70 p-4 shadow-sm backdrop-blur">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-night-400">
            Last 12 weeks
          </h3>
          <CalendarHeatmap sessions={sessions} />
        </div>

        {/* Recent sessions */}
        <div className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-night-400">
            Recent sessions
          </h3>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-night-100/70" />
              ))}
            </div>
          ) : error ? (
            <p className="rounded-xl bg-error-400/10 px-4 py-3 text-sm text-error-500">
              Couldn't load your history. {error}
            </p>
          ) : sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-night-200 bg-night-50/40 px-4 py-10 text-center">
              <p className="font-display text-sm font-medium text-night-600">No sessions yet</p>
              <p className="mt-1 text-xs text-night-400">
                Finish your first breathing session and it'll appear here.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li
                  key={s.id}
                  className="group flex items-center gap-3 rounded-xl border border-night-100 bg-white/70 px-3 py-3 shadow-sm transition-colors hover:border-primary-200"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                    <Flame className="h-4 w-4 text-primary-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-night-800">
                      {s.pattern}
                    </p>
                    <p className="text-xs text-night-400">
                      {fmtDuration(s.duration_seconds)} · {formatRelative(s.completed_at)}
                    </p>
                    {s.feeling && (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-primary-600">
                        <Smile className="h-3 w-3" />
                        {s.feeling}
                      </p>
                    )}
                  </div>
                  <span className="hidden text-xs text-night-400 sm:block">
                    {formatTime(s.completed_at)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(s.id)}
                    aria-label="Delete session"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-night-300 transition-colors hover:bg-error-400/10 hover:text-error-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}
