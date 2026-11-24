import {
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addMonths,
  addYears,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getMonth,
  getYear,
  isAfter,
  isSameDay,
  isSameMonth,
  setMonth,
  setYear,
  startOfMonth,
  startOfWeek,
  subMonths,
  subYears,
} from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, dateLocale, formatDate, parseDate, toDateKey, toMonthKey } from '../../lib/utils';
import {
  PickerError as ErrorText,
  PickerLabel as Label,
  PickerPopover as Popover,
  PickerTrigger as Trigger,
} from './pickerParts';

function NavButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full text-slate transition-colors hover:bg-cloud hover:text-monday-violet disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate"
    >
      {children}
    </button>
  );
}

interface FieldProps {
  label?: string;
  error?: string;
}

/* ---------- DatePicker ---------- */

export interface DatePickerProps extends FieldProps {
  /** `YYYY-MM-DD` or an empty string. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  align?: 'start' | 'end';
  /** `YYYY-MM-DD` — days after this key render disabled (anti future-date). */
  maxDate?: string;
}

export function DatePicker({
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled,
  clearable = false,
  align = 'start',
  maxDate,
}: DatePickerProps) {
  const { t } = useTranslation();
  const locale = dateLocale();
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [cursor, setCursor] = useState<Date>(selected ?? new Date());
  const max = parseDate(maxDate);

  const openCalendar = () => {
    setCursor(selected ?? new Date());
    setOpen(true);
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });

  const pick = (day: Date) => {
    onChange(toDateKey(day));
    setOpen(false);
  };

  const text = selected ? formatDate(selected) : '';

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative" ref={anchorRef}>
        <Trigger
          id={id}
          icon={<Calendar size={16} />}
          text={text}
          placeholder={placeholder ?? t('common.selectDate')}
          error={error}
          hasValue={Boolean(selected)}
          disabled={disabled}
          clearable={clearable}
          onClick={openCalendar}
          onClear={() => onChange('')}
        />

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
          align={align}
          label={t('common.calendar')}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <NavButton onClick={() => setCursor(subMonths(cursor, 1))} label={t('common.previousMonth')}>
              <ChevronLeft size={18} />
            </NavButton>
            <span className="text-body-sm font-medium text-ink">
              {format(cursor, 'MMMM yyyy', { locale })}
            </span>
            <NavButton
              onClick={() => setCursor(addMonths(cursor, 1))}
              label={t('common.nextMonth')}
              disabled={Boolean(max && isAfter(startOfMonth(addMonths(cursor, 1)), max))}
            >
              <ChevronRight size={18} />
            </NavButton>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.slice(0, 7).map((day) => (
              <span key={day.toISOString()} className="py-1 text-center text-caption text-iron">
                {format(day, 'EEE', { locale })}
              </span>
            ))}

            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false;
              const inMonth = isSameMonth(day, cursor);
              const isFuture = Boolean(max && isAfter(day, max));
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  disabled={isFuture}
                  aria-current={isSelected ? 'date' : undefined}
                  className={cn(
                    'flex min-h-[36px] items-center justify-center rounded-[6px] text-body-sm transition-colors',
                    isSelected
                      ? 'bg-monday-violet font-medium text-snow'
                      : inMonth
                        ? 'text-ink hover:bg-cloud'
                        : 'text-iron hover:bg-cloud',
                    isFuture && 'cursor-not-allowed text-iron/40 hover:bg-transparent',
                    !isSelected && isSameDay(day, new Date()) && 'border border-monday-violet',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-pebble pt-3">
            <button
              type="button"
              onClick={() => setCursor(new Date())}
              className="text-caption font-medium text-monday-violet hover:underline"
            >
              {t('common.today')}
            </button>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-caption font-medium text-slate hover:underline"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </Popover>
      </div>
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

/* ---------- MonthPicker ---------- */

export interface MonthPickerProps extends FieldProps {
  /** `YYYY-MM` or an empty string. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  align?: 'start' | 'end';
  /** `YYYY-MM` — months after this key render disabled (anti future-month). */
  maxMonth?: string;
}

export function MonthPicker({
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled,
  clearable = false,
  align = 'start',
  maxMonth,
}: MonthPickerProps) {
  const { t } = useTranslation();
  const locale = dateLocale();
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseDate(value ? `${value}-01` : null);
  const [cursor, setCursor] = useState<Date>(selected ?? new Date());
  const max = parseDate(maxMonth ? `${maxMonth}-01` : null);

  const openCalendar = () => {
    setCursor(selected ?? new Date());
    setOpen(true);
  };

  const pick = (monthIndex: number) => {
    const date = setMonth(cursor, monthIndex);
    onChange(toMonthKey(date));
    setOpen(false);
  };

  const text = selected ? format(selected, 'MMM yyyy', { locale }) : '';
  const selectedMonth = selected ? getMonth(selected) : -1;
  const selectedYear = selected ? getYear(selected) : -1;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative" ref={anchorRef}>
        <Trigger
          id={id}
          icon={<Calendar size={16} />}
          text={text}
          placeholder={placeholder ?? t('common.selectMonth')}
          error={error}
          hasValue={Boolean(selected)}
          disabled={disabled}
          clearable={clearable}
          onClick={openCalendar}
          onClear={() => onChange('')}
        />

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
          align={align}
          label={t('common.selectMonth')}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <NavButton onClick={() => setCursor(subYears(cursor, 1))} label={t('common.previousYear')}>
              <ChevronLeft size={18} />
            </NavButton>
            <button
              type="button"
              onClick={() => setCursor(setYear(cursor, getYear(new Date())))}
              className="text-body-sm font-medium text-ink hover:underline"
            >
              {getYear(cursor)}
            </button>
            <NavButton
              onClick={() => setCursor(addYears(cursor, 1))}
              label={t('common.nextYear')}
              disabled={Boolean(max && getYear(cursor) >= getYear(max))}
            >
              <ChevronRight size={18} />
            </NavButton>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }, (_, index) => format(setMonth(cursor, index), 'MMM', { locale })).map(
              (month, index) => {
              const isSelected = index === selectedMonth && getYear(cursor) === selectedYear;
              const isCurrent =
                index === getMonth(new Date()) && getYear(cursor) === getYear(new Date());
              const isFuture = Boolean(max && isAfter(setMonth(cursor, index), max));
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => pick(index)}
                  disabled={isFuture}
                  className={cn(
                    'min-h-[44px] rounded-[6px] text-body-sm transition-colors',
                    isSelected
                      ? 'bg-monday-violet font-medium text-snow'
                      : 'text-ink hover:bg-cloud',
                    !isSelected && isCurrent && 'border border-monday-violet',
                    isFuture && 'cursor-not-allowed text-iron/40 hover:bg-transparent',
                  )}
                >
                  {month}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-pebble pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(toMonthKey());
                setOpen(false);
              }}
              disabled={Boolean(max && isAfter(startOfMonth(new Date()), max))}
              className="text-caption font-medium text-monday-violet hover:underline disabled:cursor-not-allowed disabled:text-iron disabled:no-underline"
            >
              {t('common.thisMonth')}
            </button>
            {clearable && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-caption font-medium text-slate hover:underline"
              >
                {t('common.clear')}
              </button>
            )}
          </div>
        </Popover>
      </div>
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}