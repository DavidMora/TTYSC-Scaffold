export interface FeatureFlags {
  enableAuthentication: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
