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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Response = class MockResponse {
  private _body: string;
  private _status: number;

  constructor(
    body: string,
    init?: { status?: number; headers?: Record<string, string> }
  ) {
    this._body = body;
    this._status = init?.status || 200;
  }

  async json() {
    return JSON.parse(this._body);
  }

  get status() {
    return this._status;
  }
};

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
