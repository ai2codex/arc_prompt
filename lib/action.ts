import { InternalError, isAppError } from '@/lib/errors';
import type { AppErrorCode } from '@/lib/errors';

export type ActionError = {
  code: AppErrorCode;
  message: string;
};

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export async function withAction<T>(handler: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await handler();
    return { ok: true, data };
  } catch (error) {
    const normalized = isAppError(error) ? error : new InternalError('Internal error', error);
    return {
      ok: false,
      error: {
        code: normalized.code,
        message: normalized.message,
      },
    };
  }
}
