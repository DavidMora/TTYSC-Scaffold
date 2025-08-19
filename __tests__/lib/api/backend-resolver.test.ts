import fs from 'node:fs';

jest.mock('node:fs', () => ({ readFileSync: jest.fn() }));
const mockFs = fs as jest.Mocked<typeof fs>;

const baseMap = {
  default: 'real',
  backends: {
    real: {
      baseURL: 'https://real.example',
      auth: { type: 'bearer-id-token' },
    },
    mock: { baseURL: 'https://mock.example', auth: { type: 'basic' } },
  },
  routes: [
    { pattern: '^/api/chats', backend: 'real' },
    { pattern: '^/api/mock', backend: 'mock' },
    { pattern: '([invalid', backend: 'real' },
  ],
};

describe('backend-resolver', () => {
  let now = 0;
  beforeEach(() => {
    now = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    mockFs.readFileSync.mockReset();
    mockFs.readFileSync.mockReturnValue(JSON.stringify(baseMap));
    delete process.env.BACKEND_BASE_URL;
    delete process.env.MOCK_BACKEND_BASE_URL;
  });
  afterEach(() => {
    (Date.now as unknown as jest.Mock).mockRestore?.();
  });

  async function withModule(
    fn: (
      mod: typeof import('@/lib/api/backend-resolver')
    ) => void | Promise<void>
  ) {
    await jest.isolateModulesAsync(async () => {
      const mod = await import('@/lib/api/backend-resolver');
      await fn(mod);
    });
  }

  it('matches route by regex', () => {
    withModule(({ resolveBackend }) => {
      const b = resolveBackend('/api/chats/1');
      expect(b.key).toBe('real');
    });
  });

  it('applies env overrides', () => {
    process.env.MOCK_BACKEND_BASE_URL = 'https://override.mock';
    process.env.BACKEND_BASE_URL = 'https://override.real';
    withModule(({ resolveBackend }) => {
      expect(resolveBackend('/api/mock/x').baseURL).toBe(
        'https://override.mock'
      );
      expect(resolveBackend('/api/chats').baseURL).toBe(
        'https://override.real'
      );
    });
  });

  it('falls back to default when no route matches', () => {
    withModule(({ resolveBackend }) => {
      expect(resolveBackend('/none').key).toBe('real');
    });
  });

  it('caches in production (no extra reads)', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'production';
    await withModule(({ resolveBackend }) => {
      resolveBackend('/api/chats');
      mockFs.readFileSync.mockClear();
      resolveBackend('/api/chats');
      expect(mockFs.readFileSync).not.toHaveBeenCalled();
    });
  });

  it('reloads after TTL in development', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    await withModule(({ resolveBackend }) => {
      resolveBackend('/api/chats');
      mockFs.readFileSync.mockClear();
      now += 6000; // expire
      resolveBackend('/api/chats');
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });
  });

  it('ignores invalid regex', () => {
    withModule(({ resolveBackend }) => {
      expect(() => resolveBackend('/anything')).not.toThrow();
    });
  });

  it('throws when default backend missing', () => {
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        default: 'missing',
        backends: { mock: { baseURL: 'x', auth: { type: 'basic' } } },
        routes: [],
      })
    );
    withModule(({ resolveBackend }) => {
      expect(() => resolveBackend('/x')).toThrow('Default backend not defined');
    });
  });

  it('falls back to previous cache on read error', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    // prime with base map
    await withModule(({ resolveBackend }) => {
      resolveBackend('/api/chats');
      // expire and then simulate error
      now += 6000;
      mockFs.readFileSync.mockImplementationOnce(() => {
        throw new Error('fs error');
      });
      const b = resolveBackend('/unmatched');
      expect(b.baseURL).toMatch(/^https:\/\//);
    });
  });
});
