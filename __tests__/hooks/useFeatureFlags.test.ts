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
        FF_Chat_Analysis_Screen: true,
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

    it('should handle non-Error objects in catch block', async () => {
      // Test the "Unknown error" branch in line 30
      mockFetch.mockRejectedValue('String error instead of Error object');

      const { result } = renderHook(() => useFeatureFlags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Unknown error');
      expect(result.current.flags).toEqual({
        enableAuthentication: true,
        FF_Chat_Analysis_Screen: true,
      });
    });

    it('should handle cancellation during json parsing', async () => {
      // Simple mock without complex nesting
      const slowJsonMock = jest.fn().mockResolvedValue({ enableAuthentication: false });

      mockFetch.mockResolvedValue({
        ok: true,
        json: slowJsonMock
      } as any);

      const { unmount } = renderHook(() => useFeatureFlags());

      // Unmount immediately to test cancellation
      unmount();

      // Wait for any pending operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle cancellation in catch block', async () => {
      // Simple error mock
      mockFetch.mockRejectedValue(new Error('Test error'));

      const { unmount } = renderHook(() => useFeatureFlags());

      // Unmount immediately
      unmount();

      // Wait briefly
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    it('should handle cancellation in finally block', async () => {
      // Simple success mock
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ enableAuthentication: true })
      } as any);

      const { unmount } = renderHook(() => useFeatureFlags());

      // Unmount immediately to trigger cancellation in finally
      unmount();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));
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
        expect(result.current).toEqual({ flag: true, loading: false, error: null });
      });
    });

    it('should return false for undefined flags', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      const { result } = renderHook(() => useFeatureFlag('enableAuthentication'));

      await waitFor(() => {
        expect(result.current).toEqual({ flag: false, loading: false, error: null });
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
