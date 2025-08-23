/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('POST /api/chat', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should forward the request to the backend and return the response', async () => {
    const mockRequestBody = { message: 'Hello, world!' };
    const mockResponseData = { reply: 'Hi there!' };
    mockedBackendRequest.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify(mockRequestBody),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResponseData);
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/chat',
      body: mockRequestBody,
    });
  });

  it('should handle requests with no body', async () => {
    const mockResponseData = { reply: 'Hi there!' };
    mockedBackendRequest.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResponseData);
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/chat',
      body: undefined,
    });
  });

  it('should return an error response if the backend request fails', async () => {
    const errorMessage = 'Backend error';
    mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello, world!' }),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: errorMessage });
  });

  it('should return a generic error message for non-Error exceptions', async () => {
    const errorObject = { customError: 'something bad happened' };
    mockedBackendRequest.mockRejectedValue(errorObject);

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello, world!' }),
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: 'Internal server error' });
  });

  it('should handle non-JSON body gracefully', async () => {
    const mockResponseData = { reply: 'Hi there!' };
    mockedBackendRequest.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: 'this is not json',
    });

    const response = await POST(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResponseData);
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/chat',
      body: undefined,
    });
  });
});
