import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export type SessionUser = {
  id: string;
  name: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name ?? session.user.id,
  };
}

export async function requireSessionUser(message?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new UnauthorizedError(message ?? 'Unauthorized');
  }
  return user;
}
