import { z } from 'zod';

const email = z
  .email('Invalid email address')
  .max(255, 'Email is too long');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long');

const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long');

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
