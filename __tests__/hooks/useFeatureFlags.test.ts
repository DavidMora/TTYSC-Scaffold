import { renderHook, waitFor } from '@testing-library/react';
import { useFeatureFlags, useFeatureFlag, useAuthenticationEnabled } from '@/hooks/useFeatureFlags';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useFeatureFlags hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useFeatureFlags', () => {
    it('should load feature flags successfully', async () => {
      const mockFlags = {
        enableAuthentication: true,
        enableBetaFeatures: false,
        enableChatHistory: true,
        enableAdvancedAnalytics: false,
        enableRealTimeUpdates: false,
        enableDebugMode: false,
        enableExperimentalUI: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFlags),
      } as Response);

      const { result } = renderHook(() => useFeatureFlags());

      expect(result.current.loading).toBe(true);
      expect(result.current.flags).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.flags).toEqual(mockFlags);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors with fallback', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useFeatureFlags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.flags).toEqual({
        enableAuthentication: true,
      });
    });

    it('should handle non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { result } = renderHook(() => useFeatureFlags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to fetch feature flags');
      expect(result.current.flags).toBeDefined();
    });
  });

  describe('useFeatureFlag', () => {
    it('should return correct flag value', async () => {
      const mockFlags = {
        enableAuthentication: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFlags),
      } as Response);

      const { result } = renderHook(() => useFeatureFlag('enableAuthentication'));

      await waitFor(() => {
        expect(result.current).toBe(true);
      });
    });

    it('should return false for undefined flags', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      const { result } = renderHook(() => useFeatureFlag('enableAuthentication'));

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });

  describe('useAuthenticationEnabled', () => {
    it('should return authentication flag value', async () => {
      const mockFlags = {
        enableAuthentication: false,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFlags),
      } as Response);

      const { result } = renderHook(() => useAuthenticationEnabled());

      await waitFor(() => {
        expect(result.current).toBe(false);
      });
    });
  });
});
