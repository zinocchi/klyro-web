import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MonthPicker } from '../../../components/ui/DatePicker';
import { toMonthKey } from '../../../lib/utils';

export interface MonthSelectorProps {
  /** `YYYY-MM` */
  value: string;
  onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number);
  if (!year || !m) return month;
  const date = new Date(year, m - 1 + delta, 1);
  return format(date, 'yyyy-MM');
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  const current = toMonthKey();
  const isCurrent = value === current;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Previous month"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-pebble text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="min-w-[11rem] flex-1 sm:flex-none">
        <MonthPicker
          value={value}
          onChange={onChange}
          placeholder="Pilih bulan"
          align="end"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Next month"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-pebble text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
      >
        <ChevronRight size={18} />
      </button>

      <button
        type="button"
        onClick={() => onChange(current)}
        disabled={isCurrent}
        className={
          isCurrent
            ? 'min-h-[44px] rounded-full bg-cloud px-4 text-body-sm font-medium text-iron'
            : 'min-h-[44px] rounded-full bg-monday-violet px-4 text-body-sm font-medium text-snow hover:opacity-90'
        }
      >
        Bulan ini
      </button>
    </div>
  );
}