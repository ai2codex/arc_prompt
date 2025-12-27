'use client';

import { createAuthClient } from 'better-auth/client';
import { oneTapClient, type GoogleOneTapActionOptions } from 'better-auth/client/plugins';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const authClient = googleClientId
  ? createAuthClient({
      plugins: [oneTapClient({ clientId: googleClientId })],
    })
  : null;

export async function startOneTap(options?: GoogleOneTapActionOptions) {
  if (!authClient) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required for one-tap login');
  }

  await authClient.oneTap(options);
}

export { authClient };
