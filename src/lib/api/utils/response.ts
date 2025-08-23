/**
 * Shared response utility functions for API routes
 */

/**
 * Creates a standardized error response
 * @param error - The error object or message
 * @param status - HTTP status code (default: 500)
 * @returns Response object with JSON error
 */
export function createErrorResponse(error: unknown, status = 500): Response {
  let message: string;
  if (typeof error === 'string') message = error;
  else if (error instanceof Error) message = error.message;
  else message = 'Internal server error';

  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a standardized success response with JSON data
 * @param data - The response data
 * @param status - HTTP status code (default: 200)
 * @returns Response object with JSON data
 */
export function createJsonResponse<T = unknown>(
  data: T,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Creates a response from upstream backend data
 * @param upstream - The upstream response data
 * @returns Response object with upstream data and merged headers
 */
export function createUpstreamResponse<T = unknown>(upstream: {
  data: T;
  status: number;
  headers?: Record<string, string>;
}): Response {
  // Clone and merge upstream headers, then enforce JSON content type
  const headers = new Headers(upstream.headers || {});
  headers.set('Content-Type', 'application/json');

  return new Response(JSON.stringify(upstream.data), {
    status: upstream.status,
    headers,
  });
}

/**
 * Common response utilities for API routes
 */
export const apiResponse = {
  error: createErrorResponse,
  json: createJsonResponse,
  upstream: createUpstreamResponse,
};
