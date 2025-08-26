import { POST } from '@/app/api/user-metrics/route';
import { backendRequest } from '@/lib/api/backend-request';
import { requireAuthentication } from '@/lib/api/utils/auth';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');
jest.mock('@/lib/api/utils/auth');

global.Response = class MockResponse {
  constructor(
    public body?: string | object | null,
    public init?: { status?: number }
  ) {}
  get status() {
    return this.init?.status ?? 200;
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
} as any;

describe('/api/user-metrics', () => {
  const mockBackendRequest = backendRequest as jest.MockedFunction<any>;
  const mockRequireAuthentication =
    requireAuthentication as jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.USER_METRICS_WORKFLOW_NAME = 'test-workflow';
  });

  const createMockRequest = (body: any) =>
    ({
      json: jest.fn().mockResolvedValue(body),
      headers: { get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser') },
    }) as unknown as NextRequest;

  describe('POST', () => {
    it('should successfully submit user metrics with valid payload', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });
      mockBackendRequest.mockResolvedValue({ data: { success: true } });

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Query: 'What is the weather?',
        Response: 'The weather is sunny today.',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should return 401 when user is not authenticated', async () => {
      mockRequireAuthentication.mockResolvedValue({
        errorResponse: new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401 }
        ),
      });

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Query: 'Test query',
        Response: 'Test response',
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 400 when JSON parsing fails', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
        headers: { get: jest.fn() },
      } as unknown as NextRequest;

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when request body is null', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest(null);
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when request body is not an object', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest('invalid string');
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when request body is an array', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest(['invalid', 'array']);
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest({ ConversationId: 'conv-123' });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when ConversationId is missing', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest({
        Query: 'Test query',
        Response: 'Test response',
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when Query is missing', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Response: 'Test response',
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 when Response is missing', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Query: 'Test query',
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should use default workflow name when env var is not set', async () => {
      delete process.env.USER_METRICS_WORKFLOW_NAME;
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });
      mockBackendRequest.mockResolvedValue({ data: { success: true } });

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Query: 'Test query',
        Response: 'Test response',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should handle backend errors gracefully', async () => {
      mockRequireAuthentication.mockResolvedValue({
        userEmail: 'test@example.com',
      });
      mockBackendRequest.mockRejectedValue(new Error('Backend error'));

      const request = createMockRequest({
        ConversationId: 'conv-123',
        Query: 'Test query',
        Response: 'Test response',
      });

      const response = await POST(request);
      const responseData = await response.json();
      expect(response.status).toBe(500);
      expect(responseData.error).toBe('Backend error');
    });
  });
});
