import { useMemo, useState } from 'react';
import { Check, Sparkles, Smile } from 'lucide-react';
import { ScreenShell, PrimaryButton, GhostButton } from '@/components/ScreenShell';
import { MOODS } from '@/lib/patterns';

interface CompleteScreenProps {
  patternName: string;
  durationSeconds: number;
  cycles: number;
  savedSessionId: string | null;
  saveError: boolean;
  onLogFeeling: (feeling: string) => void;
  onDone: () => void;
  onHistory: () => void;
}

function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function CompleteScreen({
  patternName,
  durationSeconds,
  cycles,
  savedSessionId,
  saveError,
  onLogFeeling,
  onDone,
  onHistory,
}: CompleteScreenProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodSaved, setMoodSaved] = useState(false);

  const summary = useMemo(
    () => [
      { label: 'Technique', value: patternName },
      { label: 'Duration', value: fmtDuration(durationSeconds) },
      { label: 'Cycles', value: `${cycles}` },
    ],
    [patternName, durationSeconds, cycles]
  );

  const handlePickMood = (mood: string) => {
    if (moodSaved || !savedSessionId) return;
    setSelectedMood(mood);
    onLogFeeling(mood);
    setMoodSaved(true);
  };

  return (
    <ScreenShell showHeader={false} align="center">
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <span className="absolute h-24 w-24 rounded-full bg-primary-300/40 animate-soft-pulse" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-xl shadow-primary-500/40">
            <Sparkles className="h-9 w-9" />
          </span>
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold text-night-800">Great job!</h1>
        <p className="mt-2 max-w-xs text-balance text-sm leading-relaxed text-night-500">
          You showed up for yourself. That's the hard part. Here's what you just did.
        </p>

        {saveError && (
          <p className="mt-4 rounded-xl bg-error-400/10 px-4 py-2 text-xs text-error-500">
            We couldn't save this session to your history. Your calm still counts.
          </p>
        )}

        {/* Summary */}
        <div className="mt-6 w-full max-w-sm rounded-2xl border border-night-100 bg-white/70 p-4 shadow-sm backdrop-blur">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {summary.map((s) => (
              <div key={s.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-night-400">
                  {s.label}
                </dt>
                <dd className="mt-1 font-display text-sm font-bold text-night-800">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Mood logging */}
        <div className="mt-7 w-full max-w-sm">
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-night-600">
            <Smile className="h-4 w-4 text-primary-500" />
            How do you feel now?
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MOODS.map((m) => {
              const active = selectedMood === m.id;
              const disabled = moodSaved && !active;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handlePickMood(m.id)}
                  disabled={disabled || !savedSessionId}
                  className={[
                    'flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                    active
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-night-100 bg-white/70 text-night-600 hover:border-primary-300',
                    disabled || !savedSessionId ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {active && <Check className="h-4 w-4" />}
                  {m.label}
                </button>
              );
            })}
          </div>
          {!savedSessionId && (
            <p className="mt-2 text-xs text-night-400">Mood logging is unavailable this session.</p>
          )}
          {moodSaved && (
            <p className="mt-2 text-xs text-primary-600">Thanks — that's saved to your history.</p>
          )}
        </div>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
          <PrimaryButton onClick={onDone} className="w-full">
            Done
          </PrimaryButton>
          <GhostButton onClick={onHistory} className="w-full">
            View your history
          </GhostButton>
        </div>
      </div>
    </ScreenShell>
  );
}
