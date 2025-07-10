import React from "react";

export const useIsomorphicLayoutEffect = React.useLayoutEffect;
export const withWebComponent = (component: React.ComponentType<any>) =>
  component;
export const ThemingParameters = {};
export const StyleStore = {
  getStyle: () => ({}),
};
export const I18nStore = {
  getI18nBundle: () => ({
    getText: (key: string) => key,
  }),
};
export const Device = {
  isIE: false,
  isPhone: false,
  isTablet: false,
  isDesktop: true,
};
export const hooks = {
  useI18nBundle: () => ({
    getText: (key: string) => key,
  }),
  useIsomorphicLayoutEffect: React.useLayoutEffect,
  useIsRTL: () => false,
  useSyncRef: () => {},
  useViewportRange: () => {},
  useStylesheet: () => {},
  useCurrentTheme: () => "sap_fiori_3",
};
