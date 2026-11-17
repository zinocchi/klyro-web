import { clsx, type ClassValue } from 'clsx';
import { format, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
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

/** Human friendly date, e.g. `Nov 16, 2026`. */
export function formatDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, 'MMM d, yyyy') : '—';
}

/** Human friendly date with weekday, e.g. `Sunday, Nov 16, 2026`. */
export function formatLongDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, 'EEEE, MMM d, yyyy') : '—';
}

/** `YYYY-MM-DD` for the API, derived from any date input. */
export function formatDateKey(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  return date ? format(date, 'yyyy-MM-dd') : '';
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
