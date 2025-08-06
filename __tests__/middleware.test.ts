import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { isFeatureEnabledEdge } from '@/lib/utils/feature-flags-edge';
import { middleware } from '@/middleware';

// Mock next-auth/jwt
jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

// Mock feature-flags-edge
jest.mock('@/lib/utils/feature-flags-edge', () => ({
  isFeatureEnabledEdge: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
    json: jest.fn(),
  },
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;
const mockIsFeatureEnabledEdge = isFeatureEnabledEdge as jest.MockedFunction<typeof isFeatureEnabledEdge>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('middleware', () => {
  let mockRequest: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      nextUrl: {
        pathname: '/',
      },
      url: 'http://localhost:3000/',
    };

    // Reset mocks
    mockNextResponse.next.mockReturnValue({} as any);
    mockNextResponse.redirect.mockReturnValue({} as any);
    mockNextResponse.json.mockReturnValue({} as any);
    // Default to authentication enabled
    mockIsFeatureEnabledEdge.mockReturnValue(true);
  });

  describe('route skipping', () => {
    it('skips middleware for auth routes', async () => {
      mockRequest.nextUrl.pathname = '/auth/signin';

      await middleware(mockRequest);

      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('skips middleware for public auth API routes', async () => {
      mockRequest.nextUrl.pathname = '/api/auth/session';

      await middleware(mockRequest);

      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('skips middleware for _next routes', async () => {
      mockRequest.nextUrl.pathname = '/_next/static/css/app.css';

      await middleware(mockRequest);

      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('skips middleware for static assets with extensions', async () => {
      mockRequest.nextUrl.pathname = '/favicon.ico';

      await middleware(mockRequest);

      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });

    it('skips middleware for image files', async () => {
      mockRequest.nextUrl.pathname = '/images/logo.png';

      await middleware(mockRequest);

      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
    });
  });

  describe('protected API routes', () => {
    it('returns 401 for protected API routes without token', async () => {
      mockRequest.nextUrl.pathname = '/api/feature-flags';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication required' },
        { status: 401 }
      );
    });

    it('allows access to protected API routes with valid token', async () => {
      mockRequest.nextUrl.pathname = '/api/feature-flags';
      mockGetToken.mockResolvedValue({
        sub: '123',
        name: 'Test User',
        email: 'test@example.com',
      });

      await middleware(mockRequest);

      expect(mockGetToken).toHaveBeenCalled();
      expect(mockNextResponse.next).toHaveBeenCalled();
    });

    it('returns 500 for protected API routes when auth fails', async () => {
      mockRequest.nextUrl.pathname = '/api/feature-flags';
      mockGetToken.mockRejectedValue(new Error('Auth error'));

      await middleware(mockRequest);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Authentication error' },
        { status: 500 }
      );
    });
  });

  describe('authentication checking', () => {
    it('allows access when valid token exists', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue({
        sub: '123',
        name: 'Test User',
        email: 'test@example.com',
      });

      await middleware(mockRequest);

      expect(mockGetToken).toHaveBeenCalledWith({
        req: mockRequest,
        secret: process.env.NEXTAUTH_SECRET,
        // Cookie name is now auto-detected by next-auth
      });
      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('redirects to signin when no token exists', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'http://localhost:3000/dashboard';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard'
        }),
        307
      );
      expect(mockNextResponse.next).not.toHaveBeenCalled();
    });

    it('uses correct cookie name in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });

      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue({ sub: '123' });

      await middleware(mockRequest);

      expect(mockGetToken).toHaveBeenCalledWith({
        req: mockRequest,
        secret: process.env.NEXTAUTH_SECRET,
        // Cookie name is now auto-detected by next-auth
      });

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        configurable: true,
      });
    });

    it('uses correct cookie name in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });

      mockRequest.nextUrl.pathname = '/dashboard';
      mockGetToken.mockResolvedValue({ sub: '123' });

      await middleware(mockRequest);

      expect(mockGetToken).toHaveBeenCalledWith({
        req: mockRequest,
        secret: process.env.NEXTAUTH_SECRET,
        // Cookie name is now auto-detected by next-auth
      });

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        configurable: true,
      });
    });
  });

  describe('error handling', () => {
    it('redirects to signin when getToken throws an error', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'http://localhost:3000/dashboard';
      mockGetToken.mockRejectedValue(new Error('Token validation failed'));

      await middleware(mockRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard'
        }),
        307
      );
      expect(mockNextResponse.next).not.toHaveBeenCalled();
    });

    it('handles various error types gracefully', async () => {
      mockRequest.nextUrl.pathname = '/protected';
      mockRequest.url = 'http://localhost:3000/protected';
      
      // Test with different error types
      const errors = [
        new Error('Network error'),
        'String error',
        null,
        undefined,
        { message: 'Object error' }
      ];

      for (const error of errors) {
        jest.clearAllMocks();
        mockGetToken.mockRejectedValue(error);

        await middleware(mockRequest);

        expect(mockNextResponse.redirect).toHaveBeenCalledWith(
          expect.objectContaining({
            href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fprotected'
          }),
          307
        );
      }
    });
  });

  describe('URL handling', () => {
    it('preserves complex query parameters in callback URL', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'http://localhost:3000/dashboard?tab=analytics&filter=active&sort=date';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining('callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%3Ftab%3Danalytics%26filter%3Dactive%26sort%3Ddate')
        }),
        307
      );
    });

    it('handles root path correctly', async () => {
      mockRequest.nextUrl.pathname = '/';
      mockRequest.url = 'http://localhost:3000/';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2F'
        }),
        307
      );
    });

    it('handles nested paths correctly', async () => {
      mockRequest.nextUrl.pathname = '/admin/users/create';
      mockRequest.url = 'http://localhost:3000/admin/users/create';
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fadmin%2Fusers%2Fcreate'
        }),
        307
      );
    });
  });

  describe('feature flags', () => {
    it('allows access when authentication is disabled via feature flag', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockIsFeatureEnabledEdge.mockReturnValue(false);

      await middleware(mockRequest);

      expect(mockIsFeatureEnabledEdge).toHaveBeenCalledWith('enableAuthentication');
      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockGetToken).not.toHaveBeenCalled();
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('proceeds with authentication when feature flag is enabled', async () => {
      mockRequest.nextUrl.pathname = '/dashboard';
      mockIsFeatureEnabledEdge.mockReturnValue(true);
      mockGetToken.mockResolvedValue({ sub: '123' });

      await middleware(mockRequest);

      expect(mockIsFeatureEnabledEdge).toHaveBeenCalledWith('enableAuthentication');
      expect(mockGetToken).toHaveBeenCalled();
      expect(mockNextResponse.next).toHaveBeenCalled();
    });

    it('defaults to requiring authentication when feature flag check fails', async () => {
      const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockRequest.nextUrl.pathname = '/dashboard';
      mockRequest.url = 'http://localhost:3000/dashboard';
      mockIsFeatureEnabledEdge.mockImplementation(() => {
        throw new Error('Feature flag service unavailable');
      });
      mockGetToken.mockResolvedValue(null);

      await middleware(mockRequest);

      expect(mockIsFeatureEnabledEdge).toHaveBeenCalledWith('enableAuthentication');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to check feature flag in middleware, defaulting to auth enabled:',
        expect.any(Error)
      );
      // Should proceed with authentication check despite feature flag error
      expect(mockGetToken).toHaveBeenCalled();
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        expect.objectContaining({
          href: 'http://localhost:3000/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard'
        }),
        307
      );

      mockConsoleWarn.mockRestore();
    });

    it('handles feature flag error but still allows access with valid token', async () => {
      const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      mockRequest.nextUrl.pathname = '/dashboard';
      mockIsFeatureEnabledEdge.mockImplementation(() => {
        throw new Error('Feature flag service error');
      });
      mockGetToken.mockResolvedValue({ sub: '123', name: 'Test User' });

      await middleware(mockRequest);

      expect(mockIsFeatureEnabledEdge).toHaveBeenCalledWith('enableAuthentication');
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to check feature flag in middleware, defaulting to auth enabled:',
        expect.any(Error)
      );
      // Should proceed with authentication check and allow access with valid token
      expect(mockGetToken).toHaveBeenCalled();
      expect(mockNextResponse.next).toHaveBeenCalled();
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();

      mockConsoleWarn.mockRestore();
    });
  });
});
