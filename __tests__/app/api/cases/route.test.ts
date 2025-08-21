/**
 * @jest-environment node
 */
import { GET } from '@/app/api/cases/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/cases', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch cases without query params', async () => {
    const mockResponseData = [{ id: 'case1' }];
    mockedBackendRequest.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    });

    const req = new NextRequest('http://localhost/api/cases');
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResponseData);
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/cases',
    });
  });

  it('should forward analysisNameType query param and encode it', async () => {
    const mockResponseData = [{ id: 'case2' }];
    mockedBackendRequest.mockResolvedValue({
      data: mockResponseData,
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    });

    const req = new NextRequest(
      'http://localhost/api/cases?analysisNameType=foo bar'
    );
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual(mockResponseData);
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'GET',
      path: '/cases?analysisNameType=foo%20bar',
    });
  });

  it('should return an error response if the backend request fails', async () => {
    const errorMessage = 'Backend error';
    mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

    const req = new NextRequest('http://localhost/api/cases');
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: errorMessage });
  });

  it('should return a generic error message for non-Error exceptions', async () => {
    mockedBackendRequest.mockRejectedValue({ problem: 'oops' });

    const req = new NextRequest('http://localhost/api/cases');
    const response = await GET(req);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: 'Internal error' });
  });
});
