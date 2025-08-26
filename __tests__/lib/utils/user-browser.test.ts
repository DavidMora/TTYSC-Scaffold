import {
  getUserBrowser,
  getEnvironment,
} from '../../../src/lib/utils/user-browser';

// Mock the global object
const mockGlobal = global as {
  navigator?: { userAgent?: string; platform?: string };
  process?: NodeJS.Process;
  window?: unknown;
};

describe('user-browser utilities', () => {
  let originalNavigator: Navigator | undefined;
  let originalProcess: NodeJS.Process;

  beforeEach(() => {
    originalNavigator = global.navigator;
    originalProcess = global.process;

    // Clear any existing navigator
    delete mockGlobal.navigator;
    mockGlobal.process = { env: {} } as unknown as NodeJS.Process;
    mockGlobal.window = {};
  });

  afterEach(() => {
    mockGlobal.navigator = originalNavigator;
    mockGlobal.process = originalProcess;
    delete mockGlobal.window;
  });

  describe('getUserBrowser', () => {
    it('should return "Unknown on undefined" when window is undefined (server-side)', () => {
      delete mockGlobal.window;
      const result = getUserBrowser();
      expect(result).toBe('Unknown on undefined');
    });

    it('should detect Chrome browser', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Chrome on Win32');
    });

    it('should detect Firefox browser', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Firefox/121.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Firefox on Win32');
    });

    it('should detect Safari browser', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Safari/605.1.15',
        platform: 'MacIntel',
      };
      const result = getUserBrowser();
      expect(result).toBe('Safari on MacIntel');
    });

    it('should detect Edge browser', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Edg/120.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Edge on Win32');
    });

    it('should detect Opera browser with OPR', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 OPR/106.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Opera on Win32');
    });

    it('should detect Opera browser with Opera keyword', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Opera/106.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Opera on Win32');
    });

    it('should prioritize Edge over Chrome when both are present', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Chrome/120.0.0.0 Edg/120.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Edge on Win32');
    });

    it('should prioritize Chrome over Safari when both are present', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 Safari/605.1.15 Chrome/120.0.0.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Chrome on Win32');
    });

    it('should return Unknown for unrecognized browsers', () => {
      mockGlobal.navigator = {
        userAgent: 'Mozilla/5.0 SomeUnknownBrowser/1.0',
        platform: 'Win32',
      };
      const result = getUserBrowser();
      expect(result).toBe('Unknown on Win32');
    });
  });

  describe('getEnvironment', () => {
    it('should return dev when NODE_ENV is development', () => {
      mockGlobal.process = {
        env: { NODE_ENV: 'development' },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('dev');
    });

    it('should return dev when NODE_ENV is test', () => {
      mockGlobal.process = {
        env: { NODE_ENV: 'test' },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('dev');
    });

    it('should return dev when NODE_ENV is dev', () => {
      mockGlobal.process = {
        env: { NODE_ENV: 'dev' },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('dev');
    });

    it('should return prd for production when BACKEND_BASE_URL is not specified', () => {
      mockGlobal.process = {
        env: { NODE_ENV: 'production' },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('prd');
    });

    it('should return stg for production when BACKEND_BASE_URL contains stg', () => {
      mockGlobal.process = {
        env: {
          NODE_ENV: 'production',
          BACKEND_BASE_URL: 'https://api.stg.example.com',
        },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('stg');
    });

    it('should return prd for production when BACKEND_BASE_URL contains prd', () => {
      mockGlobal.process = {
        env: {
          NODE_ENV: 'production',
          BACKEND_BASE_URL: 'https://api.prd.example.com',
        },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('prd');
    });

    it('should prioritize USER_METRICS_ENVIRONMENT over NODE_ENV', () => {
      mockGlobal.process = {
        env: {
          USER_METRICS_ENVIRONMENT: 'stg',
          NODE_ENV: 'production',
        },
      } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('stg');
    });

    it('should return dev when no environment variables are set', () => {
      mockGlobal.process = { env: {} } as unknown as NodeJS.Process;
      const result = getEnvironment();
      expect(result).toBe('dev');
    });
  });
});
