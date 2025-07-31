import { FeatureFlags, FeatureFlagKey } from "@/lib/types/feature-flags";
import fs from "fs";
import path from "path";

// Default values if no file exists or parsing fails
export const DEFAULT_FLAGS: FeatureFlags = {
  enableAuthentication: true,
};

let cachedFlags: FeatureFlags | null = null;

/**
 * Loads feature flags from the feature-flags.json file
 * Falls back to defaults if file doesn't exist or is invalid
 */
export function loadFeatureFlags(): FeatureFlags {
  // Return cached flags if available
  if (cachedFlags) {
    return cachedFlags;
  }

  try {
    const flagsPath = path.join(process.cwd(), "feature-flags.json");
    
    // Check if file exists
    if (!fs.existsSync(flagsPath)) {
      console.log("Feature flags file not found, using defaults");
      cachedFlags = DEFAULT_FLAGS;
      return cachedFlags;
    }

    // Read and parse the file
    const flagsContent = fs.readFileSync(flagsPath, "utf8");
    const loadedFlags = JSON.parse(flagsContent) as Partial<FeatureFlags>;

    // Merge with defaults to ensure all flags are present
    cachedFlags = {
      ...DEFAULT_FLAGS,
      ...loadedFlags,
    };

    console.log("Feature flags loaded successfully");
    return cachedFlags;
  } catch (error) {
    console.error("Error loading feature flags, using defaults:", error);
    cachedFlags = DEFAULT_FLAGS;
    return cachedFlags;
  }
}

/**
 * Checks if a specific feature flag is enabled
 */
export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  const flags = loadFeatureFlags();
  return flags[key] ?? DEFAULT_FLAGS[key];
}

/**
 * Gets all feature flags
 */
export function getAllFeatureFlags(): FeatureFlags {
  return loadFeatureFlags();
}

/**
 * Clears the cache (useful for testing or when flags change)
 */
export function clearFeatureFlagsCache(): void {
  cachedFlags = null;
}
