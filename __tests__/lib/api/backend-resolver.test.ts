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

  it('matches route by regex', async () => {
    await withModule(({ resolveBackend }) => {
      const b = resolveBackend('/api/chats/1');
      expect(b.key).toBe('real');
    });
  });

  it('applies env overrides', async () => {
    const prevMockBackend = process.env.MOCK_BACKEND_BASE_URL;
    const prevBackend = process.env.BACKEND_BASE_URL;
    process.env.MOCK_BACKEND_BASE_URL = 'https://override.mock';
    process.env.BACKEND_BASE_URL = 'https://override.real';

    try {
      await withModule(({ resolveBackend }) => {
        expect(resolveBackend('/api/mock/x').baseURL).toBe(
          'https://override.mock'
        );
        expect(resolveBackend('/api/chats').baseURL).toBe(
          'https://override.real'
        );
      });
    } finally {
      // Restore environment variables
      if (prevMockBackend === undefined) {
        delete process.env.MOCK_BACKEND_BASE_URL;
      } else {
        process.env.MOCK_BACKEND_BASE_URL = prevMockBackend;
      }

      if (prevBackend === undefined) {
        delete process.env.BACKEND_BASE_URL;
      } else {
        process.env.BACKEND_BASE_URL = prevBackend;
      }
    }
  });

  it('falls back to default when no route matches', async () => {
    await withModule(({ resolveBackend }) => {
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

  it('ignores invalid regex', async () => {
    await withModule(({ resolveBackend }) => {
      expect(() => resolveBackend('/anything')).not.toThrow();
    });
  });

  it('throws when default backend missing', async () => {
    mockFs.readFileSync.mockReturnValue(
      JSON.stringify({
        default: 'missing',
        backends: { mock: { baseURL: 'x', auth: { type: 'basic' } } },
        routes: [],
      })
    );
    await withModule(({ resolveBackend }) => {
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

  it('throws error when cache is empty and file reading fails', async () => {
    (process.env as Record<string, string>).NODE_ENV = 'development';
    await withModule(({ resolveBackend }) => {
      // Simulate initial read failure with no cache
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('fs error');
      });
      expect(() => resolveBackend('/anything')).toThrow('fs error');
    });
  });

  it('applies FEEDBACK_BACKEND_BASE_URL environment override', async () => {
    const prevFeedback = process.env.FEEDBACK_BACKEND_BASE_URL;
    process.env.FEEDBACK_BACKEND_BASE_URL = 'https://override.feedback';
    const feedbackMap = {
      default: 'feedback',
      backends: {
        feedback: {
          baseURL: 'https://feedback.example',
          auth: { type: 'basic' },
        },
        real: {
          baseURL: 'https://real.example',
          auth: { type: 'bearer-id-token' },
        },
      },
      routes: [],
    };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(feedbackMap));

    try {
      await withModule(({ resolveBackend }) => {
        expect(resolveBackend('/anything').baseURL).toBe(
          'https://override.feedback'
        );
      });
    } finally {
      if (prevFeedback === undefined) {
        delete process.env.FEEDBACK_BACKEND_BASE_URL;
      } else {
        process.env.FEEDBACK_BACKEND_BASE_URL = prevFeedback;
      }
    }
  });

  it('falls back to default when route references non-existent backend', async () => {
    const missingBackendMap = {
      default: 'real',
      backends: {
        real: {
          baseURL: 'https://real.example',
          auth: { type: 'bearer-id-token' },
        },
      },
      routes: [{ pattern: '^/api/missing', backend: 'nonexistent' }],
    };
    mockFs.readFileSync.mockReturnValue(JSON.stringify(missingBackendMap));

    await withModule(({ resolveBackend }) => {
      const result = resolveBackend('/api/missing');
      expect(result.key).toBe('real');
      expect(result.baseURL).toBe('https://real.example');
    });
  });
});
