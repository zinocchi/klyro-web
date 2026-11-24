import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  PickerError as ErrorText,
  PickerLabel as Label,
  PickerPopover as Popover,
  PickerTrigger as Trigger,
} from './pickerParts';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
/** Every minute of the hour, 00–59. */
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const ITEM_HEIGHT = 36;
const VISIBLE_ROWS = 3;

interface WheelProps {
  items: string[];
  value: string;
  onPick: (value: string) => void;
  label: string;
}

/** One snap-scrolling column, iOS-timer style: the centred row is the value. */
function Wheel({ items, value, onPick, label }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | null>(null);
  const latest = useRef({ items, value });

  useEffect(() => {
    latest.current = { items, value };
  });

  // Centre the current value when the wheel mounts (i.e. when the popover opens).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { items: list, value: current } = latest.current;
    const index = list.indexOf(current);
    el.scrollTop = (index < 0 ? 0 : index) * ITEM_HEIGHT;
  }, []);

  useEffect(
    () => () => {
      if (settle.current) window.clearTimeout(settle.current);
    },
    [],
  );

  const handleScroll = () => {
    if (settle.current) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      // Still gliding between snap points — check again instead of committing
      // a row the user is only passing through.
      if (Math.abs(el.scrollTop - index * ITEM_HEIGHT) > 4) {
        handleScroll();
        return;
      }
      const next = items[Math.min(items.length - 1, Math.max(0, index))];
      if (next && next !== value) onPick(next);
    }, 140);
  };

  return (
    <div className="relative min-w-0 flex-1">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 rounded-[6px] bg-periwinkle-wash"
      />
      <div
        ref={ref}
        role="listbox"
        aria-label={label}
        onScroll={handleScroll}
        style={{
          height: ITEM_HEIGHT * VISIBLE_ROWS,
          paddingTop: ITEM_HEIGHT,
          paddingBottom: ITEM_HEIGHT,
        }}
        className={cn(
          'snap-y snap-mandatory overflow-y-auto overscroll-contain',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          '[mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]',
        )}
      >
        {items.map((item) => (
          <button
            key={item}
            type="button"
            role="option"
            aria-selected={item === value}
            onClick={() => {
              onPick(item);
              ref.current?.scrollTo({
                top: items.indexOf(item) * ITEM_HEIGHT,
                behavior: 'smooth',
              });
            }}
            style={{ height: ITEM_HEIGHT }}
            className={cn(
              'flex w-full snap-center items-center justify-center text-body-sm transition-colors',
              item === value ? 'font-medium text-monday-violet' : 'text-slate',
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export interface TimePickerProps {
  label?: string;
  error?: string;
  /** `HH:mm` 24-hour, or an empty string. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  align?: 'start' | 'end';
}

/** Custom 24-hour time picker mirroring `DatePicker` (DESIGN.md: 6px trigger, 24px popover). */
export function TimePicker({
  value,
  onChange,
  label,
  error,
  placeholder,
  disabled,
  clearable = false,
  align = 'start',
}: TimePickerProps) {
  const { t } = useTranslation();
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const [hour = '', minute = ''] = value ? value.split(':') : [];

  const setHour = (next: string) => onChange(`${next}:${minute || '00'}`);
  const setMinute = (next: string) => onChange(`${hour || '00'}:${next}`);

  const pickNow = () => {
    const now = new Date();
    onChange(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    );
    setOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative" ref={anchorRef}>
        <Trigger
          id={id}
          icon={<Clock size={16} />}
          text={value}
          placeholder={placeholder ?? t('common.selectTime')}
          error={error}
          hasValue={Boolean(value)}
          disabled={disabled}
          clearable={clearable}
          clearLabel={t('common.clearTime')}
          onClick={() => setOpen((v) => !v)}
          onClear={() => onChange('')}
        />

        <Popover
          open={open}
          onClose={() => setOpen(false)}
          anchorRef={anchorRef}
          align={align}
          label={t('common.selectTime')}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="flex-1 text-center text-caption text-iron">{t('common.hour')}</span>
              <span className="w-2" />
              <span className="flex-1 text-center text-caption text-iron">
                {t('common.minute')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Wheel items={HOURS} value={hour} onPick={setHour} label={t('common.hour')} />
              <span aria-hidden="true" className="text-subheading font-medium text-iron">
                :
              </span>
              <Wheel
                items={MINUTES}
                value={minute}
                onPick={setMinute}
                label={t('common.minute')}
              />
            </div>

          <div className="mt-3 flex items-center justify-between border-t border-pebble pt-3">
            <button
              type="button"
              onClick={pickNow}
              className="text-caption font-medium text-monday-violet hover:underline"
            >
              {t('common.now')}
            </button>
            {clearable && value && (
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
          </div>
        </Popover>
      </div>
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}
