import { z } from 'zod';

const dateKey = /^\d{4}-\d{2}-\d{2}$/;

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description is too long')
    .optional()
    .or(z.literal('')),
  due_date: z
    .union([z.literal(''), z.string().regex(dateKey, 'Use YYYY-MM-DD')])
    .optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  /** `datetime-local` value, converted to ISO on submit. */
  reminder_at: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskFilterSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  due_date: z.union([z.literal(''), z.string().regex(dateKey)]).optional(),
});

export type TaskFilterValues = z.infer<typeof taskFilterSchema>;
