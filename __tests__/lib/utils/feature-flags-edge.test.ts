import { isFeatureEnabledEdge, loadFeatureFlagsEdge } from '../../../src/lib/utils/feature-flags-edge';

// Mock console.warn to capture warnings
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('feature-flags-edge', () => {
  // Save original process.env to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env for each test
    jest.resetModules();
    // Properly restore the original env
    process.env = { ...originalEnv };
    mockConsoleWarn.mockClear();
  });

  afterAll(() => {
    // Restore original process.env
    process.env = originalEnv;
    mockConsoleWarn.mockRestore();
  });

  describe('loadFeatureFlagsEdge', () => {
    it('should return feature flags with default values when no environment variables are set', () => {
      // Remove any authentication-related env vars
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true, // default is true when env var is not 'false'
        FF_Chat_Analysis_Screen: true, // default is true when env var is not 'false'
      });
    });

    it('should return enableAuthentication as false when ENABLE_AUTHENTICATION is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      delete process.env.FF_Chat_Analysis_Screen;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: false,
        FF_Chat_Analysis_Screen: true,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is "true"', () => {
      process.env.ENABLE_AUTHENTICATION = 'true';
      delete process.env.FF_Chat_Analysis_Screen;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is any other value', () => {
      process.env.ENABLE_AUTHENTICATION = 'yes';
      delete process.env.FF_Chat_Analysis_Screen;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
      });
    });

    it('should handle errors gracefully and return default flags', () => {
      // Mock process.env to throw an error when accessed
      const originalProcessEnv = process.env;
      Object.defineProperty(process, 'env', {
        get: () => {
          throw new Error('Simulated environment error');
        },
        configurable: true,
      });

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true, // DEFAULT_FLAGS value
        FF_Chat_Analysis_Screen: true, // DEFAULT_FLAGS value
      });
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Error loading feature flags in edge runtime, using defaults:",
        expect.any(Error)
      );

      // Restore process.env
      Object.defineProperty(process, 'env', {
        value: originalProcessEnv,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('isFeatureEnabledEdge', () => {
    it('should return true for enableAuthentication when flag is present and env var is not "false"', () => {
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(true);
    });

    it('should return false for enableAuthentication when env var is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      delete process.env.FF_Chat_Analysis_Screen;

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(false);
    });

    it('should use nullish coalescing fallback when loadFeatureFlagsEdge throws error', () => {
      // Test the error handling path which also exercises the nullish coalescing
      const originalProcessEnv = process.env;
      Object.defineProperty(process, 'env', {
        get: () => {
          throw new Error('Simulated environment error');
        },
        configurable: true,
      });

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(true); // Should use DEFAULT_FLAGS value through the error path
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        "Error loading feature flags in edge runtime, using defaults:",
        expect.any(Error)
      );

      // Restore process.env
      Object.defineProperty(process, 'env', {
        value: originalProcessEnv,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('nullish coalescing coverage (line 31)', () => {
    it('should execute both sides of ?? operator with mock module', () => {
      // Test both normal path and fallback path to ensure 100% branch coverage
      // This tests line 31: return flags[key] ?? DEFAULT_FLAGS[key];
      
      // First test: Normal path (flags[key] exists)
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;
      let result = isFeatureEnabledEdge('enableAuthentication');
      expect(result).toBe(true);
      
      // Second test: Set env to false to get false value
      process.env.ENABLE_AUTHENTICATION = 'false';
      result = isFeatureEnabledEdge('enableAuthentication');
      expect(result).toBe(false);
      
      // Third test: Error condition forces fallback to DEFAULT_FLAGS
      const originalProcessEnv = process.env;
      Object.defineProperty(process, 'env', {
        get: () => {
          throw new Error('Force error for DEFAULT_FLAGS fallback');
        },
        configurable: true,
      });

      result = isFeatureEnabledEdge('enableAuthentication');
      expect(result).toBe(true); // This should use DEFAULT_FLAGS[key]
      
      // Restore process.env
      Object.defineProperty(process, 'env', {
        value: originalProcessEnv,
        configurable: true,
        writable: true,
      });
    });

    it('should test FF_Chat_Analysis_Screen flag behavior', () => {
      // Test the FF_Chat_Analysis_Screen flag to ensure it works correctly
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;
      
      let result = isFeatureEnabledEdge('FF_Chat_Analysis_Screen');
      expect(result).toBe(true);
      
      process.env.FF_Chat_Analysis_Screen = 'false';
      result = isFeatureEnabledEdge('FF_Chat_Analysis_Screen');
      expect(result).toBe(false);
      
      process.env.FF_Chat_Analysis_Screen = 'true';
      result = isFeatureEnabledEdge('FF_Chat_Analysis_Screen');
      expect(result).toBe(true);
    });

    it('should handle unknown flag keys gracefully', () => {
      // Test with an unknown flag key to ensure the nullish coalescing works
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;
      
      // This should return undefined for the flag, then fallback to DEFAULT_FLAGS
      // Since DEFAULT_FLAGS doesn't have 'unknownFlag', it should return undefined
      const result = isFeatureEnabledEdge('unknownFlag' as 'enableAuthentication' | 'FF_Chat_Analysis_Screen');
      expect(result).toBeUndefined();
    });
  });
});
