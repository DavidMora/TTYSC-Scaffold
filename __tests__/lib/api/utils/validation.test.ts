/**
 * @jest-environment node
 */

/**
 * Tests for validation utilities
 */

import { TextEncoder, TextDecoder } from 'util';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder as typeof globalThis.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

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
}

global.Response = TestResponse as unknown as typeof globalThis.Response;

import { NextRequest } from 'next/server';
import {
  parseJsonBody,
  isValidObjectBody,
  validateRequiredFields,
  validateObjectBody,
  validateRequiredFieldsError,
} from '@/lib/api/utils/validation';

// Mock the apiResponse utility
jest.mock('@/lib/api/utils/response', () => ({
  apiResponse: {
    error: jest.fn((message: string, status: number) => {
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }),
  },
}));

describe('Validation Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.Response = OriginalResponse;
  });

  describe('parseJsonBody', () => {
    it('should parse valid JSON object from request', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ key: 'value', number: 42 }),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toEqual({ key: 'value', number: 42 });
    });

    it('should return error response for null body', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(null),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({
          error: 'Invalid request body: expected JSON object',
        });
      }
    });

    it('should return error response for string body', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify('just a string'),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({
          error: 'Invalid request body: expected JSON object',
        });
      }
    });

    it('should return error response for number body', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(123),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({
          error: 'Invalid request body: expected JSON object',
        });
      }
    });

    it('should return error response for boolean body', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(true),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({
          error: 'Invalid request body: expected JSON object',
        });
      }
    });

    it('should return error response for array body', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify([1, 2, 3]),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({
          error: 'Invalid request body: expected JSON object',
        });
      }
    });

    it('should return error response for invalid JSON', async () => {
      // Create a mock request with invalid JSON
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as NextRequest;

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({ error: 'Invalid JSON in request body' });
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      // Create a mock request that throws on json() call
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
      } as unknown as NextRequest;

      const result = await parseJsonBody(mockRequest);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body).toEqual({ error: 'Invalid JSON in request body' });
      }
    });

    it('should parse empty object successfully', async () => {
      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toEqual({});
    });

    it('should parse nested object successfully', async () => {
      const complexObject = {
        user: { name: 'John', age: 30 },
        preferences: { theme: 'dark', notifications: true },
        tags: ['developer', 'frontend'],
      };

      const mockRequest = new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify(complexObject),
      });

      const result = await parseJsonBody(mockRequest);

      expect(result).toEqual(complexObject);
    });
  });

  describe('isValidObjectBody', () => {
    it('should return true for valid object', () => {
      const result = isValidObjectBody({ key: 'value' });
      expect(result).toBe(true);
    });

    it('should return true for empty object', () => {
      const result = isValidObjectBody({});
      expect(result).toBe(true);
    });

    it('should return true for nested object', () => {
      const result = isValidObjectBody({ user: { name: 'John' } });
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      const result = isValidObjectBody(null);
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      const result = isValidObjectBody(undefined);
      expect(result).toBe(false);
    });

    it('should return false for string', () => {
      const result = isValidObjectBody('string');
      expect(result).toBe(false);
    });

    it('should return false for number', () => {
      const result = isValidObjectBody(42);
      expect(result).toBe(false);
    });

    it('should return false for boolean', () => {
      const result = isValidObjectBody(true);
      expect(result).toBe(false);
    });

    it('should return false for array', () => {
      const result = isValidObjectBody([1, 2, 3]);
      expect(result).toBe(false);
    });

    it('should return false for empty array', () => {
      const result = isValidObjectBody([]);
      expect(result).toBe(false);
    });

    it('should return true for Date object', () => {
      const result = isValidObjectBody(new Date());
      expect(result).toBe(true);
    });

    it('should return false for function', () => {
      const result = isValidObjectBody(() => {});
      expect(result).toBe(false);
    });
  });

  describe('validateRequiredFields', () => {
    it('should return null when all required fields are present', () => {
      const body = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateRequiredFields(body, ['name', 'email']);
      expect(result).toBeNull();
    });

    it('should return null when no fields are required', () => {
      const body = { name: 'John' };
      const result = validateRequiredFields(body, []);
      expect(result).toBeNull();
    });

    it('should return missing fields when some are absent', () => {
      const body = { name: 'John' };
      const result = validateRequiredFields(body, ['name', 'email', 'age']);
      expect(result).toEqual(['email', 'age']);
    });

    it('should return all missing fields when none are present', () => {
      const body = {};
      const result = validateRequiredFields(body, ['name', 'email', 'age']);
      expect(result).toEqual(['name', 'email', 'age']);
    });

    it('should treat undefined values as missing', () => {
      const body = { name: 'John', email: undefined, age: 30 };
      const result = validateRequiredFields(body, ['name', 'email', 'age']);
      expect(result).toEqual(['email']);
    });

    it('should treat null values as missing', () => {
      const body = { name: 'John', email: null, age: 30 };
      const result = validateRequiredFields(body, ['name', 'email', 'age']);
      expect(result).toEqual(['email']);
    });

    it('should treat empty string as missing', () => {
      const body = { name: 'John', email: '', age: 30 };
      const result = validateRequiredFields(body, ['name', 'email', 'age']);
      expect(result).toEqual(['email']);
    });

    it('should treat zero as missing (falsy)', () => {
      const body = { name: 'John', score: 0, age: 30 };
      const result = validateRequiredFields(body, ['name', 'score', 'age']);
      expect(result).toEqual(['score']);
    });

    it('should treat false as missing (falsy)', () => {
      const body = { name: 'John', active: false, age: 30 };
      const result = validateRequiredFields(body, ['name', 'active', 'age']);
      expect(result).toEqual(['active']);
    });

    it('should handle nested field names gracefully', () => {
      const body = { 'user.name': 'John', 'user.email': 'john@example.com' };
      const result = validateRequiredFields(body, ['user.name', 'user.email']);
      expect(result).toBeNull();
    });

    it('should handle special characters in field names', () => {
      const body = { 'field-name': 'value', field_name: 'value2' };
      const result = validateRequiredFields(body, ['field-name', 'field_name']);
      expect(result).toBeNull();
    });
  });

  describe('validateObjectBody', () => {
    it('should return null for valid object', () => {
      const result = validateObjectBody({ key: 'value' });
      expect(result).toBeNull();
    });

    it('should return null for empty object', () => {
      const result = validateObjectBody({});
      expect(result).toBeNull();
    });

    it('should return error response for null', () => {
      const result = validateObjectBody(null);
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });

    it('should return error response for array', () => {
      const result = validateObjectBody([1, 2, 3]);
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });

    it('should return error response for string', () => {
      const result = validateObjectBody('string');
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });

    it('should return error response for number', () => {
      const result = validateObjectBody(42);
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });

    it('should return error response for boolean', () => {
      const result = validateObjectBody(true);
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });

    it('should return error response for undefined', () => {
      const result = validateObjectBody(undefined);
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
      }
    });
  });

  describe('validateRequiredFieldsError', () => {
    it('should return null when all required fields are present', () => {
      const body = { name: 'John', email: 'john@example.com', age: 30 };
      const result = validateRequiredFieldsError(body, ['name', 'email']);
      expect(result).toBeNull();
    });

    it('should return null when no fields are required', () => {
      const body = { name: 'John' };
      const result = validateRequiredFieldsError(body, []);
      expect(result).toBeNull();
    });

    it('should return error response when fields are missing', async () => {
      const body = { name: 'John' };
      const result = validateRequiredFieldsError(body, [
        'name',
        'email',
        'age',
      ]);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: email, age',
        });
      }
    });

    it('should return error response for single missing field', async () => {
      const body = { name: 'John', age: 30 };
      const result = validateRequiredFieldsError(body, [
        'name',
        'email',
        'age',
      ]);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: email',
        });
      }
    });

    it('should return error response when all fields are missing', async () => {
      const body = {};
      const result = validateRequiredFieldsError(body, ['name', 'email']);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: name, email',
        });
      }
    });

    it('should handle empty string values as missing', async () => {
      const body = { name: '', email: 'john@example.com' };
      const result = validateRequiredFieldsError(body, ['name', 'email']);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: name',
        });
      }
    });

    it('should handle null values as missing', async () => {
      const body = { name: null, email: 'john@example.com' };
      const result = validateRequiredFieldsError(body, ['name', 'email']);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: name',
        });
      }
    });

    it('should handle undefined values as missing', async () => {
      const body = { name: undefined, email: 'john@example.com' };
      const result = validateRequiredFieldsError(body, ['name', 'email']);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: name',
        });
      }
    });

    it('should handle falsy values as missing fields', async () => {
      const body = { name: 'John', score: 0, active: false };
      const result = validateRequiredFieldsError(body, [
        'name',
        'score',
        'active',
      ]);

      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const responseBody = await result.json();
        expect(responseBody).toEqual({
          error: 'Missing required fields: score, active',
        });
      }
    });
  });
});
