import { z } from 'zod';

/**
 * Environment variables schema.
 */
export const envSchema = z.object({
  DATABASE_URI: z.string().min(1, 'DATABASE_URI is required'),
  BETTER_AUTH_SECRET: z.string().min(1).optional(),
  BETTER_AUTH_URL: z.url().optional(),
  BETTER_AUTH_COOKIE_DOMAIN: z.string().optional(),
  BETTER_AUTH_COOKIE_PREFIX: z.string().optional().default('better-auth'),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1).optional(),
});

/**
 * Environment variables.
 */
export const env = envSchema.parse({
  DATABASE_URI: process.env.DATABASE_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_COOKIE_DOMAIN: process.env.BETTER_AUTH_COOKIE_DOMAIN,
  BETTER_AUTH_COOKIE_PREFIX: process.env.BETTER_AUTH_COOKIE_PREFIX,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
});

/**
 * Environment variables type.
 */
export type Env = z.infer<typeof envSchema>;

export const isProd = process.env.NODE_ENV === 'production';
