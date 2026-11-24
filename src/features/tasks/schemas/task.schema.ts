import { z } from 'zod';

const dateKey = /^\d{4}-\d{2}-\d{2}$/;

export const taskFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'validation.titleRequired')
    .max(200, 'validation.titleMax'),
  description: z
    .string()
    .trim()
    .max(2000, 'validation.descriptionMax')
    .optional()
    .or(z.literal('')),
  due_date: z
    .union([z.literal(''), z.string().regex(dateKey, 'validation.dateFormat')])
    .optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export const taskFilterSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  due_date: z.union([z.literal(''), z.string().regex(dateKey)]).optional(),
});

export type TaskFilterValues = z.infer<typeof taskFilterSchema>;
