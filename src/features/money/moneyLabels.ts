import type { TransactionType } from '../../types/api.types';

export const TYPE_TONE: Record<TransactionType, string> = {
  INCOME: 'bg-mint text-ink',
  EXPENSE: 'bg-[#ffd4d4] text-ink',
};

/** Quick-pick categories; the form still accepts any custom string. */
export const EXPENSE_CATEGORIES = ['Makan', 'Transport', 'Tagihan', 'Jajan'];

export const INCOME_CATEGORIES = ['Gaji', 'Freelance'];

export const CATEGORY_PRESETS: Record<TransactionType, string[]> = {
  INCOME: INCOME_CATEGORIES,
  EXPENSE: EXPENSE_CATEGORIES,
};

/** Display-only translations for preset categories; the stored value stays put. */
export const CATEGORY_LABEL_KEYS: Record<string, string> = {
  Makan: 'money.presets.Makan',
  Transport: 'money.presets.Transport',
  Tagihan: 'money.presets.Tagihan',
  Jajan: 'money.presets.Jajan',
  Gaji: 'money.presets.Gaji',
  Freelance: 'money.presets.Freelance',
};

/** Budget usage colour coding: <80% mint, 80–99% apricot, ≥100% red. */
export function budgetTone(percent: number): {
  bar: string;
  text: string;
  badge: string;
  status: 'safe' | 'warning' | 'over';
} {
  if (percent >= 100) {
    return {
      bar: 'bg-[#e2445c]',
      text: 'text-[#e2445c]',
      badge: 'bg-[#ffd4d4] text-[#c2410c]',
      status: 'over',
    };
  }
  if (percent >= 80) {
    return {
      bar: 'bg-apricot',
      text: 'text-[#c2410c]',
      badge: 'bg-apricot text-ink',
      status: 'warning',
    };
  }
  return { bar: 'bg-mint', text: 'text-[#2a5c4e]', badge: 'bg-mint text-ink', status: 'safe' };
}