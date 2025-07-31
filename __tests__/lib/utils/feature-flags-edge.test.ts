import { loadFeatureFlagsEdge, isFeatureEnabledEdge } from "@/lib/utils/feature-flags-edge";

// Mock console.warn to capture warnings
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('feature-flags-edge', () => {
  // Save original process.env to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env for each test
    jest.resetModules();
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

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true, // default is true when env var is not 'false'
      });
    });

    it('should return enableAuthentication as false when ENABLE_AUTHENTICATION is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: false,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is "true"', () => {
      process.env.ENABLE_AUTHENTICATION = 'true';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is any other value', () => {
      process.env.ENABLE_AUTHENTICATION = 'yes';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
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
    it('should return true for enableAuthentication when ENABLE_AUTHENTICATION is not "false"', () => {
      delete process.env.ENABLE_AUTHENTICATION;

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(true);
    });

    it('should return false for enableAuthentication when ENABLE_AUTHENTICATION is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(false);
    });

    it('should fallback to default flags when feature flag is not found', () => {
      // This test covers the fallback logic: flags[key] ?? DEFAULT_FLAGS[key]
      delete process.env.ENABLE_AUTHENTICATION;

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(true); // Should use DEFAULT_FLAGS value
    });

    it('should handle errors in loadFeatureFlagsEdge and use default flags', () => {
      // Mock process.env to throw an error
      const originalProcessEnv = process.env;
      Object.defineProperty(process, 'env', {
        get: () => {
          throw new Error('Simulated environment error');
        },
        configurable: true,
      });

      const result = isFeatureEnabledEdge('enableAuthentication');

      expect(result).toBe(true); // Should use DEFAULT_FLAGS value
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
});
