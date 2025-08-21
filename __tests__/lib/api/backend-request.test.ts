import { backendRequest } from '@/lib/api/backend-request';
import { buildAuthHeaders } from '@/lib/api/backend-auth';
import { resolveBackend, BackendDefinition } from '@/lib/api/backend-resolver';
import httpClient from '@/lib/api/http-client';

jest.mock('@/lib/api/backend-auth', () => ({ buildAuthHeaders: jest.fn() }));
jest.mock('@/lib/api/backend-resolver', () => ({ resolveBackend: jest.fn() }));
jest.mock('@/lib/api/http-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  stream: jest.fn(),
}));

const mockBuildAuthHeaders = buildAuthHeaders as jest.MockedFunction<
  typeof buildAuthHeaders
>;
const mockResolveBackend = resolveBackend as jest.MockedFunction<
  typeof resolveBackend
>;
const mockHttp = httpClient as jest.Mocked<typeof httpClient>;

interface ResolvedBackend extends BackendDefinition {
  key: string;
}
const backendDef: ResolvedBackend = {
  key: 'real',
  baseURL: 'https://api.example',
  auth: { type: 'basic' },
};

describe('backendRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveBackend.mockReturnValue(backendDef);
    mockBuildAuthHeaders.mockResolvedValue({
      headers: { Authorization: 'Basic token' },
      applied: true,
    });
  });

  const baseResp = {
    data: 'ok',
    status: 200,
    statusText: 'OK',
    headers: {},
    ok: true,
  } as const;

  const methodMatrix = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
  it.each(methodMatrix)('calls httpClient for %s', async (method) => {
    const fnMap: Record<string, jest.Mock> = {
      GET: mockHttp.get as unknown as jest.Mock,
      POST: mockHttp.post as unknown as jest.Mock,
      PUT: mockHttp.put as unknown as jest.Mock,
      PATCH: mockHttp.patch as unknown as jest.Mock,
      DELETE: mockHttp.delete as unknown as jest.Mock,
    };
    fnMap[method].mockResolvedValue(baseResp);
    const res = await backendRequest({
      method,
      path: '/resource',
      body: { a: 1 },
    });
    if (method === 'GET' || method === 'DELETE') {
      expect(fnMap[method]).toHaveBeenCalledWith(
        '/resource',
        expect.objectContaining({ baseURL: backendDef.baseURL })
      );
    } else {
      // methods with body include body first then config
      const callArgs = fnMap[method].mock.calls[0];
      expect(callArgs[0]).toBe('/resource');
      expect(callArgs[2]).toEqual(
        expect.objectContaining({ baseURL: backendDef.baseURL })
      );
    }
    expect(res).toBe(baseResp);
  });

  it('passes body for POST', async () => {
    mockHttp.post.mockResolvedValue(baseResp);
    await backendRequest({
      method: 'POST',
      path: '/items',
      body: { name: 'x' },
    });
    expect(mockHttp.post).toHaveBeenCalledWith(
      '/items',
      { name: 'x' },
      expect.any(Object)
    );
  });

  it('streams when stream flag set', async () => {
    interface StreamType {
      [Symbol.asyncIterator](): AsyncIterator<unknown>;
      cancel(): void;
      status: number;
      statusText: string;
      headers: Record<string, string>;
      ok: boolean;
    }
    const asyncIter: StreamType = {
      async *[Symbol.asyncIterator]() {
        /* no chunks */
      },
      cancel: jest.fn(),
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
    };
    (mockHttp.stream as unknown as jest.Mock).mockResolvedValue(asyncIter);
    const res = await backendRequest({
      method: 'POST',
      path: '/stream',
      stream: true,
      body: { q: 1 },
      parser: 'sse',
    });
    expect(mockHttp.stream).toHaveBeenCalledWith(
      '/stream',
      expect.objectContaining({ method: 'POST', parser: 'sse' })
    );
    expect(res).toBe(asyncIter);
  });

  it('merges custom headers', async () => {
    mockHttp.get.mockResolvedValue(baseResp);
    await backendRequest({
      method: 'GET',
      path: '/h',
      headers: { 'X-Test': '1' },
    });
    const call = mockHttp.get.mock.calls[0];
    expect(call[1]!.headers).toMatchObject({
      Authorization: 'Basic token',
      'X-Test': '1',
      'Content-Type': 'application/json',
    });
  });

  it('propagates timeout', async () => {
    mockHttp.get.mockResolvedValue(baseResp);
    await backendRequest({ method: 'GET', path: '/t', timeout: 5000 });
    const call = mockHttp.get.mock.calls[0];
    expect(call[1]!.timeout).toBe(5000);
  });

  it('throws on unsupported method', async () => {
    await expect(
      backendRequest({ method: 'TRACE' as unknown as 'GET', path: '/x' })
    ).rejects.toThrow('Unsupported method');
  });
});
