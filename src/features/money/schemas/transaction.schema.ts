import { z } from 'zod';

const dateKey = /^\d{4}-\d{2}-\d{2}$/;
const monthKey = /^\d{4}-\d{2}$/;

export const MAX_AMOUNT = 1_000_000_000_000;

export const transactionFormSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z
    .number({ message: 'validation.amountRequired' })
    .int('validation.amountInt')
    .positive('validation.amountPositive')
    .max(MAX_AMOUNT, 'validation.amountTooLarge'),
  category: z
    .string()
    .trim()
    .min(1, 'validation.categoryRequired')
    .max(60, 'validation.categoryMax'),
  note: z.string().trim().max(500, 'validation.noteMax').optional().or(z.literal('')),
  date: z.union([z.literal(''), z.string().regex(dateKey, 'validation.dateFormat')]).optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export const transactionFilterSchema = z.object({
  month: z.string().regex(monthKey, 'Use YYYY-MM'),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().trim().optional(),
});

export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;