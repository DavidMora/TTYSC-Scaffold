/**
 * Tests for response utilities
 */

// Setup global Response for Node.js environment (restore after tests)
const OriginalResponse = global.Response;

class TestResponse {
  public readonly status: number;
  public readonly statusText: string;
  public readonly ok: boolean;
  public readonly headers: Headers;

  constructor(
    public body: string | null,
    init?: {
      status?: number;
      headers?: Record<string, string> | Headers;
    }
  ) {
    this.status = init?.status ?? 200;
    this.statusText = this.status >= 400 ? 'Error' : 'OK';
    this.ok = this.status >= 200 && this.status < 300;

    // Convert init.headers to Headers object
    if (init?.headers) {
      this.headers = new Headers(init.headers);
    } else {
      this.headers = new Headers();
    }

    // Set default content-type if body is provided and no content-type specified
    if (body && !this.headers.has('content-type')) {
      this.headers.set('content-type', 'application/json');
    }
  }

  async json(): Promise<unknown> {
    if (this.body === null) {
      throw new Error('Body is null');
    }
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text(): Promise<string> {
    if (this.body === null) {
      return '';
    }
    return typeof this.body === 'string'
      ? this.body
      : JSON.stringify(this.body);
  }

  // Custom method for backward compatibility with existing tests
  get(key: string): string | null {
    return this.headers.get(key.toLowerCase());
  }
}

global.Response = TestResponse as unknown as typeof globalThis.Response;

import {
  createErrorResponse,
  createJsonResponse,
  createUpstreamResponse,
  apiResponse,
} from '@/lib/api/utils/response';

describe('Response Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.Response = OriginalResponse;
  });

  describe('createErrorResponse', () => {
    it('should create error response with string message', () => {
      const result = createErrorResponse('Test error', 400);

      expect(result.status).toBe(400);
      expect(result.headers.get('content-type')).toBe('application/json');
    });

    it('should create error response with Error object', () => {
      const error = new Error('Test error message');
      const result = createErrorResponse(error, 500);

      expect(result.status).toBe(500);
    });

    it('should create error response with unknown error type', () => {
      const result = createErrorResponse({ some: 'object' }, 500);

      expect(result.status).toBe(500);
    });

    it('should use default status 500 when no status provided', () => {
      const result = createErrorResponse('Test error');

      expect(result.status).toBe(500);
    });
  });

  describe('createJsonResponse', () => {
    it('should create JSON response with data', () => {
      const testData = { message: 'Success', data: { id: 1 } };
      const result = createJsonResponse(testData);

      expect(result.status).toBe(200);
      expect(result.headers.get('content-type')).toBe('application/json');
    });

    it('should create JSON response with custom status', () => {
      const testData = { message: 'Created' };
      const result = createJsonResponse(testData, 201);

      expect(result.status).toBe(201);
    });

    it('should handle empty data object', () => {
      const result = createJsonResponse({});

      expect(result.status).toBe(200);
    });

    it('should handle null data', () => {
      const result = createJsonResponse(null);

      expect(result.status).toBe(200);
    });
  });

  describe('createUpstreamResponse', () => {
    it('should create upstream response with data and status', () => {
      const upstream = {
        data: { message: 'Success', items: [1, 2, 3] },
        status: 200,
        headers: { 'cache-control': 'max-age=3600' },
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(200);
      expect(result.headers.get('content-type')).toBe('application/json');
    });

    it('should create upstream response with error status', () => {
      const upstream = {
        data: { error: 'Not found' },
        status: 404,
        headers: { 'x-error-source': 'backend' },
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(404);
      expect(result.headers.get('content-type')).toBe('application/json');
    });

    it('should handle empty data', () => {
      const upstream = {
        data: {},
        status: 204,
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(204);
    });

    it('should handle missing headers', () => {
      const upstream = {
        data: { message: 'No headers' },
        status: 200,
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(200);
      expect(result.headers.get('content-type')).toBe('application/json');
    });

    it('should preserve upstream headers when provided', () => {
      const upstream = {
        data: { message: 'Test' },
        status: 200,
        headers: { 'x-custom': 'value' },
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(200);
      expect(result.headers.get('content-type')).toBe('application/json');
    });
  });

  describe('apiResponse', () => {
    it('should expose error, json, and upstream methods', () => {
      expect(typeof apiResponse.error).toBe('function');
      expect(typeof apiResponse.json).toBe('function');
      expect(typeof apiResponse.upstream).toBe('function');
    });
  });
});
