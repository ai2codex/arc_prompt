import ky from 'ky';

/**
 * Default timeout for HTTP requests.
 */
export const HTTP_TIMEOUT_MS = 10_000;

/**
 * Default HTTP configuration for ky.
 */
export const httpDefaults = {
  timeout: HTTP_TIMEOUT_MS,
  headers: {
    accept: 'application/json',
  },
};

/**
 * HTTP client instance.
 */
export const http = ky.create(httpDefaults);
