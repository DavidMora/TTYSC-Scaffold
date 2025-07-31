import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";
import { useState, useEffect } from "react";

/**
 * Hook to get feature flags on the client side
 * Fetches flags from an API endpoint that reads the JSON file
 */
export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch("/api/feature-flags");
        if (!response.ok) {
          throw new Error("Failed to fetch feature flags");
        }
        const data = await response.json();
        setFlags(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching feature flags:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Set default flags as fallback
        setFlags({
          enableAuthentication: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, []);

  return { flags, loading, error };
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { flags } = useFeatureFlags();
  return flags?.[key] ?? false;
}

/**
 * Hook specifically for authentication feature flag
 */
export function useAuthenticationEnabled(): boolean {
  return useFeatureFlag("enableAuthentication");
}
