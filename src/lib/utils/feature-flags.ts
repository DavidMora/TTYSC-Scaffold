import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";

// Default values if no file exists or parsing fails
export const DEFAULT_FLAGS: FeatureFlags = {
  enableAuthentication: true,
  FF_Chat_Analysis_Screen: true,
  FF_Full_Page_Navigation: true,
  FF_Modals: true,
};

/**
 * Cache for feature flags to avoid re-evaluation
 */
let cachedFlags: FeatureFlags | null = null;

/**
 * Load feature flags from the generated JSON file
 * This is the primary source of truth when available
 */
/**
 * Load feature flags from the generated JSON file
 * This is the primary source of truth when available
 */
const loadFromGeneratedFile = async (
  customPath?: string
): Promise<FeatureFlags | null> => {
  try {
    // Use dynamic import to load the JSON file from the root
    if (customPath) {
      // For testing purposes - dynamic path
      const featureFlags = await import(
        /* webpackIgnore: true */
        customPath
      );
      return featureFlags.default as FeatureFlags;
    } else {
      // Production path - static import for better webpack analysis
      const featureFlags = await import("../../../feature-flags.json");
      return featureFlags.default as FeatureFlags;
    }
  } catch {
    return null;
  }
};

/**
 * Load feature flags from environment variables
 * Uses FEATURE_FLAG_ENABLE_AUTHENTICATION as the primary variable
 */
const loadFromEnvironment = (): FeatureFlags => {
  // Use FEATURE_FLAG_ENABLE_AUTHENTICATION or fall back to default
  let enableAuth = DEFAULT_FLAGS.enableAuthentication;
  const FF_Chat_Analysis_Screen = DEFAULT_FLAGS.FF_Chat_Analysis_Screen;
  let FF_Full_Page_Navigation = DEFAULT_FLAGS.FF_Full_Page_Navigation;
  const FF_Modals = DEFAULT_FLAGS.FF_Modals;

  if (process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION !== undefined) {
    enableAuth =
      process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION.toLowerCase() === "true";
  }

  if (process.env.FF_FULL_PAGE_NAVIGATION !== undefined) {
    FF_Full_Page_Navigation =
      process.env.FF_FULL_PAGE_NAVIGATION.toLowerCase() === "true";
  }

  const flags: FeatureFlags = {
    enableAuthentication: enableAuth,
    FF_Chat_Analysis_Screen: FF_Chat_Analysis_Screen,
    FF_Full_Page_Navigation: FF_Full_Page_Navigation,
    FF_Modals: FF_Modals,
  };

  return flags;
};

/**
 * Main function to get feature flags (async version)
 * Priority: 1. Generated File -> 2. Environment Variables -> 3. Defaults
 */
export const getFeatureFlags = async (
  customPath?: string
): Promise<FeatureFlags> => {
  // Return cached flags if available
  if (cachedFlags) {
    return cachedFlags;
  }

  // Try to load from generated file first
  const fileFlags = await loadFromGeneratedFile(customPath);
  if (fileFlags) {
    cachedFlags = fileFlags;
    return cachedFlags;
  }

  // Fallback to environment variables
  const envFlags = loadFromEnvironment();
  cachedFlags = envFlags;
  return cachedFlags;
};

/**
 * Synchronous version for compatibility
 * Uses environment variables and defaults only
 */
export const getFeatureFlagsSync = (): FeatureFlags => {
  // Return cached flags if available
  if (cachedFlags) {
    return cachedFlags;
  }

  // Load from environment variables synchronously
  const envFlags = loadFromEnvironment();
  cachedFlags = envFlags;
  return cachedFlags;
};

/**
 * Checks if a specific feature flag is enabled (async)
 */
export const isFeatureEnabled = async (
  flag: FeatureFlagKey
): Promise<boolean> => {
  const flags = await getFeatureFlags();
  return flags[flag];
};

/**
 * Checks if a specific feature flag is enabled (sync)
 */
export const isFeatureEnabledSync = (flag: FeatureFlagKey): boolean => {
  const flags = getFeatureFlagsSync();
  return flags[flag];
};

/**
 * Clears the feature flags cache
 * Useful for testing or when you want to reload flags
 */
export const clearFeatureFlagsCache = (): void => {
  cachedFlags = null;
};

/**
 * Load feature flags (legacy function for backward compatibility)
 * Uses synchronous loading only
 */
export function loadFeatureFlags(): FeatureFlags {
  return getFeatureFlagsSync();
}

/**
 * Gets all feature flags (legacy function)
 */
export function getAllFeatureFlags(): FeatureFlags {
  return loadFeatureFlags();
}
