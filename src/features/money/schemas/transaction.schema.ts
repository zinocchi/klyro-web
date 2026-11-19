import { z } from 'zod';

const dateKey = /^\d{4}-\d{2}-\d{2}$/;
const monthKey = /^\d{4}-\d{2}$/;

export const MAX_AMOUNT = 1_000_000_000_000;

export const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .number({ message: 'Amount is required' })
    .int('Amount must be a whole number of rupiah')
    .positive('Amount must be greater than zero')
    .max(MAX_AMOUNT, 'Amount is too large'),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(60, 'Category is too long'),
  note: z.string().trim().max(500, 'Note is too long').optional().or(z.literal('')),
  date: z.union([z.literal(''), z.string().regex(dateKey, 'Use YYYY-MM-DD')]).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const transactionFilterSchema = z.object({
  month: z.string().regex(monthKey, 'Use YYYY-MM'),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().trim().optional(),
});

export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;