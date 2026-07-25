import { useState } from 'react';
import { Clock, Check } from 'lucide-react';
import { ScreenShell, PrimaryButton } from '@/components/ScreenShell';
import {
  SESSION_DURATIONS,
  MIN_CUSTOM_MINUTES,
  MAX_CUSTOM_MINUTES,
} from '@/lib/patterns';

interface DurationScreenProps {
  durationSeconds: number;
  onSetDuration: (s: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export function DurationScreen({
  durationSeconds,
  onSetDuration,
  onBack,
  onNext,
}: DurationScreenProps) {
  const [showCustom, setShowCustom] = useState(
    !SESSION_DURATIONS.some((d) => d.seconds === durationSeconds)
  );
  const [customMinutes, setCustomMinutes] = useState(
    Math.max(MIN_CUSTOM_MINUTES, Math.min(MAX_CUSTOM_MINUTES, Math.round(durationSeconds / 60)))
  );

  const customError =
    customMinutes < MIN_CUSTOM_MINUTES || customMinutes > MAX_CUSTOM_MINUTES
      ? `Enter between ${MIN_CUSTOM_MINUTES} and ${MAX_CUSTOM_MINUTES} minutes`
      : null;

  const handleStart = () => {
    if (showCustom && customError) return;
    onNext();
  };

  return (
    <ScreenShell onBack={onBack}>
      <div className="animate-fade-in">
        <h2 className="font-display text-2xl font-bold text-night-800">How long?</h2>
        <p className="mt-1.5 text-sm text-night-500">
          Even a minute helps. Pick whatever you can spare right now.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {SESSION_DURATIONS.map((d) => {
            const active = !showCustom && d.seconds === durationSeconds;
            return (
              <button
                key={d.seconds}
                type="button"
                onClick={() => {
                  setShowCustom(false);
                  onSetDuration(d.seconds);
                }}
                className={[
                  'flex flex-col items-center rounded-2xl border py-5 transition-all',
                  active
                    ? 'border-primary-400 bg-primary-50 shadow-[0_8px_30px_-12px_rgba(42,166,137,0.45)]'
                    : 'border-night-100 bg-white/70 hover:border-primary-300',
                ].join(' ')}
              >
                <Clock
                  className={['h-5 w-5', active ? 'text-primary-500' : 'text-night-400'].join(' ')}
                />
                <span
                  className={[
                    'mt-1.5 font-display text-lg font-bold',
                    active ? 'text-primary-700' : 'text-night-700',
                  ].join(' ')}
                >
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowCustom(true);
            onSetDuration(customMinutes * 60);
          }}
          className={[
            'mt-3 flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all',
            showCustom
              ? 'border-primary-400 bg-primary-50'
              : 'border-night-100 bg-white/70 hover:border-primary-300',
          ].join(' ')}
        >
          <span className="font-display text-sm font-semibold text-night-700">
            Custom length
          </span>
          {showCustom && <Check className="h-4 w-4 text-primary-500" />}
        </button>

        {showCustom && (
          <div className="mt-4 rounded-2xl border border-night-100 bg-white/70 p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <label htmlFor="custom-min" className="text-sm font-medium text-night-600">
                Minutes
              </label>
              <input
                id="custom-min"
                type="number"
                inputMode="numeric"
                min={MIN_CUSTOM_MINUTES}
                max={MAX_CUSTOM_MINUTES}
                value={customMinutes}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setCustomMinutes(v);
                  if (!Number.isNaN(v) && v >= MIN_CUSTOM_MINUTES && v <= MAX_CUSTOM_MINUTES) {
                    onSetDuration(v * 60);
                  }
                }}
                className="w-20 rounded-lg border border-night-200 bg-white px-3 py-1.5 text-right font-display text-base font-semibold text-night-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            {customError && (
              <p className="mt-2 text-xs text-error-500">{customError}</p>
            )}
            <input
              type="range"
              min={MIN_CUSTOM_MINUTES}
              max={MAX_CUSTOM_MINUTES}
              value={Math.min(Math.max(customMinutes, MIN_CUSTOM_MINUTES), MAX_CUSTOM_MINUTES)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setCustomMinutes(v);
                onSetDuration(v * 60);
              }}
              className="mt-3 w-full accent-primary-500"
            />
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <PrimaryButton onClick={handleStart} disabled={!!customError} className="w-full">
          Begin session
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}
