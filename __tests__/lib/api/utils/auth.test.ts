/**
 * Tests for authentication utilities
 */
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/auth-options';
import {
  validateSession,
  getAuthenticatedUserEmail,
  createAuthErrorResponse,
  requireAuthentication,
} from '@/lib/api/utils/auth';
import { createErrorResponse } from '@/lib/api/utils/response';

// Mock the dependencies
jest.mock('next-auth/next');
jest.mock('@/lib/auth/auth-options');
jest.mock('@/lib/api/utils/response');

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockCreateErrorResponse = createErrorResponse as jest.MockedFunction<
  typeof createErrorResponse
>;

describe('Authentication Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSession', () => {
    it('should return session when user is authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com', name: 'Test User' },
        expires: '2024-01-01',
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await validateSession();
      expect(result).toEqual(mockSession);
      expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    });

    it('should return null when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await validateSession();
      expect(result).toBeNull();
    });
  });

  describe('getAuthenticatedUserEmail', () => {
    it('should return user email when authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com', name: 'Test User' },
        expires: '2024-01-01',
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getAuthenticatedUserEmail();
      expect(result).toBe('test@example.com');
    });

    it('should return null when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await getAuthenticatedUserEmail();
      expect(result).toBeNull();
    });

    it('should return null when session has no email', async () => {
      const mockSession = {
        user: { name: 'Test User' },
        expires: '2024-01-01',
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await getAuthenticatedUserEmail();
      expect(result).toBeNull();
    });
  });

  describe('createAuthErrorResponse', () => {
    it('should create error response with authentication required message', () => {
      createAuthErrorResponse();
      expect(mockCreateErrorResponse).toHaveBeenCalledWith(
        'Authentication required',
        401
      );
    });
  });

  describe('requireAuthentication', () => {
    it('should return userEmail when authenticated', async () => {
      const mockSession = {
        user: { email: 'test@example.com', name: 'Test User' },
        expires: '2024-01-01',
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireAuthentication();
      expect(result).toEqual({ userEmail: 'test@example.com' });
    });

    it('should return errorResponse when not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const result = await requireAuthentication();
      expect('errorResponse' in result).toBe(true);
    });

    it('should return errorResponse when email is missing', async () => {
      const mockSession = {
        user: { name: 'Test User' },
        expires: '2024-01-01',
      };
      mockGetServerSession.mockResolvedValue(mockSession);

      const result = await requireAuthentication();
      expect('errorResponse' in result).toBe(true);
    });
  });
});
