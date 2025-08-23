/**
 * Authentication utility functions for API routes
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import { createErrorResponse } from './response';

/**
 * Validates that a user is authenticated
 * @returns The session object if authenticated, null otherwise
 */
export async function validateSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Validates that a user is authenticated and has an email
 * @returns The user's email if authenticated, null otherwise
 */
export async function getAuthenticatedUserEmail(): Promise<string | null> {
  const session = await validateSession();
  return session?.user?.email || null;
}

/**
 * Creates an authentication error response
 * @returns Response with 401 Unauthorized
 */
export function createAuthErrorResponse(): Response {
  return createErrorResponse('Authentication required', 401);
}

/**
 * Validates authentication and returns user email or error response
 * @returns Object with either userEmail or errorResponse
 */
export async function requireAuthentication(): Promise<
  { userEmail: string } | { errorResponse: Response }
> {
  const userEmail = await getAuthenticatedUserEmail();
  if (!userEmail) {
    return { errorResponse: createAuthErrorResponse() };
  }
  return { userEmail };
}
