import { FeatureFlags, FeatureFlagKey } from '@/lib/types/feature-flags';
import { DEFAULT_FLAGS, parseBool } from './feature-flags';

// Default values if no configuration exists
/**
 * Edge-compatible version that reads feature flags from environment variables
 * Used in middleware and other edge contexts
 *
 * Environment variables (preferred names, with legacy fallbacks):
 * - FEATURE_FLAG_ENABLE_AUTHENTICATION (preferred) → ENABLE_AUTHENTICATION (legacy)
 * - FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN (preferred) → FF_CHAT_ANALYSIS_SCREEN (legacy)
 * - FEATURE_FLAG_FF_FULL_PAGE_NAVIGATION (preferred) → FF_FULL_PAGE_NAVIGATION (legacy)
 * - FEATURE_FLAG_FF_SIDE_NAVBAR (preferred) → FF_SIDE_NAVBAR (legacy)
 * - FEATURE_FLAG_FF_MODALS (preferred) → FF_MODALS (legacy)
 * - FEATURE_FLAG_RAW_DATA_NAVIGATION (single naming convention)
 */
export function loadFeatureFlagsEdge(): FeatureFlags {
  try {
    return {
      enableAuthentication: parseBool(
        process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION ??
          process.env.ENABLE_AUTHENTICATION,
        DEFAULT_FLAGS.enableAuthentication
      ),
      FF_Chat_Analysis_Screen: parseBool(
        process.env.FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN ??
          process.env.FF_CHAT_ANALYSIS_SCREEN,
        DEFAULT_FLAGS.FF_Chat_Analysis_Screen
      ),
      FF_Full_Page_Navigation: parseBool(
        process.env.FEATURE_FLAG_FF_FULL_PAGE_NAVIGATION ??
          process.env.FF_FULL_PAGE_NAVIGATION,
        DEFAULT_FLAGS.FF_Full_Page_Navigation
      ),
      FF_Side_NavBar: parseBool(
        process.env.FEATURE_FLAG_FF_SIDE_NAVBAR ?? process.env.FF_SIDE_NAVBAR,
        DEFAULT_FLAGS.FF_Side_NavBar
      ),
      FF_Modals: parseBool(
        process.env.FEATURE_FLAG_FF_MODALS ?? process.env.FF_MODALS,
        DEFAULT_FLAGS.FF_Modals
      ),
      FF_Raw_Data_Navigation: parseBool(
        process.env.FEATURE_FLAG_RAW_DATA_NAVIGATION,
        DEFAULT_FLAGS.FF_Raw_Data_Navigation
      ),
    };
  } catch (error) {
    console.warn(
      'Error loading feature flags in edge runtime, using defaults:',
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
