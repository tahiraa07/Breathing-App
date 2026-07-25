import { forwardRef } from 'react';
import type { Pattern } from '@/lib/patterns';
import { Check } from 'lucide-react';
import { ScreenShell } from '@/components/ScreenShell';

interface PatternScreenProps {
  patterns: Pattern[];
  selectedId: string;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export const PatternScreen = forwardRef<HTMLDivElement, PatternScreenProps>(
  ({ patterns, selectedId, onSelect, onBack }, ref) => {
    return (
      <ScreenShell onBack={onBack}>
        <div ref={ref} className="animate-fade-in">
          <h2 className="font-display text-2xl font-bold text-night-800">
            Choose a technique
          </h2>
          <p className="mt-1.5 text-sm text-night-500">
            Pick whichever feels right for this moment. You can change it any time before you start.
          </p>

          <div className="mt-5 space-y-3">
            {patterns.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelect(p.id)}
                  className={[
                    'group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300',
                    active
                      ? 'border-primary-400 bg-primary-50 shadow-[0_8px_30px_-12px_rgba(42,166,137,0.45)]'
                      : 'border-night-100 bg-white/70 hover:border-primary-300 hover:bg-primary-50/40',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors',
                      active ? 'border-primary-500 bg-primary-500 text-white' : 'border-night-300 bg-white text-transparent',
                    ].join(' ')}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={[
                        'font-display text-base font-semibold',
                        active ? 'text-primary-700' : 'text-night-800',
                      ].join(' ')}
                    >
                      {p.name}
                    </h3>
                    <p className="mt-0.5 text-sm text-night-500">{p.description}</p>
                    <p className="mt-2 text-xs leading-relaxed text-primary-600/90">
                      {p.benefit}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.phases.map((phase, i) => (
                        <span
                          key={`${p.id}-${i}`}
                          className="rounded-full bg-night-100 px-2 py-0.5 text-[11px] font-medium text-night-600"
                        >
                          {phase.cue} {phase.durationSeconds}s
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ScreenShell>
    );
  }
);

PatternScreen.displayName = 'PatternScreen';
