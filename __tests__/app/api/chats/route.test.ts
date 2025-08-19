/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/chats/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/chats', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should fetch chats from the backend and return them', async () => {
      const mockResponseData = [{ id: 'chat1', name: 'Chat 1' }];
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const response = await GET();
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/chats',
      });
    });

    it('should return an error response if the backend request fails', async () => {
      const errorMessage = 'Backend error';
      mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

      const response = await GET();
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: errorMessage });
    });
  });

  describe('POST', () => {
    it('should create a chat and return the new chat data', async () => {
      const mockRequestBody = { name: 'New Chat' };
      const mockResponseData = { id: 'new-chat', name: 'New Chat' };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost/api/chats', {
        method: 'POST',
        body: JSON.stringify(mockRequestBody),
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/chats',
        body: mockRequestBody,
      });
    });

    it('should handle requests with no body', async () => {
      const mockResponseData = { id: 'new-chat', name: 'New Chat' };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost/api/chats', {
        method: 'POST',
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'POST',
        path: '/chats',
        body: undefined,
      });
    });

    it('should return an error response if the backend request fails', async () => {
      const errorMessage = 'Failed to create chat';
      mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

      const req = new NextRequest('http://localhost/api/chats', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Chat' }),
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: errorMessage });
    });

    it('should handle non-Error exceptions during backend request', async () => {
      mockedBackendRequest.mockRejectedValue({ custom: 'error' });

      const req = new NextRequest('http://localhost/api/chats', {
        method: 'POST',
      });

      const response = await POST(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: 'Internal error' });
    });
  });
});
