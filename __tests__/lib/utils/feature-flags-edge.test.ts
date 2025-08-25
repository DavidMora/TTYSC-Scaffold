import {
  isFeatureEnabledEdge,
  loadFeatureFlagsEdge,
} from '../../../src/lib/utils/feature-flags-edge';

// Mock console.warn to capture warnings
const mockConsoleWarn = jest
  .spyOn(console, 'warn')
  .mockImplementation(() => {});

describe('feature-flags-edge', () => {
  // Only manipulate specific feature-flag-related env vars in tests

  beforeEach(() => {
    // Reset process.env for each test
    jest.resetModules();
    // Only reset feature-flag-related env vars to avoid side effects in CI
    const keysToReset = [
      'ENABLE_AUTHENTICATION',
      'FF_CHAT_ANALYSIS_SCREEN',
      'FF_CHAT_ANALYSIS_SCREEN',
      'FF_FULL_PAGE_NAVIGATION',
      'FF_SIDE_NAVBAR',
      'FEATURE_FLAG_ENABLE_AUTHENTICATION',
      'FF_MODALS',
      'FF_RAW_DATA_NAVIGATION',
    ];
    for (const key of keysToReset) {
      delete (process.env as Record<string, string | undefined>)[key];
    }
    mockConsoleWarn.mockClear();
  });

  afterAll(() => {
    // Restore only the feature-flag-related keys to a clean state
    const keysToReset = [
      'ENABLE_AUTHENTICATION',
      'FF_CHAT_ANALYSIS_SCREEN',
      'FF_CHAT_ANALYSIS_SCREEN',
      'FF_FULL_PAGE_NAVIGATION',
      'FF_SIDE_NAVBAR',
      'FEATURE_FLAG_ENABLE_AUTHENTICATION',
      'FF_MODALS',
      'FF_RAW_DATA_NAVIGATION',
    ];
    for (const key of keysToReset) {
      delete (process.env as Record<string, string | undefined>)[key];
    }
    mockConsoleWarn.mockRestore();
  });

  describe('loadFeatureFlagsEdge', () => {
    it('should return feature flags with default values when no environment variables are set', () => {
      // Remove any authentication-related env vars
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      delete process.env.FF_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true, // from DEFAULT_FLAGS
        FF_CHAT_ANALYSIS_SCREEN: true, // from DEFAULT_FLAGS
        FF_FULL_PAGE_NAVIGATION: true, // from DEFAULT_FLAGS
        FF_SIDE_NAVBAR: true, // from DEFAULT_FLAGS
        FF_MODALS: true, // from DEFAULT_FLAGS
        FF_RAW_DATA_NAVIGATION: false, // from DEFAULT_FLAGS
      });
    });

    it('should return enableAuthentication as false when ENABLE_AUTHENTICATION is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      delete process.env.FF_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: false,
        FF_CHAT_ANALYSIS_SCREEN: true,
        FF_FULL_PAGE_NAVIGATION: true,
        FF_SIDE_NAVBAR: true,
        FF_MODALS: true,
        FF_RAW_DATA_NAVIGATION: false,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is "true"', () => {
      process.env.ENABLE_AUTHENTICATION = 'true';
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      delete process.env.FF_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_CHAT_ANALYSIS_SCREEN: true,
        FF_FULL_PAGE_NAVIGATION: true,
        FF_SIDE_NAVBAR: true,
        FF_MODALS: true,
        FF_RAW_DATA_NAVIGATION: false,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is any other value', () => {
      process.env.ENABLE_AUTHENTICATION = 'yes';
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      delete process.env.FF_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_CHAT_ANALYSIS_SCREEN: true,
        FF_FULL_PAGE_NAVIGATION: true,
        FF_SIDE_NAVBAR: true,
        FF_MODALS: true,
        FF_RAW_DATA_NAVIGATION: false,
      });
    });

    it('should return FF_RAW_DATA_NAVIGATION as false when FF_RAW_DATA_NAVIGATION is "false"', () => {
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      process.env.FF_RAW_DATA_NAVIGATION = 'false';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_CHAT_ANALYSIS_SCREEN: true,
        FF_FULL_PAGE_NAVIGATION: true,
        FF_SIDE_NAVBAR: true,
        FF_MODALS: true,
        FF_RAW_DATA_NAVIGATION: false,
      });
    });

    it('should return FF_RAW_DATA_NAVIGATION as true when FF_RAW_DATA_NAVIGATION is "true"', () => {
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_CHAT_ANALYSIS_SCREEN;
      delete process.env.FF_FULL_PAGE_NAVIGATION;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      process.env.FF_RAW_DATA_NAVIGATION = 'true';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_CHAT_ANALYSIS_SCREEN: true,
        FF_FULL_PAGE_NAVIGATION: true,
        FF_SIDE_NAVBAR: true,
        FF_MODALS: true,
        FF_RAW_DATA_NAVIGATION: true,
      });
    });
  });

  describe('isFeatureEnabledEdge', () => {
    it('should return true when feature flag is enabled by default', () => {
      expect(isFeatureEnabledEdge('enableAuthentication')).toBe(true);
      expect(isFeatureEnabledEdge('FF_CHAT_ANALYSIS_SCREEN')).toBe(true);
      expect(isFeatureEnabledEdge('FF_FULL_PAGE_NAVIGATION')).toBe(true);
      expect(isFeatureEnabledEdge('FF_SIDE_NAVBAR')).toBe(true);
      expect(isFeatureEnabledEdge('FF_MODALS')).toBe(true);
      expect(isFeatureEnabledEdge('FF_RAW_DATA_NAVIGATION')).toBe(false);
    });

    it('should return false when feature flag is disabled via environment variable (except FF_CHAT_ANALYSIS_SCREEN which uses default)', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      process.env.FF_CHAT_ANALYSIS_SCREEN = 'false';
      process.env.FF_FULL_PAGE_NAVIGATION = 'false';
      process.env.FF_SIDE_NAVBAR = 'false';
      process.env.FF_MODALS = 'false';
      process.env.FF_RAW_DATA_NAVIGATION = 'false';

      expect(isFeatureEnabledEdge('enableAuthentication')).toBe(false);
      expect(isFeatureEnabledEdge('FF_CHAT_ANALYSIS_SCREEN')).toBe(false);
      expect(isFeatureEnabledEdge('FF_FULL_PAGE_NAVIGATION')).toBe(false);
      expect(isFeatureEnabledEdge('FF_SIDE_NAVBAR')).toBe(false);
      expect(isFeatureEnabledEdge('FF_MODALS')).toBe(false);
      expect(isFeatureEnabledEdge('FF_RAW_DATA_NAVIGATION')).toBe(false);
    });
  });
});
