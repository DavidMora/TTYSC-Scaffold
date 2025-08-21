import { GET } from '@/app/api/auth/config/route';
import { NextRequest } from 'next/server';

// Mock NextResponse first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: any) => ({
      json: () => Promise.resolve(data),
      status: 200,
      ok: true,
    })),
  },
  NextRequest: jest.fn(),
}));

// Import the mocked NextResponse to get the mock function
import { NextResponse } from 'next/server';
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

// Helper function to create mock NextRequest
function createMockRequest(
  url: string = 'http://localhost:3000/api/auth/config',
  referer?: string
): NextRequest {
  const mockRequest = {
    url,
    headers: {
      get: jest.fn((header: string) => {
        if (header === 'referer') return referer || null;
        return null;
      }),
    },
  } as unknown as NextRequest;

  return mockRequest;
}

describe('/api/auth/config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset process.env to original state before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
  });

  it('should return default config when no environment variables are set', async () => {
    // Remove auth-related env vars
    delete process.env.AUTH_PROCESS;
    delete process.env.AUTO_LOGIN;

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it('should return azure auth process when AUTH_PROCESS is set to azure', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'false';

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it('should return disabled auth when AUTH_PROCESS is none', async () => {
    process.env.AUTH_PROCESS = 'none';
    process.env.AUTO_LOGIN = 'false';

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'none',
      isAuthDisabled: true,
      autoLogin: false,
    });
  });

  it('should return auto login when AUTO_LOGIN is true', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: true,
    });
  });

  it('should handle different AUTH_PROCESS values', async () => {
    process.env.AUTH_PROCESS = 'custom';
    process.env.AUTO_LOGIN = 'false';

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'custom',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it('should handle AUTO_LOGIN with non-true values', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'false';

    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    // Test with empty string
    process.env.AUTO_LOGIN = '';
    await GET(createMockRequest());

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });
  });

  it('should disable auto-login when logged_out param is present', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    await GET(
      createMockRequest('http://localhost:3000/api/auth/config?logged_out=true')
    );

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Auth Config] Disabling auto-login due to logout context:',
      {
        hasLoggedOutParam: true,
        isFromLogout: undefined,
        isOnLogoutPage: undefined,
        referer: null,
      }
    );

    consoleLogSpy.mockRestore();
  });

  it('should disable auto-login when referer contains logged_out=true', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    await GET(
      createMockRequest(
        'http://localhost:3000/api/auth/config',
        'http://localhost:3000/some-page?logged_out=true'
      )
    );

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Auth Config] Disabling auto-login due to logout context:',
      {
        hasLoggedOutParam: false,
        isFromLogout: true,
        isOnLogoutPage: false,
        referer: 'http://localhost:3000/some-page?logged_out=true',
      }
    );

    consoleLogSpy.mockRestore();
  });

  it('should disable auto-login when referer contains provider-sign-out', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    await GET(
      createMockRequest(
        'http://localhost:3000/api/auth/config',
        'http://localhost:3000/auth/provider-sign-out'
      )
    );

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Auth Config] Disabling auto-login due to logout context:',
      {
        hasLoggedOutParam: false,
        isFromLogout: true,
        isOnLogoutPage: false,
        referer: 'http://localhost:3000/auth/provider-sign-out',
      }
    );

    consoleLogSpy.mockRestore();
  });

  it('should disable auto-login when referer contains /auth/logged-out', async () => {
    process.env.AUTH_PROCESS = 'azure';
    process.env.AUTO_LOGIN = 'true';

    const consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => {});

    await GET(
      createMockRequest(
        'http://localhost:3000/api/auth/config',
        'http://localhost:3000/auth/logged-out'
      )
    );

    expect(mockNextResponse.json).toHaveBeenCalledWith({
      authProcess: 'azure',
      isAuthDisabled: false,
      autoLogin: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Auth Config] Disabling auto-login due to logout context:',
      {
        hasLoggedOutParam: false,
        isFromLogout: false,
        isOnLogoutPage: true,
        referer: 'http://localhost:3000/auth/logged-out',
      }
    );

    consoleLogSpy.mockRestore();
  });
});
