/**
 * @jest-environment node
 */
import { GET } from '@/app/api/cases/analysis/route';
import { backendRequest } from '@/lib/api/backend-request';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/cases/analysis', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch cases analysis from the backend and return them', async () => {
    const mockResponseData = [{ id: 'analysis1' }];
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
      path: '/cases/analysis',
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
