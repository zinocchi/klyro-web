import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
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
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, dateLocale, formatDate, parseDate, toDateKey, toMonthKey } from '../../lib/utils';

/* ---------- shared pieces ---------- */

interface PopoverProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLDivElement | null>;
  align?: 'start' | 'end';
  label: string;
  children: ReactNode;
}

/**
 * Renders into a portal with fixed positioning so the calendar is never clipped
 * by an ancestor with `overflow` (form modals) and flips above the trigger when
 * there is not enough room below.
 */
function Popover({ open, onClose, anchorRef, align = 'start', label, children }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!open) return;

    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const menu = ref.current?.getBoundingClientRect();
      if (!anchor || !menu) return;

      const margin = 8;
      const roomBelow = window.innerHeight - anchor.bottom;
      const flip = roomBelow < menu.height + margin && anchor.top > menu.height + margin;
      const top = flip ? anchor.top - menu.height - margin : anchor.bottom + margin;
      const preferredLeft = align === 'end' ? anchor.right - menu.width : anchor.left;
      const maxLeft = window.innerWidth - menu.width - margin;
      const left = Math.min(Math.max(margin, preferredLeft), Math.max(margin, maxLeft));

      setPos({ top: Math.max(margin, top), left });
    };

    const frame = requestAnimationFrame(place);
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!ref.current?.contains(target) && !anchorRef.current?.contains(target)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      setPos(null);
    };
  }, [open, align, anchorRef, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label={label}
      style={{
        position: 'fixed',
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className="z-[60] w-[19rem] max-w-[calc(100vw-2rem)] rounded-[24px] border border-mist bg-snow p-4 shadow-[var(--shadow-elevated)]"
    >
      {children}
    </div>,
    document.body,
  );
}

interface TriggerProps {
  id: string;
  text: string;
  placeholder: string;
  error?: string;
  hasValue: boolean;
  disabled?: boolean;
  clearable?: boolean;
  onClick: () => void;
  onClear: () => void;
}

function Trigger({
  id,
  text,
  placeholder,
  error,
  hasValue,
  disabled,
  clearable,
  onClick,
  onClear,
}: TriggerProps) {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        onClick={onClick}
        disabled={disabled}
        aria-haspopup="dialog"
        className={cn(
          'flex min-h-[44px] w-full items-center gap-2 rounded-[6px] border border-pebble bg-snow px-4 py-3 text-left text-body-sm transition-colors',
          'focus:border-monday-violet focus:outline-none focus:ring-1 focus:ring-monday-violet',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasValue ? 'text-ink' : 'text-iron',
          error && 'border-[#e2445c]',
          clearable && hasValue && 'pr-10',
        )}
      >
        <Calendar size={16} aria-hidden="true" className="shrink-0 text-slate" />
        <span className="min-w-0 flex-1 truncate">{hasValue ? text : placeholder}</span>
      </button>

      {clearable && hasValue && !disabled && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t('common.clearDate')}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1.5 text-slate transition-colors hover:bg-cloud hover:text-ink"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

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

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-body-sm font-medium text-ink">
      {children}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-caption text-[#e2445c]">
      {error}
    </p>
  );
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