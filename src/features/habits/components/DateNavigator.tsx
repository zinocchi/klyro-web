import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DatePicker } from '../../../components/ui/DatePicker';
import { cn, formatLongDate, isToday, shiftDateKey, toDateKey } from '../../../lib/utils';

export interface DateNavigatorProps {
  value: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ value, onChange }: DateNavigatorProps) {
  const { t } = useTranslation();
  const today = toDateKey();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-card)] sm:justify-start">
      <button
        type="button"
        onClick={() => onChange(shiftDateKey(value, -1))}
        aria-label={t('common.previousDay')}
        className="rounded-full border border-pebble p-2 text-slate transition-colors hover:border-monday-violet hover:text-monday-violet"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="min-w-[12rem] flex-1 sm:flex-none">
        <DatePicker
          value={value}
          onChange={(date) => date && onChange(date)}
          placeholder={t('common.selectDate')}
          maxDate={today}
        />
        <p className="mt-1 text-caption text-slate">{formatLongDate(value)}</p>
      </div>

      <button
        type="button"
        onClick={() => onChange(shiftDateKey(value, 1))}
        disabled={shiftDateKey(value, 1) > today}
        aria-label={t('common.nextDay')}
        className="rounded-full border border-pebble p-2 text-slate transition-colors hover:border-monday-violet hover:text-monday-violet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-pebble disabled:hover:text-slate"
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
        {t('common.today')}
      </button>
    </div>
  );
}
