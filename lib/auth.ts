import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { betterAuth } from 'better-auth/minimal';
import { nextCookies } from 'better-auth/next-js';
import { oneTap } from 'better-auth/plugins';

import * as schema from '@/db/schema';
import { db } from '@/lib/db';
import { env, isProd } from '@/lib/env';

const baseURL = env.BETTER_AUTH_URL ?? undefined;
const betterAuthSecret = env.BETTER_AUTH_SECRET;
const googleClientId = env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const cookiePrefix = env.BETTER_AUTH_COOKIE_PREFIX;
const cookieDomain = isProd ? (env.BETTER_AUTH_COOKIE_DOMAIN ?? undefined) : undefined;

if (!betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET is required for authentication');
}

if (!googleClientId) {
  throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required for one-tap login');
}

export const auth = betterAuth({
  baseURL,
  secret: betterAuthSecret,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [oneTap({ clientId: googleClientId }), nextCookies()],
  advanced: {
    cookiePrefix,
    crossSubDomainCookies: {
      enabled: true,
    },
    defaultCookieAttributes: {
      secure: isProd,
      sameSite: 'strict',
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      expires: new Date(Date.now() + 60 * 60 * 24 * 30), // 30 days
      domain: cookieDomain,
    },
  },
  // fields configuration (snake_case)
  user: {
    fields: {
      emailVerified: 'email_verified',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  session: {
    fields: {
      expiresAt: 'expires_at',
      userId: 'user_id',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  account: {
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
});
