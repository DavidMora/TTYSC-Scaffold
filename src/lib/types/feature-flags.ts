export interface FeatureFlags {
  enableAuthentication: boolean;
  FF_CHAT_ANALYSIS_SCREEN: boolean;
  FF_FULL_PAGE_NAVIGATION: boolean;
  FF_SIDE_NAVBAR: boolean;
  FF_MODALS: boolean;
  FF_RAW_DATA_NAVIGATION: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
