import { useCallback, useRef, useState } from 'react';
import { HomeScreen } from '@/screens/HomeScreen';
import { PatternScreen } from '@/screens/PatternScreen';
import { DurationScreen } from '@/screens/DurationScreen';
import { ExerciseScreen } from '@/screens/ExerciseScreen';
import { CompleteScreen } from '@/screens/CompleteScreen';
import { HistoryScreen } from '@/screens/HistoryScreen';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { PATTERNS, getPatternById, MOODS } from '@/lib/patterns';

type Screen = 'home' | 'pattern' | 'duration' | 'exercise' | 'complete' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [patternId, setPatternId] = useState(PATTERNS[0].id);
  const [durationSeconds, setDurationSeconds] = useState(180);
  const [result, setResult] = useState<{
    durationSeconds: number;
    cycles: number;
    sessionId: string | null;
    saveError: boolean;
  } | null>(null);

  const {
    sessions,
    streak,
    totalSessions,
    totalMinutes,
    loading,
    error,
    addSession,
    setFeeling,
    deleteSession,
  } = useSessionHistory();

  // Capture last-completed session timing for the complete screen.
  const lastResultRef = useRef<{ durationSeconds: number; cycles: number } | null>(null);

  const handleComplete = useCallback(
    async (durationSeconds: number, cycles: number) => {
      lastResultRef.current = { durationSeconds, cycles };
      const patternName = getPatternById(patternId).name;
      const id = await addSession(patternName, durationSeconds);
      setResult({
        durationSeconds,
        cycles,
        sessionId: id,
        saveError: id === null,
      });
      setScreen('complete');
    },
    [addSession, patternId]
  );

  const handleLogFeeling = useCallback(
    (feelingId: string) => {
      if (!result?.sessionId) return;
      const mood = MOODS.find((m) => m.id === feelingId);
      if (mood) setFeeling(result.sessionId, mood.label);
    },
    [result?.sessionId, setFeeling]
  );

  const startFlow = () => setScreen('pattern');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-night-50 via-primary-50/30 to-night-50">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-primary-200/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-accent-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-primary-300/20 blur-3xl" />

      <div className="relative">
        {screen === 'home' && (
          <HomeScreen streak={streak} onStart={startFlow} onHistory={() => setScreen('history')} />
        )}

        {screen === 'pattern' && (
          <>
            <PatternScreen
              patterns={PATTERNS}
              selectedId={patternId}
              onSelect={setPatternId}
              onBack={() => setScreen('home')}
            />
            <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 mx-auto max-w-md px-5 pb-6 sm:px-6">
              <button
                type="button"
                onClick={() => setScreen('duration')}
                className="pointer-events-auto w-full rounded-full bg-primary-500 py-3.5 font-display text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 active:scale-95"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {screen === 'duration' && (
          <DurationScreen
            durationSeconds={durationSeconds}
            onSetDuration={setDurationSeconds}
            onBack={() => setScreen('pattern')}
            onNext={() => setScreen('exercise')}
          />
        )}

        {screen === 'exercise' && (
          <ExerciseScreen
            patternId={patternId}
            durationSeconds={durationSeconds}
            onComplete={handleComplete}
            onExit={() => setScreen('home')}
          />
        )}

        {screen === 'complete' && result && (
          <CompleteScreen
            patternName={getPatternById(patternId).name}
            durationSeconds={result.durationSeconds}
            cycles={result.cycles}
            savedSessionId={result.sessionId}
            saveError={result.saveError}
            onLogFeeling={handleLogFeeling}
            onDone={() => setScreen('home')}
            onHistory={() => setScreen('history')}
          />
        )}

        {screen === 'history' && (
          <HistoryScreen
            sessions={sessions}
            streak={streak}
            totalSessions={totalSessions}
            totalMinutes={totalMinutes}
            loading={loading}
            error={error}
            onDelete={deleteSession}
            onBack={() => setScreen('home')}
            onStart={() => setScreen('pattern')}
          />
        )}
      </div>
    </div>
  );
}
