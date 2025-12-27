'use client';

import { useEffect } from 'react';

import { setAuthUser } from '@/features/auth/user-store';
import type { SessionUser } from '@/features/auth/types';

type AuthHydrationProps = {
  user: SessionUser | null;
};

export function AuthHydration({ user }: AuthHydrationProps) {
  useEffect(() => {
    setAuthUser(user);
  }, [user]);

  return null;
}
