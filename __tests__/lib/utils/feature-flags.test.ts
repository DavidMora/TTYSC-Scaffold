import { loadFeatureFlags, isFeatureEnabled, getAllFeatureFlags, clearFeatureFlagsCache } from '@/lib/utils/feature-flags';
import fs from 'fs';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Feature Flags Utils', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearFeatureFlagsCache();
    jest.clearAllMocks();
  });

  describe('loadFeatureFlags', () => {
    it('should return default flags when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const flags = loadFeatureFlags();
      
      expect(flags.enableAuthentication).toBe(true);
    });

    it('should load flags from file when it exists', () => {
      const mockFlags = {
        enableAuthentication: false,
      };
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockFlags));
      
      const flags = loadFeatureFlags();
      
      expect(flags.enableAuthentication).toBe(false);
    });

    it('should return default flags when JSON parsing fails', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('invalid json');
      
      const flags = loadFeatureFlags();
      
      expect(flags.enableAuthentication).toBe(true);
    });

    it('should cache flags after first load', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ enableAuthentication: false }));
      
      // First call
      loadFeatureFlags();
      
      // Second call
      loadFeatureFlags();
      
      // fs.readFileSync should only be called once due to caching
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return correct flag value', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ enableAuthentication: false }));
      
      expect(isFeatureEnabled('enableAuthentication')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ enableAuthentication: false }));
      
      const flags = getAllFeatureFlags();
      
      expect(flags).toHaveProperty('enableAuthentication', false);
    });
  });

  describe('clearFeatureFlagsCache', () => {
    it('should clear cache and reload flags', () => {
      // Load flags first
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ enableAuthentication: false }));
      loadFeatureFlags();
      
      // Clear cache
      clearFeatureFlagsCache();
      
      // Load again with different data
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ enableAuthentication: true }));
      const flags = loadFeatureFlags();
      
      expect(flags.enableAuthentication).toBe(true);
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });
});
