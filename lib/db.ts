import postgres from 'postgres';

import { drizzle } from 'drizzle-orm/postgres-js';

import { env } from '@/lib/env';

/**
 * Global database instance.
 */
const globalForDb = globalThis as unknown as {
  sql?: ReturnType<typeof postgres>;
};

/**
 * Database connection.
 */
const sql = globalForDb.sql ?? postgres(env.DATABASE_URI, { max: 10 });

/**
 * Set global database instance in development.
 */
if (process.env.NODE_ENV !== 'production') {
  globalForDb.sql = sql;
}

/**
 * Drizzle database instance.
 */
export const db = drizzle(sql);
