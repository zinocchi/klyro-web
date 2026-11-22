import { z } from 'zod';

/**
 * Messages are i18n keys (`validation.*`); translate at render with `t()` so the
 * form follows the active language without rebuilding the schema.
 */
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'validation.nameMin').max(100, 'validation.nameMax'),
  monthly_budget: z
    .string()
    .trim()
    .regex(/^\d*$/, 'validation.budgetInteger')
    .refine((value) => value === '' || Number(value) <= 1_000_000_000_000, 'validation.budgetInteger'),
  daily_reminder_time: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'validation.timeFormat'),
  language: z.enum(['id', 'en']),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z.object({
  current_password: z.string().min(1, 'validation.currentPasswordRequired'),
  new_password: z
    .string()
    .min(8, 'validation.newPasswordMin')
    .max(72, 'validation.newPasswordTooLong'),
});

export type PasswordFormValues = z.infer<typeof passwordSchema>;
