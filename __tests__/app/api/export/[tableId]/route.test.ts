/**
 * @jest-environment node
 */
import { GET } from '@/app/api/export/[tableId]/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

describe('/api/export/[tableId] route', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns error when tableId is missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/export/');
      const result = await GET(req, { params: { tableId: '' } });

      expect(result.status).toBe(400);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Missing tableId' });
    });

    it('exports table with default CSV format', async () => {
      const mockBlob = new Blob(['csv,data'], { type: 'text/csv' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/csv',
          'content-disposition': 'attachment; filename="table123.csv"',
        },
        ok: true,
      });

      const req = new NextRequest('http://localhost:3000/api/export/table123');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/export/table123?format=csv',
        headers: { Accept: '*/*' },
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('text/csv');
      expect(result.headers.get('Content-Disposition')).toBe('attachment; filename="table123.csv"');
    });

    it('exports table with specified Excel format', async () => {
      const mockBlob = new Blob(['excel,data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename="table123.xlsx"',
        },
        ok: true,
      });

      const req = new NextRequest('http://localhost:3000/api/export/table123?format=excel');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/export/table123?format=excel',
        headers: { Accept: '*/*' },
      });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(result.headers.get('Content-Disposition')).toBe('attachment; filename="table123.xlsx"');
    });

    it('forwards Accept header from request', async () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/csv',
        },
        ok: true,
      });

      const req = new NextRequest('http://localhost:3000/api/export/table123', {
        headers: { Accept: 'text/csv' },
      });
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/export/table123?format=csv',
        headers: { Accept: 'text/csv' },
      });

      expect(result.status).toBe(200);
    });

    it('encodes tableId and format in URL path', async () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/csv',
        },
        ok: true,
      });

      const tableIdWithSpecialChars = 'table/with@special#chars';
      const req = new NextRequest('http://localhost:3000/api/export/table%2Fwith%40special%23chars?format=csv%2Ftest');
      const result = await GET(req, { params: { tableId: tableIdWithSpecialChars } });

      expect(mockedBackendRequest).toHaveBeenCalledWith({
        method: 'GET',
        path: '/export/table%2Fwith%40special%23chars?format=csv%2Ftest',
        headers: { Accept: '*/*' },
      });

      expect(result.status).toBe(200);
    });

    it('returns response without Content-Disposition when not provided by backend', async () => {
      const mockBlob = new Blob(['data'], { type: 'text/csv' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'text/csv',
        },
        ok: true,
      });

      const req = new NextRequest('http://localhost:3000/api/export/table123');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('text/csv');
      expect(result.headers.get('Content-Disposition')).toBeNull();
    });

    it('uses default content-type when not provided by backend', async () => {
      const mockBlob = new Blob(['data']);
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {},
        ok: true,
      });

      const req = new NextRequest('http://localhost:3000/api/export/table123');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(result.status).toBe(200);
      expect(result.headers.get('Content-Type')).toBe('application/octet-stream');
    });

    it('returns error response when backend request throws', async () => {
      const mockError = new Error('Export failed');
      mockedBackendRequest.mockRejectedValue(mockError);

      const req = new NextRequest('http://localhost:3000/api/export/table123');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(result.status).toBe(500);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Export failed' });
    });

    it('returns generic error message for non-Error exceptions', async () => {
      mockedBackendRequest.mockRejectedValue({ problem: 'oops' });

      const req = new NextRequest('http://localhost:3000/api/export/table123');
      const result = await GET(req, { params: { tableId: 'table123' } });

      expect(result.status).toBe(500);
      const responseBody = await result.json();
      expect(responseBody).toEqual({ error: 'Internal error' });
    });

    it('forwards status code from backend', async () => {
      const mockBlob = new Blob(['error'], { type: 'text/plain' });
      mockedBackendRequest.mockResolvedValue({
        data: mockBlob,
        status: 404,
        statusText: 'Not Found',
        headers: {
          'content-type': 'text/plain',
        },
        ok: false,
      });

      const req = new NextRequest('http://localhost:3000/api/export/nonexistent');
      const result = await GET(req, { params: { tableId: 'nonexistent' } });

      expect(result.status).toBe(404);
      expect(result.headers.get('Content-Type')).toBe('text/plain');
    });
  });
});