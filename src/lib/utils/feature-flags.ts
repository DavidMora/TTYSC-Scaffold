import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";

// Default values if no file exists or parsing fails
export const DEFAULT_FLAGS: FeatureFlags = {
  enableAuthentication: true,
  FF_Chat_Analysis_Screen: true,
  FF_Full_Page_Navigation: true,
  FF_Side_NavBar: true,
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
 * Parses a string-like boolean to a boolean with sensible defaults.
 * Accepts: "true/1/yes/y/on" and "false/0/no/n/off" (case-insensitive).
 */
const parseBool = (
  value: string | undefined,
  defaultValue: boolean
): boolean => {
  if (value == null) return defaultValue;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "n", "off"].includes(normalized)) return false;
  // If a value is provided but it's invalid, treat it as false to match previous behavior
  return false;
};

/**
 * Load feature flags from environment variables
 * Uses FEATURE_FLAG_ENABLE_AUTHENTICATION as the primary variable
 */
const loadFromEnvironment = (): FeatureFlags => {
  // Use environment variables with graceful fallbacks to defaults
  const enableAuth = parseBool(
    process.env.FEATURE_FLAG_ENABLE_AUTHENTICATION,
    DEFAULT_FLAGS.enableAuthentication
  );

  const FF_Chat_Analysis_Screen = parseBool(
    process.env.FEATURE_FLAG_FF_CHAT_ANALYSIS_SCREEN,
    DEFAULT_FLAGS.FF_Chat_Analysis_Screen
  );

  const FF_Full_Page_Navigation = parseBool(
    process.env.FF_FULL_PAGE_NAVIGATION,
    DEFAULT_FLAGS.FF_Full_Page_Navigation
  );

  const FF_Side_NavBar = parseBool(
    process.env.FF_SIDE_NAVBAR,
    DEFAULT_FLAGS.FF_Side_NavBar
  );

  const FF_Modals = parseBool(process.env.FF_MODALS, DEFAULT_FLAGS.FF_Modals);

  const flags: FeatureFlags = {
    enableAuthentication: enableAuth,
    FF_Chat_Analysis_Screen: FF_Chat_Analysis_Screen,
    FF_Full_Page_Navigation: FF_Full_Page_Navigation,
    FF_Side_NavBar: FF_Side_NavBar,
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
