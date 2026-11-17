import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, formatLongDate, isToday, shiftDateKey, toDateKey } from '../../../lib/utils';

export interface DateNavigatorProps {
  value: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ value, onChange }: DateNavigatorProps) {
  const today = toDateKey();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-card)]">
      <button
        type="button"
        onClick={() => onChange(shiftDateKey(value, -1))}
        aria-label="Previous day"
        className="rounded-full border border-pebble p-2 text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex flex-col items-center">
        <span className="rounded-[6px] bg-periwinkle-wash px-3 py-1 text-body-sm font-medium text-ink">
          {value}
        </span>
        <span className="mt-1 text-caption text-slate">{formatLongDate(value)}</span>
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftDateKey(value, 1))}
        aria-label="Next day"
        className="rounded-full border border-pebble p-2 text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
      >
        <ChevronRight size={18} />
      </button>

      <button
        type="button"
        onClick={() => onChange(today)}
        disabled={isToday(value)}
        className={cn(
          'rounded-full px-4 py-2 text-body-sm font-medium transition-opacity',
          isToday(value)
            ? 'bg-cloud text-iron'
            : 'bg-monday-violet text-snow hover:opacity-90',
        )}
      >
        Today
      </button>
    </div>
  );
}
