'use client';

import { toast } from 'sonner';

import { openAuthModal } from '@/features/auth/store';
import type { ActionError, ActionResult } from '@/lib/action';
import { APP_ERROR_CODES } from '@/lib/errors';

const DEFAULT_MESSAGE = 'Please sign in to continue.';

type UnauthorizedOptions = {
  showToast?: boolean;
  showModal?: boolean;
};

export function handleUnauthorizedError(error: ActionError, options?: UnauthorizedOptions) {
  if (error.code !== APP_ERROR_CODES.UNAUTHORIZED) {
    return false;
  }
  const message = error.message || DEFAULT_MESSAGE;
  if (options?.showToast !== false) {
    toast.error(message);
  }
  if (options?.showModal !== false) {
    openAuthModal(message);
  }
  return true;
}

export function handleUnauthorizedResult<T>(
  result: ActionResult<T>,
  options?: UnauthorizedOptions,
) {
  if (result.ok) {
    return false;
  }
  return handleUnauthorizedError(result.error, options);
}
