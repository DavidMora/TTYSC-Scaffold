import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";
import { DEFAULT_FLAGS } from "./feature-flags";

// Default values if no configuration exists
/**
 * Edge-compatible version that reads feature flags from environment variables
 * Used in middleware and other edge contexts
 *
 * Environment variables:
 * - ENABLE_AUTHENTICATION (true/false)
 */
export function loadFeatureFlagsEdge(): FeatureFlags {
  try {
    return {
      enableAuthentication: process.env.ENABLE_AUTHENTICATION !== "false",
      FF_Chat_Analysis_Screen: DEFAULT_FLAGS.FF_Chat_Analysis_Screen,
    };
  } catch (error) {
    console.warn(
      "Error loading feature flags in edge runtime, using defaults:",
      error
    );
    return DEFAULT_FLAGS;
  }
}

/**
 * Edge-compatible version to check if a specific feature flag is enabled
 */
export function isFeatureEnabledEdge(key: FeatureFlagKey): boolean {
  const flags = loadFeatureFlagsEdge();
  return flags[key] ?? DEFAULT_FLAGS[key];
}
