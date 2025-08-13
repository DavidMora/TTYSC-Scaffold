/**
 * @jest-environment node
 */

import { POST } from '@/app/api/auth/restart-session/route';
import { getServerSession } from 'next-auth';

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock the authOptions import
jest.mock('@/lib/auth/auth-options', () => ({
  authOptions: {
    providers: [],
    callbacks: {},
  },
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
  typeof getServerSession
>;

// Mock NextRequest for testing
class MockNextRequest {
  url: string;
  method: string;

  constructor(url: string, options: { method?: string } = {}) {
    this.url = url;
    this.method = options.method || 'POST';
  }
}

describe('/api/auth/restart-session', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log and console.error mocks if needed
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should restart session successfully when user is authenticated', async () => {
    // Mock authenticated session
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockGetServerSession.mockResolvedValue(mockSession);

    const request = new MockNextRequest(
      'http://localhost:3000/api/auth/restart-session',
      {
        method: 'POST',
      }
    ) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      message: 'Session restarted successfully',
      timestamp: expect.any(String),
    });
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it('should return 401 when no session exists', async () => {
    // Mock no session
    mockGetServerSession.mockResolvedValue(null);

    const request = new MockNextRequest(
      'http://localhost:3000/api/auth/restart-session',
      {
        method: 'POST',
      }
    ) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      error: 'No active session to restart',
    });
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it('should handle errors gracefully', async () => {
    // Mock getServerSession to throw an error
    mockGetServerSession.mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new MockNextRequest(
      'http://localhost:3000/api/auth/restart-session',
      {
        method: 'POST',
      }
    ) as any;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to restart session',
    });
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
  });

  it('should log appropriate messages during session restart', async () => {
    const mockSession = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockGetServerSession.mockResolvedValue(mockSession);
    const consoleSpy = jest.spyOn(console, 'log');

    const request = new MockNextRequest(
      'http://localhost:3000/api/auth/restart-session',
      {
        method: 'POST',
      }
    ) as any;

    await POST(request);

    expect(consoleSpy).toHaveBeenCalledWith('[Auth] Restarting session');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Auth] Session restarted successfully for user:',
      'test@example.com'
    );

    consoleSpy.mockRestore();
  });
});
