export const APP_ERROR_CODES = {
  /**
   * Validation error.
   */
  VALIDATION_ERROR: 'validation_error',
  /**
   * Not found error.
   */
  NOT_FOUND: 'not_found',
  /**
   * Unauthorized error.
   */
  UNAUTHORIZED: 'unauthorized',
  /**
   * Forbidden error.
   */
  FORBIDDEN: 'forbidden',
  /**
   * Conflict error.
   */
  CONFLICT: 'conflict',
  /**
   * Internal error.
   */
  INTERNAL_ERROR: 'internal_error',
} as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[keyof typeof APP_ERROR_CODES];

/**
 * Base application error class.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly cause?: unknown;

  constructor(message: string, code: AppErrorCode, status: number, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

/**
 * Validation error class.
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', cause?: unknown) {
    super(message, APP_ERROR_CODES.VALIDATION_ERROR, 400, cause);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error class.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not found', cause?: unknown) {
    super(message, APP_ERROR_CODES.NOT_FOUND, 404, cause);
    this.name = 'NotFoundError';
  }
}

/**
 * Unauthorized error class.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', cause?: unknown) {
    super(message, APP_ERROR_CODES.UNAUTHORIZED, 401, cause);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Forbidden error class.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', cause?: unknown) {
    super(message, APP_ERROR_CODES.FORBIDDEN, 403, cause);
    this.name = 'ForbiddenError';
  }
}

/**
 * Conflict error class.
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict', cause?: unknown) {
    super(message, APP_ERROR_CODES.CONFLICT, 409, cause);
    this.name = 'ConflictError';
  }
}

/**
 * Internal error class.
 */
export class InternalError extends AppError {
  constructor(message = 'Internal error', cause?: unknown) {
    super(message, APP_ERROR_CODES.INTERNAL_ERROR, 500, cause);
    this.name = 'InternalError';
  }
}

/**
 * Check if an error is an application error.
 */
export const isAppError = (error: unknown): error is AppError => error instanceof AppError;
