import { Wind, Play, Sparkles } from 'lucide-react';
import { ScreenShell, PrimaryButton, GhostButton } from '@/components/ScreenShell';

interface HomeScreenProps {
  streak: number;
  onStart: () => void;
  onHistory: () => void;
}

export function HomeScreen({ streak, onStart, onHistory }: HomeScreenProps) {
  return (
    <ScreenShell align="center" showHeader={false}>
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <span className="absolute h-32 w-32 rounded-full bg-primary-300/40 animate-soft-pulse" />
          <span className="absolute h-24 w-24 rounded-full bg-primary-400/50 animate-soft-pulse [animation-delay:0.6s]" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-xl shadow-primary-500/40">
            <Wind className="h-9 w-9" />
          </span>
        </div>

        <h1 className="mt-8 font-display text-4xl font-bold text-night-800">
          Breathe Easy
        </h1>
        <p className="mt-3 max-w-xs text-balance text-base leading-relaxed text-night-500">
          Stressed? Take a minute. Guided breathing to calm your mind and steady your heart — one breath at a time.
        </p>

        {streak > 0 && (
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-accent-700 shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {streak}-day streak — keep it going
          </span>
        )}

        <div className="mt-9 flex flex-col items-center gap-3">
          <PrimaryButton onClick={onStart} className="px-10">
            <Play className="h-5 w-5" />
            Start Breathing
          </PrimaryButton>
          <GhostButton onClick={onHistory}>View your history</GhostButton>
        </div>
      </div>
    </ScreenShell>
  );
}
