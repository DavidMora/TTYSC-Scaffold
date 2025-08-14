import { FeatureFlags, FeatureFlagKey } from '@/lib/types/feature-flags';
import { DEFAULT_FLAGS } from '@/lib/utils/feature-flags';
import { useState, useEffect } from 'react';

/**
 * Hook to get feature flags on the client side
 * Fetches flags from an API endpoint that reads the JSON file
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchFlags = async () => {
      try {
        const response = await fetch('/api/feature-flags');
        if (cancelled) return;
        if (!response.ok) {
          throw new Error('Failed to fetch feature flags');
        }
        const data = await response.json();
        if (cancelled) return;
        setFlags(data);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('Error fetching feature flags:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Set default flags as fallback using centralized defaults
        setFlags(DEFAULT_FLAGS);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFlags();
    return () => {
      cancelled = true;
    };
  }, []);

  return { flags, loading, error };
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(key: FeatureFlagKey): {
  flag: boolean;
  loading: boolean;
  error: string | null;
} {
  const { flags, loading, error } = useFeatureFlags();
  return {
    flag: flags?.[key] ?? false,
    loading,
    error,
  };
}

/**
 * Hook specifically for authentication feature flag
 */
export function useAuthenticationEnabled(): boolean {
  return useFeatureFlag('enableAuthentication').flag;
}
