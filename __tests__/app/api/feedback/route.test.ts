import { POST, GET } from '@/app/api/feedback/route';
import { backendRequest } from '@/lib/api/backend-request';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/api/backend-request', () => ({
  backendRequest: jest.fn(),
}));

// Mock global Response constructor
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Response = class MockResponse {
  private _body: string;
  private _status: number;
  private _headers: Record<string, string>;

  constructor(
    body: string,
    init?: { status?: number; headers?: Record<string, string> }
  ) {
    this._body = body;
    this._status = init?.status || 200;
    this._headers = init?.headers || {};
  }

  async json() {
    return JSON.parse(this._body);
  }

  get status() {
    return this._status;
  }

  get headers() {
    return this._headers;
  }
};

describe('/api/feedback', () => {
  const mockBackendRequest = backendRequest as jest.MockedFunction<
    typeof backendRequest
  >;
  const mockGetServerSession = getServerSession as jest.MockedFunction<
    typeof getServerSession
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FEEDBACK_WORKFLOW_NAME = 'test-workflow';
  });

  describe('POST', () => {
    const mockSession = {
      user: {
        email: 'test@example.com',
        name: 'Test User',
        id: '123',
      },
      expires: '2024-12-31',
    };

    const createMockRequest = (body: any): NextRequest => {
      return {
        json: jest.fn().mockResolvedValue(body),
      } as unknown as NextRequest;
    };

    it('should successfully submit feedback with full payload', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockResolvedValue({
        data: { success: true, message: 'Feedback submitted' },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-123',
        query: 'What is the weather?',
        answer: 'The weather is sunny.',
        comments: 'Great response!',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({
        success: true,
        message: 'Feedback submitted',
      });
    });

    it('should successfully submit feedback with only comments', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockResolvedValue({
        data: { success: true },
        status: 201,
        statusText: 'Created',
        headers: {},
        ok: true,
      });

      const request = createMockRequest({
        feedback: 'feedback provided',
        queryId: 'test-query-456',
        comments: 'Additional context provided',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toEqual({ success: true });
    });

    it('should successfully submit feedback with query and answer but no comments', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const request = createMockRequest({
        feedback: 'bad',
        queryId: 'test-query-789',
        query: 'What is the time?',
        answer: 'The time is 3:00 PM',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ success: true });
    });

    it('should return 401 when user is not authenticated', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Authentication required' });
    });

    it('should return 401 when session exists but user email is missing', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { email: null },
        expires: '2024-12-31',
      });

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(401);
      expect(responseData).toEqual({ error: 'Authentication required' });
    });

    it('should return 400 when feedback is missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Missing required fields: feedback, queryId',
      });
    });

    it('should return 400 when queryId is missing', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        feedback: 'good',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Missing required fields: feedback, queryId',
      });
    });

    it('should return 400 when neither (query and answer) nor comments are provided', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
        query: 'Test query',
        // Missing answer and comments
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Either (query and answer) or comments must be provided',
      });
    });

    it('should return 400 when feedback value is invalid', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);

      const request = createMockRequest({
        feedback: 'invalid',
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        error: 'Feedback must be either "good", "bad", or "feedback provided"',
      });
    });

    it('should handle backend request error and return error response', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockRejectedValue(new Error('Network error'));

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Network error' });
    });

    it('should handle string error and return error response', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockRejectedValue('String error');

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'String error' });
    });

    it('should handle unknown error and return generic error response', async () => {
      mockGetServerSession.mockResolvedValue(mockSession);
      mockBackendRequest.mockRejectedValue({ someProperty: 'value' });

      const request = createMockRequest({
        feedback: 'good',
        queryId: 'test-query-789',
        query: 'Test query',
        answer: 'Test answer',
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Internal server error' });
    });

    it('should use different environment values based on NODE_ENV and BACKEND_BASE_URL', async () => {
      const originalBackendBaseUrl = process.env.BACKEND_BASE_URL;

      try {
        // Test staging environment
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });
        process.env.BACKEND_BASE_URL = 'https://api.stg.example.com';

        mockGetServerSession.mockResolvedValue(mockSession);
        mockBackendRequest.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          ok: true,
        });

        const request = createMockRequest({
          feedback: 'good',
          queryId: 'test-query-789',
          query: 'Test query',
          answer: 'Test answer',
        });

        await POST(request);

        expect(mockBackendRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              Environment: 'stg',
            }),
          })
        );
      } finally {
        process.env.BACKEND_BASE_URL = originalBackendBaseUrl;
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'test',
          configurable: true,
        });
      }
    });

    it('should use prod environment for production URL', async () => {
      const originalBackendBaseUrl = process.env.BACKEND_BASE_URL;

      try {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });
        process.env.BACKEND_BASE_URL = 'https://api.prd.example.com';

        mockGetServerSession.mockResolvedValue(mockSession);
        mockBackendRequest.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          ok: true,
        });

        const request = createMockRequest({
          feedback: 'good',
          queryId: 'test-query-789',
          query: 'Test query',
          answer: 'Test answer',
        });

        await POST(request);

        expect(mockBackendRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              Environment: 'prd',
            }),
          })
        );
      } finally {
        process.env.BACKEND_BASE_URL = originalBackendBaseUrl;
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'test',
          configurable: true,
        });
      }
    });

    it('should use prd environment as default for production', async () => {
      const originalBackendBaseUrl = process.env.BACKEND_BASE_URL;

      try {
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });
        process.env.BACKEND_BASE_URL = 'https://api.example.com';

        mockGetServerSession.mockResolvedValue(mockSession);
        mockBackendRequest.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          ok: true,
        });

        const request = createMockRequest({
          feedback: 'good',
          queryId: 'test-query-789',
          query: 'Test query',
          answer: 'Test answer',
        });

        await POST(request);

        expect(mockBackendRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              Environment: 'prd',
            }),
          })
        );
      } finally {
        process.env.BACKEND_BASE_URL = originalBackendBaseUrl;
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'test',
          configurable: true,
        });
      }
    });

    it('should use default workflow name when FEEDBACK_WORKFLOW_NAME is not set', async () => {
      const originalWorkflowName = process.env.FEEDBACK_WORKFLOW_NAME;

      try {
        delete process.env.FEEDBACK_WORKFLOW_NAME;

        mockGetServerSession.mockResolvedValue(mockSession);
        mockBackendRequest.mockResolvedValue({
          data: { success: true },
          status: 200,
          statusText: 'OK',
          headers: {},
          ok: true,
        });

        const request = createMockRequest({
          feedback: 'good',
          queryId: 'test-query-789',
          query: 'Test query',
          answer: 'Test answer',
        });

        await POST(request);

        expect(mockBackendRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            body: expect.objectContaining({
              WorkflowName: 'ttysc',
            }),
          })
        );
      } finally {
        if (originalWorkflowName !== undefined) {
          process.env.FEEDBACK_WORKFLOW_NAME = originalWorkflowName;
        }
      }
    });
  });

  describe('GET', () => {
    it('should successfully fetch feedback data', async () => {
      mockBackendRequest.mockResolvedValue({
        data: { feedbacks: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual({ feedbacks: [] });
    });

    it('should handle GET request error', async () => {
      mockBackendRequest.mockRejectedValue(new Error('GET error'));

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'GET error' });
    });
  });
});
