'use client';

import { createAuthClient } from 'better-auth/client';
import { oneTapClient, type GoogleOneTapActionOptions } from 'better-auth/client/plugins';

import { toSessionUser } from '@/features/auth/session-user';
import { clearAuthUser, setAuthUser, useAuthUserStore } from '@/features/auth/user-store';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const authClient = googleClientId
  ? createAuthClient({
      plugins: [
        oneTapClient({
          cancelOnTapOutside: false,
          clientId: googleClientId,
          promptOptions: {
            baseDelay: 1000,
            maxAttempts: 10,
          },
        }),
      ],
    })
  : null;

export async function startOneTap(options?: GoogleOneTapActionOptions) {
  if (!authClient) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required for one-tap login');
  }

  await authClient.oneTap(options);
  await syncSessionUser();
}

export async function logout(options: { redirectTo?: string } = { redirectTo: '/' }) {
  if (!authClient) {
    return;
  }
  await authClient.signOut();
  clearAuthUser();

  if (options.redirectTo) {
    window.location.href = options.redirectTo;
  }
}

export { closeAuthModal, openAuthModal, useAuthModalStore } from '@/features/auth/store';
export { authClient, clearAuthUser, setAuthUser, useAuthUserStore };

export async function syncSessionUser() {
  if (!authClient) {
    return null;
  }
  try {
    const result = await authClient.getSession();
    if (result.error) {
      return null;
    }
    const user = toSessionUser(result.data?.user);
    setAuthUser(user);
    return user;
  } catch {
    return null;
  }
}
