import { z } from 'zod';

/**
 * Environment variables schema.
 */
export const envSchema = z.object({
  DATABASE_URI: z.string().min(1, 'DATABASE_URI is required'),
});

/**
 * Environment variables.
 */
export const env = envSchema.parse({
  DATABASE_URI: process.env.DATABASE_URI,
});

/**
 * Environment variables type.
 */
export type Env = z.infer<typeof envSchema>;
