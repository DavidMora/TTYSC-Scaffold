/**
 * @jest-environment node
 */
import { GET } from '@/app/api/auxiliary/chart/[chartId]/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/auxiliary/chart/[chartId] route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns error when chartId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/auxiliary/chart/');
      const result = await GET(req, { params: { chartId: '' } });

      expect(result.status).toBe(400);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Missing chartId' });
    });

    it('forwards request to backend without query parameters', async () => {
      const mockData = { chart: 'test' };
      mockedBackendRequest.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart123'
      );
      const result = await GET(req, { params: { chartId: 'chart123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/auxiliary/chart/chart123',
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('application/json');

      const responseData = await result.json();
      expect(responseData).toEqual(mockData);
    });

    it('forwards request with query parameters', async () => {
      const mockData = { chart: 'filtered' };
      mockedBackendRequest.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart123?from=2024-01-01&to=2024-01-31&region=US'
      );
      const result = await GET(req, { params: { chartId: 'chart123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/auxiliary/chart/chart123?from=2024-01-01&to=2024-01-31&region=US',
      });

      expect(result.status).toBe(200);
      const responseData = await result.json();
      expect(responseData).toEqual(mockData);
    });

    it('forwards request with partial query parameters', async () => {
      const mockData = { chart: 'partial' };
      mockedBackendRequest.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart123?from=2024-01-01&region=US'
      );
      const result = await GET(req, { params: { chartId: 'chart123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/auxiliary/chart/chart123?from=2024-01-01&region=US',
      });

      expect(result.status).toBe(200);
      const responseData = await result.json();
      expect(responseData).toEqual(mockData);
    });

    it('encodes chartId in URL path', async () => {
      const mockData = { chart: 'encoded' };
      mockedBackendRequest.mockResolvedValue({
        data: mockData,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const chartIdWithSpecialChars = 'chart/with@special#chars';
      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart%2Fwith%40special%23chars'
      );
      const result = await GET(req, {
        params: { chartId: chartIdWithSpecialChars },
      });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/auxiliary/chart/chart%2Fwith%40special%23chars',
      });

      expect(result.status).toBe(200);
      const responseData = await result.json();
      expect(responseData).toEqual(mockData);
    });

    it('returns error response when backend request throws', async () => {
      const mockError = new Error('Backend error');
      mockedBackendRequest.mockRejectedValue(mockError);

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart123'
      );
      const result = await GET(req, { params: { chartId: 'chart123' } });

      expect(result.status).toBe(500);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Backend error' });
    });

    it('returns generic error message for non-Error exceptions', async () => {
      mockedBackendRequest.mockRejectedValue({ problem: 'oops' });

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/chart123'
      );
      const result = await GET(req, { params: { chartId: 'chart123' } });

      expect(result.status).toBe(500);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Internal error' });
    });

    it('forwards status code from backend', async () => {
      const mockData = { error: 'Not found' };
      mockedBackendRequest.mockResolvedValue({
        data: mockData,
        status: 404,
        statusText: 'Not Found',
        headers: {},
        ok: false,
      });

      const req = new NextRequest(
        'http://localhost:3000/api/auxiliary/chart/nonexistent'
      );
      const result = await GET(req, { params: { chartId: 'nonexistent' } });

      expect(result.status).toBe(404);
      const responseData = await result.json();
      expect(responseData).toEqual(mockData);
    });
  });
});
