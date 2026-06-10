// filename: server/src/modules/auth/schemas/auth.schema.ts
import { z } from 'zod';

const emailField = z.string().trim().toLowerCase().email('Invalid email address').max(254);

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/\d/, 'Must contain a digit')
  .regex(/[^A-Za-z0-9]/, 'Must contain a symbol');

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name too short').max(80, 'Name too long'),
  email: emailField,
  password: passwordField,
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;
