import { useMemo } from 'react';

interface CalendarHeatmapProps {
  sessions: { completed_at: string }[];
  weeks?: number;
}

function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarHeatmap({ sessions, weeks = 12 }: CalendarHeatmapProps) {
  const grid = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions) {
      const key = s.completed_at.slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    // Build a grid of columns = weeks, rows = 7 (Sun..Sat), ending today.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDow = today.getDay();
    // Start far enough back to fill `weeks` columns including today's column.
    const totalDays = weeks * 7;
    const start = new Date(today);
    start.setDate(start.getDate() - (totalDays - 1) - todayDow);
    const cols: { date: Date; key: string; count: number; future: boolean }[][] = [];
    for (let c = 0; c < weeks; c++) {
      const col: { date: Date; key: string; count: number; future: boolean }[] = [];
      for (let r = 0; r < 7; r++) {
        const d = new Date(start);
        d.setDate(start.getDate() + c * 7 + r);
        const key = dayKey(d);
        const future = d > today;
        col.push({ date: d, key, count: counts.get(key) ?? 0, future });
      }
      cols.push(col);
    }
    return cols;
  }, [sessions, weeks]);

  const levelClass = (count: number, future: boolean) => {
    if (future) return 'bg-transparent';
    if (count === 0) return 'bg-night-100/70';
    if (count === 1) return 'bg-primary-300';
    if (count === 2) return 'bg-primary-400';
    return 'bg-primary-500';
  };

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-[3px] pt-0.5 text-[10px] text-night-400">
        {WEEKDAY_LABELS.map((l, i) => (
          <span key={i} className="h-[13px] leading-[13px]">
            {i % 2 === 1 ? l : ''}
          </span>
        ))}
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {grid.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((cell) => (
              <div
                key={cell.key}
                className={`h-[13px] w-[13px] rounded-[3px] ${levelClass(cell.count, cell.future)}`}
                title={cell.future ? '' : `${cell.key}: ${cell.count} session${cell.count === 1 ? '' : 's'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
