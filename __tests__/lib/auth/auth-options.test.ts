/**
 * @jest-environment node
 */

// Mock fetch globally
global.fetch = jest.fn();

// Mock environment variables before importing
const mockEnv = {
  AZURE_CLIENT_ID: 'test-client-id',
  AZURE_CLIENT_SECRET: 'test-client-secret',
  AZURE_AUTHORIZATION_ENDPOINT:
    'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/authorize',
  AZURE_TOKEN_ENDPOINT:
    'https://login.microsoftonline.com/test-tenant/oauth2/v2.0/token',
  AZURE_ISSUER_ENDPOINT: 'https://login.microsoftonline.com/test-tenant/v2.0',
  AZURE_JWKS_ENDPOINT:
    'https://login.microsoftonline.com/test-tenant/discovery/v2.0/keys',
  AZURE_REDIRECT_URI: 'http://localhost:3000/api/auth/callback/nvlogin',
  NEXTAUTH_SECRET: 'test-secret',
  AZURE_TENANT_ID: 'test-tenant-id',
};

// Set environment variables before import
Object.assign(process.env, mockEnv);

import { authOptions } from '@/lib/auth/auth-options';

describe('Auth Options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authOptions configuration', () => {
    it('should have correct basic configuration', () => {
      expect(authOptions).toHaveProperty('providers');
      expect(authOptions).toHaveProperty('callbacks');
      expect(authOptions).toHaveProperty('pages');
      expect(authOptions).toHaveProperty('session');
      expect(authOptions).toHaveProperty('secret');
      expect(authOptions.debug).toBe(true);
    });

    it('should have correct pages configuration', () => {
      expect(authOptions.pages).toEqual({
        signIn: '/auth/signin',
        error: '/auth/error',
      });
    });

    it('should have correct session configuration', () => {
      expect(authOptions.session).toEqual({
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    });

    it('should configure provider with correct OAuth settings', () => {
      const provider = authOptions.providers[0] as any;

      expect(provider.id).toBe('nvlogin');
      expect(provider.name).toBe('nvlogin-azure');
      expect(provider.type).toBe('oauth');
      expect(provider.version).toBe('2.0');
      expect(provider).toHaveProperty('clientId');
      expect(provider).toHaveProperty('clientSecret');
    });

    it('should have correct authorization configuration', () => {
      const provider = authOptions.providers[0] as any;

      expect(provider.authorization).toHaveProperty('url');
      expect(provider.authorization.params).toEqual({
        scope: 'openid profile email offline_access User.Read',
        response_type: 'code',
      });
    });

    it('should have correct token configuration', () => {
      const provider = authOptions.providers[0] as any;

      expect(provider.token).toHaveProperty('url');
      expect(provider.token.params).toEqual({
        grant_type: 'authorization_code',
      });
    });
  });

  describe('provider profile mapping', () => {
    it('should map Azure profile correctly with all fields', () => {
      const provider = authOptions.providers[0] as any;
      const mockProfile = {
        id: 'user-123',
        displayName: 'Test User',
        mail: 'test@example.com',
      };

      const result = provider.profile(mockProfile);

      expect(result).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should map Azure profile with fallback fields', () => {
      const provider = authOptions.providers[0] as any;
      const mockProfile = {
        sub: 'user-456',
        name: 'Fallback User',
        userPrincipalName: 'fallback@example.com',
      };

      const result = provider.profile(mockProfile);

      expect(result).toEqual({
        id: 'user-456',
        name: 'Fallback User',
        email: 'fallback@example.com',
      });
    });

    it('should handle profile mapping errors', () => {
      const provider = authOptions.providers[0] as any;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock profile that will cause an error in mapping
      const mockProfile = null;

      expect(() => provider.profile(mockProfile)).toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in profile mapping:',
        expect.any(TypeError)
      );

      consoleSpy.mockRestore();
    });

    it('should use oid as fallback for user id', () => {
      const provider = authOptions.providers[0] as any;
      const mockProfile = {
        oid: 'user-oid-789',
        givenName: 'Given Name',
        email: 'oid@example.com',
      };

      const result = provider.profile(mockProfile);

      expect(result).toEqual({
        id: 'user-oid-789',
        name: 'Given Name',
        email: 'oid@example.com',
      });
    });

    it('should map minimal profile using userPrincipalName when mail missing', () => {
      const provider = authOptions.providers[0] as any;
      const mockProfile = {
        id: 'min-1',
        name: undefined,
        userPrincipalName: 'upn@example.com',
      };
      const result = provider.profile(mockProfile);
      expect(result).toEqual({ id: 'min-1', name: undefined, email: 'upn@example.com' });
    });
  });

  describe('userinfo request', () => {
    it('should make correct userinfo request', async () => {
      const provider = authOptions.providers[0] as any;
      const mockTokens = { access_token: 'test-access-token' };
      const mockUserResponse = { id: 'user-123', displayName: 'Test User' };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve(mockUserResponse),
      });

      const result = await provider.userinfo.request({ tokens: mockTokens });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://graph.microsoft.com/v1.0/me',
        {
          headers: {
            Authorization: 'Bearer test-access-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('JWT callback', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should handle initial sign in', async () => {
      const mockAccount = {
        access_token: 'access-token',
        id_token: 'id-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
      };
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };
      const mockToken = {};

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
        account: mockAccount,
        user: mockUser,
      } as any);

      expect(result).toEqual({
        accessToken: 'access-token',
        idToken: 'id-token',
        accessTokenExpires: 1234567890000,
        refreshToken: 'refresh-token',
        user: { ...mockUser, image: null },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Auth] Initial sign in for user at')
      );
    });

    it('should attach Graph photo as user image when available', async () => {
      const mockAccount = {
        access_token: 'access-token',
        id_token: 'id-token',
        refresh_token: 'refresh-token',
        expires_at: 1234567890,
      };
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Mock fetch for photo endpoint (first and only call in this test)
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: (k: string) => (k.toLowerCase() === 'content-type' ? 'image/png' : null) },
        arrayBuffer: () => Promise.resolve(Uint8Array.from([1, 2, 3, 4]).buffer),
      });

      const result = await authOptions.callbacks!.jwt!({
        token: {},
        account: mockAccount,
        user: mockUser as any,
      } as any);

      expect(result.user).toBeDefined();
      expect(result.user!.image).toMatch(/^data:image\/png;base64,/);
      // Ensure other fields preserved
      expect(result).toEqual(
        expect.objectContaining({
          accessToken: 'access-token',
          idToken: 'id-token',
          refreshToken: 'refresh-token',
        })
      );
    });

    it('should return existing token when not expired', async () => {
      const futureExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes in future
      const mockToken = {
        accessToken: 'existing-token',
        idToken: 'existing-id-token',
        refreshToken: 'existing-refresh-token',
        accessTokenExpires: futureExpiry,
        user: { id: 'user-123' },
      };

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        accessToken: 'existing-token',
        idToken: 'existing-id-token',
        refreshToken: 'existing-refresh-token',
        accessTokenExpires: futureExpiry,
        user: { id: 'user-123' },
      });
    });

    it('should refresh token when expired', async () => {
      const pastExpiry = Date.now() - 1000; // 1 second ago
      const mockToken = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        accessTokenExpires: pastExpiry,
        user: { id: 'user-123' },
      };

      const mockRefreshResponse = {
        access_token: 'new-access-token',
        id_token: 'new-id-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRefreshResponse),
      });

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        idToken: 'new-id-token',
        refreshToken: 'new-refresh-token',
        accessTokenExpires: expect.any(Number),
        error: undefined,
        user: { id: 'user-123' },
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Auth] Token refresh needed at')
      );
    });

    it('should handle refresh token failure', async () => {
      const pastExpiry = Date.now() - 1000;
      const mockToken = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        accessTokenExpires: pastExpiry,
        user: { id: 'user-123' },
      };

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        error: 'RefreshAccessTokenError',
        accessToken: undefined,
        idToken: undefined,
        refreshToken: undefined,
        accessTokenExpires: expect.any(Number),
        user: { id: 'user-123' },
      });
    });

    it('should handle missing refresh token', async () => {
      const pastExpiry = Date.now() - 1000;
      const mockToken = {
        accessToken: 'old-token',
        accessTokenExpires: pastExpiry,
        user: { id: 'user-123' },
      };

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        error: 'RefreshAccessTokenError',
        accessToken: 'old-token',
        accessTokenExpires: pastExpiry,
        user: { id: 'user-123' },
      });
    });

    it('should handle failed refresh response', async () => {
      const pastExpiry = Date.now() - 1000;
      const mockToken = {
        refreshToken: 'refresh-token',
        accessTokenExpires: pastExpiry,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'invalid_grant' }),
      });

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        error: 'RefreshAccessTokenError',
        accessToken: undefined,
        idToken: undefined,
        refreshToken: undefined,
        accessTokenExpires: expect.any(Number),
      });
    });
  });

  describe('Session callback', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should build session with user data from token', async () => {
      const mockSession = {
        expires: '2024-12-31T23:59:59.999Z',
      };
      const mockToken = {
        accessToken: 'access-token',
        idToken: 'id-token',
        accessTokenExpires: 1234567890,
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      };

      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
      } as any);

      expect(result).toEqual({
        expires: '2024-12-31T23:59:59.999Z',
        accessToken: 'access-token',
        idToken: 'id-token',
        accessTokenExpires: 1234567890,
        error: undefined,
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          image: undefined,
        },
      });
    });

    it('should build session with fallback user data', async () => {
      const mockSession = {
        expires: '2024-12-31T23:59:59.999Z',
      };
      const mockToken = {
        accessToken: 'access-token',
        sub: 'user-456',
        name: 'Fallback User',
        email: 'fallback@example.com',
        picture: 'https://example.com/avatar.jpg',
      };

      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
      } as any);

      expect(result.user).toEqual({
        id: 'user-456',
        name: 'Fallback User',
        email: 'fallback@example.com',
        image: 'https://example.com/avatar.jpg',
      });
    });

    it('should handle refresh token error in session', async () => {
      const mockSession = {
        expires: '2024-12-31T23:59:59.999Z',
      };
      const mockToken = {
        error: 'RefreshAccessTokenError',
        user: { id: 'user-123' },
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
      } as any);

      expect(result.error).toBe('RefreshAccessTokenError');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Auth] Refresh token error detected, session is invalid'
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log session building information', async () => {
      const mockSession = { expires: '2024-12-31T23:59:59.999Z' };
      const mockToken = {
        user: { id: 'user-123' },
        accessToken: 'access-token',
      };

      await authOptions.callbacks!.session!({
        session: mockSession,
        token: mockToken,
      } as any);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Auth] Building session, token contains:',
        {
          hasUser: true,
          hasAccessToken: true,
          tokenKeys: expect.any(Array),
        }
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle refresh with missing token endpoint', async () => {
      const pastExpiry = Date.now() - 1000;
      const mockToken = {
        refreshToken: 'refresh-token',
        accessTokenExpires: pastExpiry,
      };

      // Temporarily remove token endpoint
      const originalEndpoint = process.env.AZURE_TOKEN_ENDPOINT;
      delete process.env.AZURE_TOKEN_ENDPOINT;

      const result = await authOptions.callbacks!.jwt!({
        token: mockToken,
      } as any);

      expect(result).toEqual({
        error: 'RefreshAccessTokenError',
        refreshToken: 'refresh-token',
        accessTokenExpires: pastExpiry,
      });

      // Restore endpoint
      process.env.AZURE_TOKEN_ENDPOINT = originalEndpoint;
    });
  });
});
