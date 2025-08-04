export interface FeatureFlags {
  enableAuthentication: boolean;
  FF_Chat_Analysis_Screen: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
