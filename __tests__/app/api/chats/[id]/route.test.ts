/**
 * @jest-environment node
 */
import { GET, PATCH, DELETE } from '@/app/api/chats/[id]/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

const mockId = 'chat123';

function createMockRequest(
  method: string,
  body?: Record<string, unknown>,
  path?: string
) {
  const url = `http://localhost/api/chats/${path || mockId}`;
  return new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('/api/chats/[id]', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Common error handling tests
  const methods = ['GET', 'PATCH', 'DELETE'];
  methods.forEach((method) => {
    it(`should return 400 if id is missing for ${method}`, async () => {
      const req = createMockRequest(method, undefined, '  '); // Invalid path to trigger missing id
      const handler = { GET, PATCH, DELETE }[method] as (
        req: NextRequest
      ) => Promise<Response>;
      const response = await handler(req);
      const responseBody = await response.json();
      expect(response.status).toBe(400);
      expect(responseBody).toEqual({ error: 'Missing id' });
    });
  });

  describe('GET', () => {
    it('should fetch a single chat by id', async () => {
      const mockResponseData = { id: mockId, name: 'Test Chat' };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = createMockRequest('GET');
      const response = await GET(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: `/chats/${mockId}`,
      });
    });

    it('should return an error if the backend fails', async () => {
      mockedBackendRequest.mockRejectedValue(new Error('Backend Error'));
      const req = createMockRequest('GET');
      const response = await GET(req);
      expect(response.status).toBe(500);
    });
  });

  describe('PATCH', () => {
    it('should update a chat', async () => {
      const mockRequestBody = { name: 'Updated Name' };
      const mockResponseData = { id: mockId, name: 'Updated Name' };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = createMockRequest('PATCH', mockRequestBody);
      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        path: `/chats/${mockId}`,
        body: mockRequestBody,
      });
    });

    it('should handle empty body', async () => {
      mockedBackendRequest.mockResolvedValue({
        data: { id: mockId },
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });
      const req = createMockRequest('PATCH');
      await PATCH(req);
      expect(mockedBackendRequest).toHaveBeenCalledWith(
        expect.objectContaining({ body: undefined })
      );
    });

    it('should return an error if the backend fails', async () => {
      mockedBackendRequest.mockRejectedValue(new Error('Backend Error'));
      const req = createMockRequest('PATCH', { name: 'fail' });
      const response = await PATCH(req);
      expect(response.status).toBe(500);
    });
  });

  describe('DELETE', () => {
    it('should delete a chat', async () => {
      mockedBackendRequest.mockResolvedValue({
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        ok: true,
      });

      const req = createMockRequest('DELETE');
      const response = await DELETE(req);

      expect(response.status).toBe(204);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        path: `/chats/${mockId}`,
      });
    });

    it('should return an error if the backend fails', async () => {
      mockedBackendRequest.mockRejectedValue(new Error('Backend Error'));
      const req = createMockRequest('DELETE');
      const response = await DELETE(req);
      expect(response.status).toBe(500);
    });

    it('should handle non-Error exceptions', async () => {
      mockedBackendRequest.mockRejectedValue('a string error');
      const req = createMockRequest('DELETE');
      const response = await DELETE(req);
      const body = await response.json();
      expect(response.status).toBe(500);
      expect(body.error).toBe('a string error');
    });

    it('should handle unknown exceptions', async () => {
      mockedBackendRequest.mockRejectedValue({ an: 'object' });
      const req = createMockRequest('DELETE');
      const response = await DELETE(req);
      const body = await response.json();
      expect(response.status).toBe(500);
      expect(body.error).toBe('Internal error');
    });
  });
});
