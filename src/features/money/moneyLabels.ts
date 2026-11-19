import type { TransactionType } from '../../types/api.types';

export const TYPE_LABEL: Record<TransactionType, string> = {
  INCOME: 'Pemasukan',
  EXPENSE: 'Pengeluaran',
};

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