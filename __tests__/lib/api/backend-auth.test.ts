import { buildAuthHeaders } from '@/lib/api/backend-auth';
import { getServerSession } from 'next-auth';
import type { BackendDefinition } from '@/lib/api/backend-resolver';

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));

const mockGetServerSession = getServerSession as jest.Mock;

const baseBackend = (auth: BackendDefinition['auth']): BackendDefinition => ({
  baseURL: 'https://example.test',
  auth,
});

describe('buildAuthHeaders', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    mockGetServerSession.mockReset();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns basic auth header when credentials present', async () => {
    process.env.NEXT_PUBLIC_API_USERNAME = 'user';
    process.env.NEXT_PUBLIC_API_PASSWORD = 'pass';
    const res = await buildAuthHeaders({
      backend: baseBackend({ type: 'basic' }),
    });
    expect(res.applied).toBe(true);
    expect(res.headers.Authorization).toBe(
      'Basic ' + Buffer.from('user:pass').toString('base64')
    );
  });

  it('returns applied=false when basic credentials missing', async () => {
    delete process.env.NEXT_PUBLIC_API_USERNAME;
    delete process.env.NEXT_PUBLIC_API_PASSWORD;
    const res = await buildAuthHeaders({
      backend: baseBackend({ type: 'basic' }),
    });
    expect(res).toEqual({ headers: {}, applied: false });
  });

  it('returns bearer header when idToken present', async () => {
    mockGetServerSession.mockResolvedValue({ idToken: 'abc123' });
    const res = await buildAuthHeaders({
      backend: baseBackend({ type: 'bearer-id-token' }),
    });
    expect(res.applied).toBe(true);
    expect(res.headers.Authorization).toBe('Bearer abc123');
    expect(mockGetServerSession).toHaveBeenCalled();
  });

  it('returns applied=false when idToken missing', async () => {
    mockGetServerSession.mockResolvedValue({});
    const res = await buildAuthHeaders({
      backend: baseBackend({ type: 'bearer-id-token' }),
    });
    expect(res).toEqual({ headers: {}, applied: false });
  });

  it('returns applied=false for unsupported auth type (default case)', async () => {
    const backend = {
      baseURL: 'https://x',
      auth: { type: 'unknown' },
    } as unknown as BackendDefinition;
    const res = await buildAuthHeaders({ backend });
    expect(res).toEqual({ headers: {}, applied: false });
  });
});
