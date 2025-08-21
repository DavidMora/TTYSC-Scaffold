/**
 * @jest-environment node
 */

import { GET } from '@/app/api/auth/provider-sign-out/route';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock auth options
jest.mock('@/lib/auth/auth-options', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
  },
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('/api/auth/provider-sign-out', () => {
  const originalEnv = process.env;
  const baseUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment
    process.env = {
      ...originalEnv,
      NEXTAUTH_URL: baseUrl,
      AUTH_PROCESS: 'azure',
      AZURE_CLIENT_ID: 'test-client-id',
      AZURE_CLIENT_SECRET: 'test-client-secret',
      AZURE_AUTHORIZATION_ENDPOINT:
        'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/authorize',
      AZURE_TOKEN_ENDPOINT:
        'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/token',
      AZURE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/nvlogin',
      AZURE_NEXTAUTH_SECRET: 'test-secret',
      AZURE_TENANT_ID: 'test-tenant-id',
      AZURE_ISSUER_ENDPOINT:
        'https://login.microsoftonline.com/test-tenant/v2.0',
      AZURE_JWKS_ENDPOINT:
        'https://login.microsoftonline.com/test-tenant/discovery/v2.0/keys',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  const createMockRequest = (url: string) => {
    return {
      url,
      method: 'GET',
    } as NextRequest;
  };

  describe('Azure configuration', () => {
    it('should handle Azure logout with session and ID token', async () => {
      const mockSession = {
        idToken: 'test-id-token',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/logout'
      );
      expect(response.headers.get('location')).toContain(
        'id_token_hint=test-id-token'
      );
      expect(response.headers.get('location')).toContain(
        'post_logout_redirect_uri'
      );
    });

    it('should construct Azure logout URL without tenant ID', async () => {
      delete process.env.AZURE_TENANT_ID;

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://login.microsoftonline.com/common/oauth2/v2.0/logout'
      );
    });

    it('should use configured end session endpoint when available', async () => {
      process.env.AZURE_END_SESSION_ENDPOINT =
        'https://custom.endpoint.com/logout';

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://custom.endpoint.com/logout'
      );
    });
  });

  describe('Starfleet configuration', () => {
    beforeEach(() => {
      process.env.AUTH_PROCESS = 'starfleet';
      process.env.STARFLEET_CLIENT_ID = 'starfleet-client-id';
      process.env.STARFLEET_AUTHORIZATION_ENDPOINT =
        'https://starfleet.example.com/auth';
      process.env.STARFLEET_TOKEN_ENDPOINT =
        'https://starfleet.example.com/token';
      process.env.STARFLEET_REDIRECT_URI =
        'http://localhost:3000/api/auth/callback/starfleet';
      process.env.STARFLEET_NEXTAUTH_SECRET = 'starfleet-secret';
    });

    it('should handle Starfleet configuration', async () => {
      const mockSession = {
        idToken: 'starfleet-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      // Should redirect to logged-out since no logout URL can be determined for Starfleet without config
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${baseUrl}/auth/logged-out`
      );
    });

    it('should use Starfleet end session endpoint when configured', async () => {
      process.env.STARFLEET_END_SESSION_ENDPOINT =
        'https://starfleet.example.com/logout';

      const mockSession = {
        idToken: 'starfleet-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://starfleet.example.com/logout'
      );
    });
  });

  describe('Well-known endpoint discovery', () => {
    it('should fetch logout URL from well-known endpoint', async () => {
      process.env.AZURE_WELL_KNOWN_URL =
        'https://login.microsoftonline.com/test-tenant/.well-known/openid_configuration';

      const mockWellKnown = {
        end_session_endpoint: 'https://discovered.logout.url/logout',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockWellKnown),
      } as Response);

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://login.microsoftonline.com/test-tenant/.well-known/openid_configuration'
      );
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://discovered.logout.url/logout'
      );
    });

    it('should handle well-known endpoint fetch error', async () => {
      process.env.AZURE_WELL_KNOWN_URL =
        'https://login.microsoftonline.com/test-tenant/.well-known/openid_configuration';

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(console.error).toHaveBeenCalledWith(
        '[Auth] Error fetching well-known configuration:',
        expect.any(Error)
      );
      // Should fallback to constructed Azure URL
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/logout'
      );
    });

    it('should handle well-known response without end_session_endpoint', async () => {
      process.env.AZURE_WELL_KNOWN_URL =
        'https://login.microsoftonline.com/test-tenant/.well-known/openid_configuration';

      const mockWellKnown = {
        // No end_session_endpoint
        authorization_endpoint:
          'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/authorize',
      };

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockWellKnown),
      } as Response);

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      // Should fallback to constructed Azure URL
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/logout'
      );
    });
  });

  describe('Background logout', () => {
    it('should handle background logout successfully', async () => {
      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      mockFetch.mockResolvedValueOnce({
        status: 200,
      } as Response);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: true,
        message: 'Background federated logout completed',
        status: 200,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'https://login.microsoftonline.com/test-tenant-id/oauth2/v2.0/logout'
        ),
        expect.objectContaining({
          method: 'GET',
          redirect: 'manual',
        })
      );
    });

    it('should handle background logout failure', async () => {
      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: 'Background federated logout failed',
        error: 'Network error',
      });
    });

    it('should handle background logout without ID token', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: 'No ID token available',
      });
    });

    it('should handle background logout without logout URL', async () => {
      // Set up environment without logout URL capability
      delete process.env.AZURE_TENANT_ID;
      delete process.env.AZURE_END_SESSION_ENDPOINT;
      process.env.AUTH_PROCESS = 'starfleet'; // No fallback logout URL

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: 'Unable to determine logout URL',
      });
    });
  });

  describe('ID token handling', () => {
    it('should use ID token from query parameter when session not available', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?idToken=query-id-token`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'id_token_hint=query-id-token'
      );
    });

    it('should prefer session ID token over query parameter', async () => {
      const mockSession = {
        idToken: 'session-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?idToken=query-id-token`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'id_token_hint=session-id-token'
      );
    });

    it('should redirect to logged-out when no ID token available', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${baseUrl}/auth/logged-out`
      );
      expect(console.warn).toHaveBeenCalledWith(
        '[Auth] No ID token available for federated logout'
      );
    });
  });

  describe('Cookie clearing', () => {
    it('should clear NextAuth cookies on successful logout', async () => {
      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);

      // Check that cookies are being cleared
      const setCookieHeaders = response.headers.get('set-cookie');
      expect(setCookieHeaders).toBeTruthy();
    });

    it('should clear cookies even on error', async () => {
      // Mock an error scenario
      mockGetServerSession.mockRejectedValue(new Error('Session error'));

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${baseUrl}/auth/logged-out`
      );

      // Check that cookies are still being cleared
      const setCookieHeaders = response.headers.get('set-cookie');
      expect(setCookieHeaders).toBeTruthy();
    });
  });

  describe('Error handling', () => {
    it('should handle general errors gracefully', async () => {
      mockGetServerSession.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${baseUrl}/auth/logged-out`
      );
      expect(console.error).toHaveBeenCalledWith(
        '[Auth] Error during federated sign-out:',
        expect.any(Error)
      );
    });

    it('should return JSON error for background requests on general error', async () => {
      mockGetServerSession.mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: 'Federated logout failed',
        error: 'Database connection failed',
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockGetServerSession.mockRejectedValue('String error');

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out?background=true`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: false,
        message: 'Federated logout failed',
        error: 'Unknown error',
      });
    });
  });

  describe('Environment variable handling', () => {
    it('should use NEXT_PUBLIC_AUTH_PROCESS when AUTH_PROCESS is not set', async () => {
      delete process.env.AUTH_PROCESS;
      process.env.NEXT_PUBLIC_AUTH_PROCESS = 'starfleet';

      // Set up starfleet config
      process.env.STARFLEET_CLIENT_ID = 'starfleet-client-id';
      process.env.STARFLEET_AUTHORIZATION_ENDPOINT =
        'https://starfleet.example.com/auth';
      process.env.STARFLEET_TOKEN_ENDPOINT =
        'https://starfleet.example.com/token';
      process.env.STARFLEET_REDIRECT_URI =
        'http://localhost:3000/api/auth/callback/starfleet';
      process.env.STARFLEET_NEXTAUTH_SECRET = 'starfleet-secret';

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      // Should redirect to logged-out since no logout URL can be determined for Starfleet
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(
        `${baseUrl}/auth/logged-out`
      );
    });

    it('should default to localhost when NEXTAUTH_URL is not set', async () => {
      delete process.env.NEXTAUTH_URL;

      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain(
        'post_logout_redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flogged-out'
      );
    });
  });

  describe('Logging', () => {
    it('should log session and token information', async () => {
      const mockSession = {
        idToken: 'test-id-token',
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      await GET(request);

      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Starting federated sign-out process'
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Session available:',
        true
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] ID Token available:',
        true
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Access Token available:',
        true
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Refresh Token available:',
        true
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Background logout:',
        false
      );
    });

    it('should log logout URL construction', async () => {
      const mockSession = {
        idToken: 'test-id-token',
      };

      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest(
        `${baseUrl}/api/auth/provider-sign-out`
      );
      await GET(request);

      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Using logout URL:',
        expect.stringContaining('logout')
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Federated logout URL constructed:',
        expect.any(String)
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Redirect URL:',
        expect.stringContaining('/auth/logged-out')
      );
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] ID token length:',
        expect.any(Number)
      );
    });
  });
});
