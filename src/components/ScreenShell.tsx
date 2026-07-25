import type { ReactNode } from 'react';
import { ChevronLeft, Wind } from 'lucide-react';

interface ScreenShellProps {
  children: ReactNode;
  onBack?: () => void;
  showHeader?: boolean;
  footer?: ReactNode;
  align?: 'top' | 'center';
}

export function ScreenShell({
  children,
  onBack,
  showHeader = true,
  footer,
  align = 'top',
}: ScreenShellProps) {
  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-6 sm:px-6">
      {showHeader && (
        <header className="flex items-center justify-between py-5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-night-600 shadow-sm backdrop-blur transition-colors hover:bg-white"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="h-9 w-9" />
          )}
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white">
              <Wind className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-semibold text-night-700">Breathe Easy</span>
          </div>
          <span className="h-9 w-9" />
        </header>
      )}
      <main
        className={[
          'flex flex-1 flex-col',
          align === 'center' ? 'items-center justify-center' : 'pt-2',
        ].join(' ')}
      >
        {children}
      </main>
      {footer && <div className="pt-4">{footer}</div>}
    </div>
  );
}

interface PrimaryButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  className,
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-7 py-3.5 font-display text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

interface GhostButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function GhostButton({ children, onClick, disabled, className }: GhostButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-full bg-white/70 px-5 py-2.5 font-display text-sm font-semibold text-night-600 shadow-sm backdrop-blur transition-colors hover:bg-white disabled:opacity-50',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
