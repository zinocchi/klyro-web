import { z } from 'zod';
import { TARGET_DAYS } from '../../../types/api.types';

export const habitFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'validation.titleRequired')
    .max(200, 'validation.titleMax'),
  target_days: z
    .array(z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']))
    .min(1, 'validation.targetDaysMin')
    .max(7)
    .refine((days) => new Set(days).size === days.length, 'validation.targetDaysUnique'),
  /** `HH:mm` 24-hour, or empty. */
  reminder_time: z
    .union([z.literal(''), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'validation.timeFormat')])
    .optional(),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;

export const TARGET_DAY_OPTIONS = TARGET_DAYS;
