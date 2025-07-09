"use client";

import { ThemeProvider as UI5ThemeProvider } from "@ui5/webcomponents-react";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { useEffect } from "react";
import "@ui5/webcomponents-react/dist/Assets";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Set the default theme
    setTheme("sap_horizon");
  }, []);

  return <UI5ThemeProvider>{children}</UI5ThemeProvider>;
}
