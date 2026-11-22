import { cn, shiftDateKey, toDateKey } from '../../../lib/utils';

export interface HabitHeatmapProps {
  /** `YYYY-MM-DD` check-in dates of the last 30 days. */
  recentLogs: string[];
}

/** 30-day strip: oldest (29 days ago) → today, mint when checked in. */
export function HabitHeatmap({ recentLogs }: HabitHeatmapProps) {
  const done = new Set(recentLogs);
  const today = toDateKey();
  const days = Array.from({ length: 30 }, (_, i) => shiftDateKey(today, i - 29));

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-caption text-iron">30 hari terakhir</span>
      <div
        className="flex flex-wrap gap-1"
        role="img"
        aria-label={`${recentLogs.length} dari 30 hari terakhir selesai`}
      >
        {days.map((day) => (
          <span
            key={day}
            title={day}
            className={cn('h-3.5 w-3.5 rounded-[3px]', done.has(day) ? 'bg-mint' : 'bg-cloud')}
          />
        ))}
      </div>
    </div>
  );
}
