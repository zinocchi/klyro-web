import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { enUS, id as idLocale, type Locale } from 'date-fns/locale';
import { extendTailwindMerge } from 'tailwind-merge';
import i18n from '../i18n';

/**
 * Tailwind's default config treats every `text-*` class as a colour, so `text-body`
 * (font size) would silently drop `text-snow` (colour). Split the two scales.
 */
const FONT_SIZES = [
  'caption',
  'body-sm',
  'body',
  'subheading',
  'heading-sm',
  'heading',
  'heading-lg',
  'display',
  'xs',
  'sm',
  'base',
  'lg',
  'xl',
  '2xl',
  '3xl',
  '4xl',
  '5xl',
  '6xl',
  '7xl',
  '8xl',
  '9xl',
];

const COLORS = [
  'ink',
  'slate',
  'iron',
  'fog',
  'mist',
  'pebble',
  'cloud',
  'snow',
  'shadow-dust',
  'mint',
  'sky',
  'apricot',
  'lavender',
  'periwinkle',
  'cornflower',
  'aqua',
  'cotton-candy',
  'ultra-violet',
  'electric-cyan',
  'forest',
  'peony',
  'periwinkle-wash',
  'prism',
  'monday-violet',
  'white',
  'black',
  'transparent',
  'current',
  'inherit',
];

const merge = extendTailwindMerge({
  override: {
    theme: {
      text: [{ text: FONT_SIZES }],
      color: [{ text: COLORS }],
    },
  },
});

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return merge(clsx(inputs));
}

/** date-fns locale for the active UI language (`enUS` for `en`, Indonesian otherwise). */
export function dateLocale(): Locale {
  return i18n.language === 'en' ? enUS : idLocale;
}

/** Month/day order follows the language; only the month-day names come from date-fns. */
function datePattern(lang: string, id: string, en: string): string {
  return lang === 'en' ? en : id;
}

/** `YYYY-MM-DD` in local time — the format the API expects for date filters. */
export function toDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

/** Parse `YYYY-MM-DD` (or ISO string) into a Date, safe on invalid input. */
export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Human friendly date, e.g. `Nov 16, 2026` / `16 Nov 2026`. */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return format(date, datePattern(i18n.language, 'd MMM yyyy', 'MMM d, yyyy'), {
    locale: dateLocale(),
  });
}

/** Human friendly date + time, e.g. `Nov 25, 09:00` / `25 Nov, 09:00`. */
export function formatDateTime(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return format(date, datePattern(i18n.language, 'd MMM, HH:mm', 'MMM d, HH:mm'), {
    locale: dateLocale(),
  });
}

/** `YYYY-MM-DDTHH:mm` (local) — the value shape the note reminder form stores. */
export function toDateTimeInputValue(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
}

/** Human friendly date with weekday, e.g. `Sunday, Nov 16, 2026` / `Minggu, 16 November 2026`. */
export function formatLongDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return '—';
  return format(date, datePattern(i18n.language, 'EEEE, d MMMM yyyy', 'EEEE, MMM d, yyyy'), {
    locale: dateLocale(),
  });
}

/** `YYYY-MM-DD` for the API, derived from any date input. */
export function formatDateKey(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, 'yyyy-MM-dd') : '';
}

/** `HH:mm` in local time, or an empty string when the value is unparseable. */
export function formatTimeKey(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, 'HH:mm') : '';
}

/** Shift a `YYYY-MM-DD` key by whole days, staying in key format. */
export function shiftDateKey(key: string, days: number): string {
  const date = parseDate(key);
  if (!date) return key;
  date.setDate(date.getDate() + days);
  return format(date, 'yyyy-MM-dd');
}

/** True when the given key is the current local day. */
export function isToday(key: string): boolean {
  return key === toDateKey();
}

/** `YYYY-MM` in local time — the month filter the API expects. */
export function toMonthKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM');
}

/** Format integer rupiah as `Rp 10.000`. Negative amounts keep the minus before the symbol. */
export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}Rp ${Math.abs(rounded).toLocaleString('id-ID')}`;
}
