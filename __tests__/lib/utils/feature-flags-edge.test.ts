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
      'FF_Chat_Analysis_Screen',
      'FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN',
      'FF_FULL_PAGE_NAVIGATION',
      'FF_SIDE_NAVBAR',
      'FEATURE_FLAG_ENABLE_AUTHENTICATION',
      'FF_MODALS',
      'FEATURE_FLAG_RAW_DATA_NAVIGATION',
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
      'FF_Chat_Analysis_Screen',
      'FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN',
      'FF_FULL_PAGE_NAVIGATION',
      'FF_SIDE_NAVBAR',
      'FEATURE_FLAG_ENABLE_AUTHENTICATION',
      'FF_MODALS',
      'FEATURE_FLAG_RAW_DATA_NAVIGATION',
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
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_MODALS;
      delete process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true, // from DEFAULT_FLAGS
        FF_Chat_Analysis_Screen: true, // from DEFAULT_FLAGS
        FF_Full_Page_Navigation: true, // from DEFAULT_FLAGS
        FF_Side_NavBar: true, // from DEFAULT_FLAGS
        FF_Modals: true, // from DEFAULT_FLAGS
        FF_Raw_Data_Navigation: false, // from DEFAULT_FLAGS
      });
    });

    it('should return enableAuthentication as false when ENABLE_AUTHENTICATION is "false"', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_Modals;
      delete process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: false,
        FF_Chat_Analysis_Screen: true,
        FF_Full_Page_Navigation: true,
        FF_Side_NavBar: true,
        FF_Modals: true,
        FF_Raw_Data_Navigation: false,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is "true"', () => {
      process.env.ENABLE_AUTHENTICATION = 'true';
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_Modals;
      delete process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
        FF_Full_Page_Navigation: true,
        FF_Side_NavBar: true,
        FF_Modals: true,
        FF_Raw_Data_Navigation: false,
      });
    });

    it('should return enableAuthentication as true when ENABLE_AUTHENTICATION is any other value', () => {
      process.env.ENABLE_AUTHENTICATION = 'yes';
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_Modals;
      delete process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION;

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
        FF_Full_Page_Navigation: true,
        FF_Side_NavBar: true,
        FF_Modals: true,
        FF_Raw_Data_Navigation: false,
      });
    });

    it('should return FF_Raw_Data_Navigation as false when FEATURE_FLAG_FF_RAW_DATA_NAVIGATION is "false"', () => {
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_Modals;
      process.env.FEATURE_FLAG_FF_RAW_DATA_NAVIGATION = 'false';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
        FF_Full_Page_Navigation: true,
        FF_Side_NavBar: true,
        FF_Modals: true,
        FF_Raw_Data_Navigation: false,
      });
    });

    it('should return FF_Raw_Data_Navigation as true when FEATURE_FLAG_FF_RAW_DATA_NAVIGATION is "true"', () => {
      delete process.env.ENABLE_AUTHENTICATION;
      delete process.env.FF_Chat_Analysis_Screen;
      delete process.env.FF_Full_Page_Navigation;
      delete process.env.FF_SIDE_NAVBAR;
      delete process.env.FF_Modals;
      process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION = 'true';

      const result = loadFeatureFlagsEdge();

      expect(result).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
        FF_Full_Page_Navigation: true,
        FF_Side_NavBar: true,
        FF_Modals: true,
        FF_Raw_Data_Navigation: true,
      });
    });
  });

  describe('isFeatureEnabledEdge', () => {
    it('should return true when feature flag is enabled by default', () => {
      expect(isFeatureEnabledEdge('enableAuthentication')).toBe(true);
      expect(isFeatureEnabledEdge('FF_Chat_Analysis_Screen')).toBe(true);
      expect(isFeatureEnabledEdge('FF_Full_Page_Navigation')).toBe(true);
      expect(isFeatureEnabledEdge('FF_Side_NavBar')).toBe(true);
      expect(isFeatureEnabledEdge('FF_Modals')).toBe(true);
      expect(isFeatureEnabledEdge('FF_Raw_Data_Navigation')).toBe(false);
    });

    it('should return false when feature flag is disabled via environment variable', () => {
      process.env.ENABLE_AUTHENTICATION = 'false';
      process.env.FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN = 'false';
      process.env.FF_FULL_PAGE_NAVIGATION = 'false';
      process.env.FF_SIDE_NAVBAR = 'false';
      process.env.FF_MODALS = 'false';
      process.env.FEATURE_FLAG_FF_RAW_DATA_NAVIGATION = 'false';

      expect(isFeatureEnabledEdge('enableAuthentication')).toBe(false);
      expect(isFeatureEnabledEdge('FF_Chat_Analysis_Screen')).toBe(false);
      expect(isFeatureEnabledEdge('FF_Full_Page_Navigation')).toBe(false);
      expect(isFeatureEnabledEdge('FF_Side_NavBar')).toBe(false);
      expect(isFeatureEnabledEdge('FF_Modals')).toBe(false);
      expect(isFeatureEnabledEdge('FF_Raw_Data_Navigation')).toBe(false);
    });
  });
});
