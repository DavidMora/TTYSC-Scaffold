/**
 * Tests for response utilities
 */

// Setup global Response for Node.js environment
global.Response = class Response {
  constructor(
    public body: string,
    public init: { status: number }
  ) {
    this.status = init.status;
    this.headers = new Map();
    this.headers.set('content-type', 'application/json');
  }

  status: number;
  headers: Map<string, string>;

  get(key: string) {
    return this.headers.get(key.toLowerCase());
  }

  // Add missing properties for compatibility
  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  get statusText() {
    return this.status >= 400 ? 'Error' : 'OK';
  }

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }

  async text() {
    return typeof this.body === 'string'
      ? this.body
      : JSON.stringify(this.body);
  }
} as any;

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
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(200);
    });

    it('should create upstream response with error status', () => {
      const upstream = {
        data: { error: 'Not found' },
        status: 404,
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(404);
    });

    it('should handle empty data', () => {
      const upstream = {
        data: {},
        status: 204,
      };

      const result = createUpstreamResponse(upstream);

      expect(result.status).toBe(204);
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
