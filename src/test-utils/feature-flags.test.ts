/**
 * Test suite for feature flag naming consistency
 * Tests both new FEATURE_FLAG_* and legacy naming conventions
 */

import { parseBool } from '@/lib/utils/feature-flags';

// Mock process.env for testing
const mockEnv = (envVars: Record<string, string>) => {
  const originalEnv = process.env;
  process.env = { ...originalEnv, ...envVars };
  return () => {
    process.env = originalEnv;
  };
};

describe('Feature Flag Environment Variable Naming', () => {
  describe('enableAuthentication', () => {
    it('should use FEATURE_FLAG_ENABLE_AUTHENTICATION when set', () => {
      const cleanup = mockEnv({ FEATURE_FLAG_ENABLE_AUTHENTICATION: 'true' });
      const result = parseBool(
        process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION ??
          process.env.ENABLE_AUTHENTICATION,
        false
      );
      expect(result).toBe(true);
      cleanup();
    });

    it('should fall back to ENABLE_AUTHENTICATION when FEATURE_FLAG_ENABLE_AUTHENTICATION is not set', () => {
      const cleanup = mockEnv({ ENABLE_AUTHENTICATION: 'true' });
      const result = parseBool(
        process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION ??
          process.env.ENABLE_AUTHENTICATION,
        false
      );
      expect(result).toBe(true);
      cleanup();
    });

    it('should use FEATURE_FLAG_ENABLE_AUTHENTICATION over ENABLE_AUTHENTICATION when both are set', () => {
      const cleanup = mockEnv({
        FEATURE_FLAG_ENABLE_AUTHENTICATION: 'false',
        ENABLE_AUTHENTICATION: 'true',
      });
      const result = parseBool(
        process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION ??
          process.env.ENABLE_AUTHENTICATION,
        true
      );
      expect(result).toBe(false);
      cleanup();
    });

    it('should use default when neither variable is set', () => {
      const cleanup = mockEnv({});
      const result = parseBool(
        process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION ??
          process.env.ENABLE_AUTHENTICATION,
        true
      );
      expect(result).toBe(true);
      cleanup();
    });
  });

  describe('FF_RAW_DATA_NAVIGATION', () => {
    it('should use FF_RAW_DATA_NAVIGATION when set', () => {
      const cleanup = mockEnv({ FF_RAW_DATA_NAVIGATION: 'true' });
      const result = parseBool(process.env.FF_RAW_DATA_NAVIGATION, false);
      expect(result).toBe(true);
      cleanup();
    });

    it('should use default when FF_RAW_DATA_NAVIGATION is not set', () => {
      const cleanup = mockEnv({});
      const result = parseBool(process.env.FF_RAW_DATA_NAVIGATION, false);
      expect(result).toBe(false);
      cleanup();
    });
  });
});
