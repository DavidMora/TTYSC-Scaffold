import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";
import { DEFAULT_FLAGS } from "./feature-flags";

// Default values if no configuration exists
/**
 * Edge-compatible version that reads feature flags from environment variables
 * Used in middleware and other edge contexts
 *
 * Environment variables:
 * - ENABLE_AUTHENTICATION (true/false)
 * - FF_Chat_Analysis_Screen (true/false)
 * - FF_FULL_PAGE_NAVIGATION (true/false)
 * - FF_Modals (true/false)
 */
export function loadFeatureFlagsEdge(): FeatureFlags {
  try {
    return {
      enableAuthentication: process.env.ENABLE_AUTHENTICATION !== "false",
      FF_Chat_Analysis_Screen: process.env.FF_Chat_Analysis_Screen !== "false",
      FF_Full_Page_Navigation: process.env.FF_FULL_PAGE_NAVIGATION !== "false",
      FF_Modals: process.env.FF_Modals !== "false",
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
  const flags = { ...DEFAULT_FLAGS, ...loadFeatureFlagsEdge() };
  return flags[key];
}
