/**
 * @jest-environment node
 */
import { GET, PATCH } from '@/app/api/settings/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/settings', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should fetch settings from the backend and return them', async () => {
      const mockResponseData = { theme: 'dark' };
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
        path: '/settings',
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

    it('should return a generic error message for non-Error exceptions', async () => {
      mockedBackendRequest.mockRejectedValue({ problem: 'oops' });

      const response = await GET();
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: 'Internal error' });
    });
  });

  describe('PATCH', () => {
    it('should update settings with provided body', async () => {
      const mockRequestBody = { theme: 'light' };
      const mockResponseData = { success: true };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost/api/settings', {
        method: 'PATCH',
        body: JSON.stringify(mockRequestBody),
      });

      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/settings',
        body: mockRequestBody,
      });
    });

    it('should handle requests with no body', async () => {
      const mockResponseData = { success: true };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost/api/settings', {
        method: 'PATCH',
      });

      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/settings',
        body: undefined,
      });
    });

    it('should handle non-JSON body gracefully', async () => {
      const mockResponseData = { success: true };
      mockedBackendRequest.mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost/api/settings', {
        method: 'PATCH',
        body: 'not a json',
      });

      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toEqual(mockResponseData);
      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'PATCH',
        path: '/settings',
        body: undefined,
      });
    });

    it('should return an error response if the backend request fails', async () => {
      const errorMessage = 'Failed to update settings';
      mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

      const req = new NextRequest('http://localhost/api/settings', {
        method: 'PATCH',
        body: JSON.stringify({ theme: 'dark' }),
      });

      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: errorMessage });
    });

    it('should return a generic error message for non-Error exceptions', async () => {
      mockedBackendRequest.mockRejectedValue({ oops: true });

      const req = new NextRequest('http://localhost/api/settings', {
        method: 'PATCH',
      });

      const response = await PATCH(req);
      const responseBody = await response.json();

      expect(response.status).toBe(500);
      expect(responseBody).toEqual({ error: 'Internal error' });
    });
  });
});


