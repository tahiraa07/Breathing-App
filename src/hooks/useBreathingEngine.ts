import { useEffect, useRef, useState } from 'react';
import type { Pattern } from '@/lib/patterns';

export type EngineState = 'idle' | 'running' | 'paused' | 'finished';

const MIN_SCALE = 1;
const MAX_SCALE = 2.4;

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

interface UseBreathingEngineArgs {
  pattern: Pattern;
  targetDurationSeconds: number;
  onComplete: (durationSeconds: number, cycles: number) => void;
}

export function useBreathingEngine({
  pattern,
  targetDurationSeconds,
  onComplete,
}: UseBreathingEngineArgs) {
  const [state, setState] = useState<EngineState>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(
    pattern.phases[0].durationSeconds
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cycles, setCycles] = useState(0);

  const circleRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const phaseStartRef = useRef(0);
  const sessionStartRef = useRef(0);
  const pausedAccumRef = useRef(0);
  const pauseStartRef = useRef<number | null>(null);
  const phaseIndexRef = useRef(0);
  const cyclesRef = useRef(0);
  const stateRef = useRef<EngineState>('idle');

  const onCompleteRef = useRef(onComplete);
  const patternRef = useRef(pattern);
  const targetRef = useRef(targetDurationSeconds);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  useEffect(() => {
    patternRef.current = pattern;
    if (stateRef.current === 'idle' || stateRef.current === 'finished') {
      phaseIndexRef.current = 0;
      setPhaseIndex(0);
      setPhaseSecondsLeft(pattern.phases[0].durationSeconds);
      setElapsedSeconds(0);
      setCycles(0);
      setScale(MIN_SCALE);
    }
  }, [pattern]);
  useEffect(() => {
    targetRef.current = targetDurationSeconds;
  }, [targetDurationSeconds]);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setScale = (scale: number) => {
    const el = circleRef.current;
    if (el) el.style.transform = `scale(${scale})`;
  };

  // rAF loop stored in a ref so it always reads the latest values.
  const loopRef = useRef<(now: number) => void>(() => {});
  loopRef.current = (now: number) => {
    const p = patternRef.current.phases[phaseIndexRef.current];
    const phaseElapsed = (now - phaseStartRef.current) / 1000;
    const totalElapsed =
      (now - sessionStartRef.current - pausedAccumRef.current) / 1000;

    let scale: number;
    if (p.type === 'inhale') {
      const prog = Math.min(phaseElapsed / p.durationSeconds, 1);
      scale = lerp(MIN_SCALE, MAX_SCALE, easeInOutSine(prog));
    } else if (p.type === 'exhale') {
      const prog = Math.min(phaseElapsed / p.durationSeconds, 1);
      scale = lerp(MAX_SCALE, MIN_SCALE, easeInOutSine(prog));
    } else if (p.type === 'hold-full') {
      scale = MAX_SCALE;
    } else {
      scale = MIN_SCALE;
    }
    setScale(scale);

    setPhaseSecondsLeft(Math.max(Math.ceil(p.durationSeconds - phaseElapsed), 0));
    setElapsedSeconds(Math.floor(totalElapsed));

    if (phaseElapsed >= p.durationSeconds) {
      const next = (phaseIndexRef.current + 1) % patternRef.current.phases.length;
      if (next === 0) {
        cyclesRef.current += 1;
        setCycles(cyclesRef.current);
      }
      phaseIndexRef.current = next;
      phaseStartRef.current = now;
      setPhaseIndex(next);
    }

    if (totalElapsed >= targetRef.current) {
      cancelAnimationFrame(rafRef.current!);
      rafRef.current = null;
      setScale(MIN_SCALE);
      setState('finished');
      onCompleteRef.current(Math.round(totalElapsed), cyclesRef.current);
      return;
    }

    rafRef.current = requestAnimationFrame(loopRef.current);
  };

  const start = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const now = performance.now();
    phaseIndexRef.current = 0;
    cyclesRef.current = 0;
    pausedAccumRef.current = 0;
    pauseStartRef.current = null;
    sessionStartRef.current = now;
    phaseStartRef.current = now;
    setPhaseIndex(0);
    setCycles(0);
    setElapsedSeconds(0);
    setPhaseSecondsLeft(patternRef.current.phases[0].durationSeconds);
    setScale(MIN_SCALE);
    setState('running');
    rafRef.current = requestAnimationFrame(loopRef.current);
  };

  const pause = () => {
    if (stateRef.current !== 'running') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    pauseStartRef.current = performance.now();
    setState('paused');
  };

  const resume = () => {
    if (stateRef.current !== 'paused') return;
    const now = performance.now();
    const pausedDelta = now - (pauseStartRef.current ?? now);
    pausedAccumRef.current += pausedDelta;
    phaseStartRef.current += pausedDelta;
    pauseStartRef.current = null;
    setState('running');
    rafRef.current = requestAnimationFrame(loopRef.current);
  };

  const stop = () => {
    if (stateRef.current === 'idle' || stateRef.current === 'finished') return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    const now = performance.now();
    const totalElapsed =
      stateRef.current === 'paused'
        ? ((pauseStartRef.current ?? now) -
            sessionStartRef.current -
            pausedAccumRef.current) /
          1000
        : (now - sessionStartRef.current - pausedAccumRef.current) / 1000;
    setScale(MIN_SCALE);
    if (totalElapsed >= 10) {
      setState('finished');
      onCompleteRef.current(Math.round(totalElapsed), cyclesRef.current);
    } else {
      setState('idle');
      phaseIndexRef.current = 0;
      setPhaseIndex(0);
      setElapsedSeconds(0);
      setCycles(0);
      setPhaseSecondsLeft(patternRef.current.phases[0].durationSeconds);
    }
  };

  const reset = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    phaseIndexRef.current = 0;
    setPhaseIndex(0);
    setElapsedSeconds(0);
    setCycles(0);
    setPhaseSecondsLeft(patternRef.current.phases[0].durationSeconds);
    setScale(MIN_SCALE);
    setState('idle');
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    state,
    phaseIndex,
    phaseSecondsLeft,
    elapsedSeconds,
    cycles,
    circleRef,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
