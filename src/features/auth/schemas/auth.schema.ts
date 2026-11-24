import { z } from 'zod';

const email = z
  .email('validation.emailInvalid')
  .max(255, 'validation.emailTooLong');

const password = z
  .string()
  .min(8, 'validation.passwordMin')
  .max(72, 'validation.passwordTooLong');

const name = z
  .string()
  .trim()
  .min(2, 'validation.nameMin')
  .max(100, 'validation.nameMax');

export const loginSchema = z.object({
  email,
  password,
});

export const registerSchema = z.object({
  name,
  email,
  password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
