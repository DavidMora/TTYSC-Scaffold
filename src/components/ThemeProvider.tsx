"use client";

import { ThemeProvider as UI5ThemeProvider } from "@ui5/webcomponents-react";
import { setTheme } from "@ui5/webcomponents-base/dist/config/Theme.js";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Set the default theme and ensure proper initialization
    setTheme("sap_horizon");

    // Force icon font loading
    if (typeof window !== "undefined") {
      const iconCheck = document.createElement("div");
      iconCheck.className = "ui5-icon";
      iconCheck.style.visibility = "hidden";
      iconCheck.style.position = "absolute";
      document.body.appendChild(iconCheck);

      // Remove after a short delay
      setTimeout(() => {
        document.body.removeChild(iconCheck);
      }, 100);
    }
  }, []);

  return <UI5ThemeProvider>{children}</UI5ThemeProvider>;
}
