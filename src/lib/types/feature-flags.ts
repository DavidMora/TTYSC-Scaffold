export interface FeatureFlags {
  enableAuthentication: boolean;
  FF_Chat_Analysis_Screen: boolean;
  FF_Full_Page_Navigation: boolean;
  FF_Side_NavBar: boolean;
  FF_Modals: boolean;
  FF_Settings_Menu: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
