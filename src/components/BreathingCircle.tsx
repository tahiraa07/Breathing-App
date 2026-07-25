import { forwardRef, useMemo } from 'react';
import type { EngineState } from '@/hooks/useBreathingEngine';
import type { Pattern, PhaseType } from '@/lib/patterns';

interface BreathingCircleProps {
  pattern: Pattern;
  phaseIndex: number;
  phaseSecondsLeft: number;
  state: EngineState;
  elapsedSeconds: number;
  targetSeconds: number;
}

const PHASE_HINT: Record<PhaseType, string> = {
  inhale: 'Breathe in',
  'hold-full': 'Hold',
  exhale: 'Breathe out',
  'hold-empty': 'Hold',
};

function formatClock(total: number): string {
  const remaining = Math.max(total - 0, 0);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const BreathingCircle = forwardRef<HTMLDivElement, BreathingCircleProps>(
  ({ pattern, phaseIndex, phaseSecondsLeft, state, elapsedSeconds, targetSeconds }, ref) => {
    const phase = pattern.phases[phaseIndex] ?? pattern.phases[0];
    const cue = state === 'idle' ? 'Ready when you are' : state === 'finished' ? 'Well done' : PHASE_HINT[phase.type];
    const showCountdown = state === 'running' || state === 'paused';

    const rings = useMemo(() => [0, 1, 2], []);

    return (
      <div className="relative flex h-[20rem] w-[20rem] flex-col items-center justify-center sm:h-[24rem] sm:w-[24rem]">
        {/* Ambient pulsing rings */}
        {rings.map((i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full border border-primary-300/30"
            style={{
              width: `${70 + i * 12}%`,
              height: `${70 + i * 12}%`,
              animation: `soft-pulse ${4 + i * 0.8}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* The animated circle. Transform is driven imperatively by the engine. */}
        <div
          ref={ref}
          className="relative flex h-44 w-44 items-center justify-center rounded-full will-change-transform sm:h-52 sm:w-52"
          style={{
            transform: 'scale(1)',
            background:
              'radial-gradient(circle at 35% 30%, #7fdac1 0%, #2aa689 55%, #1c6b5c 100%)',
            boxShadow:
              '0 0 60px rgba(74, 193, 164, 0.45), inset 0 0 40px rgba(255,255,255,0.25)',
            transition: 'box-shadow 1s ease',
          }}
        >
          {/* Inner glow */}
          <div className="absolute inset-3 rounded-full bg-white/10 backdrop-blur-[2px]" />
        </div>

        {/* Cues + countdown overlaid */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p
            className="font-display text-2xl font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-3xl"
            style={{ textShadow: '0 2px 12px rgba(10,40,35,0.45)' }}
          >
            {cue}
          </p>
          {showCountdown && (
            <p className="mt-2 font-display text-5xl font-bold text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              {phaseSecondsLeft}
            </p>
          )}
        </div>

        {/* Session clock */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full">
          <span className="font-display text-sm font-medium tracking-wide text-night-400">
            {formatClock(elapsedSeconds)} <span className="text-night-500">/</span> {formatClock(targetSeconds)}
          </span>
        </div>
      </div>
    );
  }
);

BreathingCircle.displayName = 'BreathingCircle';
