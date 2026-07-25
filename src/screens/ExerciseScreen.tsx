import { useMemo } from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { BreathingCircle } from '@/components/BreathingCircle';
import { ScreenShell } from '@/components/ScreenShell';
import { useBreathingEngine, type EngineState } from '@/hooks/useBreathingEngine';
import { getPatternById } from '@/lib/patterns';

interface ExerciseScreenProps {
  patternId: string;
  durationSeconds: number;
  onComplete: (durationSeconds: number, cycles: number) => void;
  onExit: () => void;
}

export function ExerciseScreen({
  patternId,
  durationSeconds,
  onComplete,
  onExit,
}: ExerciseScreenProps) {
  const pattern = useMemo(() => getPatternById(patternId), [patternId]);

  const engine = useBreathingEngine({
    pattern,
    targetDurationSeconds: durationSeconds,
    onComplete,
  });

  const isRunning = engine.state === 'running';
  const isPaused = engine.state === 'paused';

  const handlePrimary = () => {
    if (engine.state === 'idle' || engine.state === 'finished') engine.start();
    else if (isRunning) engine.pause();
    else if (isPaused) engine.resume();
  };

  const primaryLabel: Record<EngineState, string> = {
    idle: 'Begin',
    running: 'Pause',
    paused: 'Resume',
    finished: 'Start again',
  };
  const PrimaryIcon = isRunning ? Pause : Play;

  return (
    <ScreenShell showHeader={false} align="center">
      <div className="flex w-full flex-col items-center">
        <div className="mb-2 flex items-center gap-2 text-sm">
          <span className="rounded-full bg-white/70 px-3 py-1 font-display font-semibold text-primary-700 shadow-sm backdrop-blur">
            {pattern.name}
          </span>
        </div>

        <div className="my-4 flex flex-1 items-center justify-center">
          <BreathingCircle
            ref={engine.circleRef}
            pattern={pattern}
            phaseIndex={engine.phaseIndex}
            phaseSecondsLeft={engine.phaseSecondsLeft}
            state={engine.state}
            elapsedSeconds={engine.elapsedSeconds}
            targetSeconds={durationSeconds}
          />
        </div>

        <div className="mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrimary}
            className="inline-flex items-center gap-2 rounded-full bg-primary-500 px-8 py-3.5 font-display text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:shadow-xl active:scale-95"
          >
            <PrimaryIcon className="h-5 w-5" />
            {primaryLabel[engine.state]}
          </button>

          {(isRunning || isPaused) && (
            <button
              type="button"
              onClick={engine.stop}
              className="inline-flex h-13 w-13 items-center justify-center rounded-full bg-white/70 p-3.5 text-night-600 shadow-sm backdrop-blur transition-all hover:bg-white active:scale-95"
              aria-label="End session"
              title="End session"
            >
              <Square className="h-5 w-5" />
            </button>
          )}
          {engine.state === 'finished' && (
            <button
              type="button"
              onClick={engine.reset}
              className="inline-flex h-13 w-13 items-center justify-center rounded-full bg-white/70 p-3.5 text-night-600 shadow-sm backdrop-blur transition-all hover:bg-white active:scale-95"
              aria-label="Reset"
              title="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          )}
        </div>

        {engine.state === 'idle' && (
          <button
            type="button"
            onClick={onExit}
            className="mt-5 text-xs font-medium text-night-400 transition-colors hover:text-night-600"
          >
            Exit
          </button>
        )}
      </div>
    </ScreenShell>
  );
}
