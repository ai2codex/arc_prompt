import { headers } from 'next/headers';

import { toSessionUser } from '@/features/auth/session-user';
import type { SessionUser } from '@/features/auth/types';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export async function getSessionUser(): Promise<SessionUser | null> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  return toSessionUser(session?.user);
}

export async function requireSessionUser(message?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError(message ?? 'Unauthorized');
  }
  return user;
}
