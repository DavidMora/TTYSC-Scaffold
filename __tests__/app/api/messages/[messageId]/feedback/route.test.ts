import { PUT } from '@/app/api/messages/[messageId]/feedback/route';
import { backendRequest } from '@/lib/api/backend-request';

// Mock NextResponse and NextRequest first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data: unknown, options?: { status?: number }) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      ok: true,
    })),
  },
  NextRequest: jest.fn(),
}));

// Mock global Response constructor for API routes
global.Response = class MockResponse {
  private _body: string | object | null;
  private _status: number;
  private _statusText: string;
  private _headers: Record<string, string>;
  private _ok: boolean;

  constructor(
    body?: string | object | null,
    init?: {
      status?: number;
      statusText?: string;
      headers?: Record<string, string>;
    }
  ) {
    this._body = body ?? null;
    this._status = init?.status ?? 200;
    this._statusText = init?.statusText ?? '';
    this._headers = init?.headers ?? {};
    this._ok = this._status >= 200 && this._status < 300;
  }

  get status() {
    return this._status;
  }

  get statusText() {
    return this._statusText;
  }

  get ok() {
    return this._ok;
  }

  get headers() {
    return this._headers;
  }

  async json() {
    if (this._body === null) {
      return null;
    }
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    if (typeof this._body === 'object') {
      return this._body;
    }
    throw new Error('Body is not JSON-parseable');
  }

  async text() {
    if (this._body === null) {
      return '';
    }
    if (typeof this._body === 'string') {
      return this._body;
    }
    if (typeof this._body === 'object') {
      return JSON.stringify(this._body);
    }
    throw new Error('Body is not text-parseable');
  }

  // Static methods for TypeScript compatibility
  static error() {
    return new MockResponse(null, { status: 500 });
  }

  static json(
    data: any,
    init?: {
      status?: number;
      statusText?: string;
      headers?: Record<string, string>;
    }
  ) {
    return new MockResponse(JSON.stringify(data), init);
  }

  static redirect(url: string, status: number = 302) {
    return new MockResponse(null, { status, headers: { location: url } });
  }
} as any;

// Mock the backendRequest function
jest.mock('@/lib/api/backend-request', () => ({
  backendRequest: jest.fn(),
}));

import { NextRequest } from 'next/server';

const mockBackendRequest = backendRequest as jest.MockedFunction<
  typeof backendRequest
>;

// Helper function to create mock NextRequest
function createMockRequest(url: string, body?: string): NextRequest {
  const mockRequest = {
    nextUrl: {
      pathname: new URL(url).pathname,
    },
    json: jest.fn().mockImplementation(async () => {
      if (body === 'invalid json') {
        throw new Error('Invalid JSON');
      }
      return body ? JSON.parse(body) : undefined;
    }),
  } as unknown as NextRequest;

  return mockRequest;
}

describe('/api/messages/[messageId]/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    it('should successfully update message feedback', async () => {
      // Mock successful backend response
      mockBackendRequest.mockResolvedValue({
        data: { success: true, feedback: 'positive' },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const feedbackData = { feedback: 'positive', comment: 'Great response!' };
      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        JSON.stringify(feedbackData)
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ success: true, feedback: 'positive' });
      expect(mockBackendRequest).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/messages/test-message-123/feedback',
        body: feedbackData,
      });
    });

    it('should handle missing messageId', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/messages',
        JSON.stringify({ feedback: 'positive' })
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing messageId' });
      expect(mockBackendRequest).not.toHaveBeenCalled();
    });

    it('should handle malformed path without messages section', async () => {
      // Create a request that won't have 'messages' in the path at all
      const mockRequest = {
        nextUrl: {
          pathname: '/api/other/path',
        },
        json: jest.fn().mockResolvedValue({ feedback: 'positive' }),
      } as unknown as NextRequest;

      const response = await PUT(mockRequest);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({ error: 'Missing messageId' });
      expect(mockBackendRequest).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON body gracefully', async () => {
      mockBackendRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        'invalid json'
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ success: true });
      expect(mockBackendRequest).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/messages/test-message-123/feedback',
        body: undefined,
      });
    });

    it('should handle URL encoded messageId', async () => {
      mockBackendRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const encodedMessageId = encodeURIComponent('message with spaces');
      const request = createMockRequest(
        `http://localhost:3000/api/messages/${encodedMessageId}/feedback`,
        JSON.stringify({ feedback: 'negative' })
      );

      const response = await PUT(request);

      expect(response.status).toBe(200);
      expect(mockBackendRequest).toHaveBeenCalledWith({
        method: 'PUT',
        path: '/messages/message with spaces/feedback',
        body: { feedback: 'negative' },
      });
    });

    it('should handle backend request errors with Error object', async () => {
      mockBackendRequest.mockRejectedValue(
        new Error('Backend connection failed')
      );

      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        JSON.stringify({ feedback: 'positive' })
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Backend connection failed' });
    });

    it('should handle backend request errors with string', async () => {
      mockBackendRequest.mockRejectedValue('Network timeout');

      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        JSON.stringify({ feedback: 'positive' })
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Network timeout' });
    });

    it('should handle backend request errors with unknown type', async () => {
      mockBackendRequest.mockRejectedValue({ someObject: 'error' });

      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        JSON.stringify({ feedback: 'positive' })
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal server error' });
    });

    it('should propagate backend status codes', async () => {
      mockBackendRequest.mockResolvedValue({
        data: { error: 'Unauthorized' },
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        ok: false,
      });

      const request = createMockRequest(
        'http://localhost:3000/api/messages/test-message-123/feedback',
        JSON.stringify({ feedback: 'positive' })
      );

      const response = await PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Unauthorized' });
    });
  });
});
