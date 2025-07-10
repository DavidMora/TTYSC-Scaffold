"use client";

import { ThemeProvider as UI5ThemeProvider } from "@ui5/webcomponents-react";

// Import SAPUI5 styles and icons
import "@ui5/webcomponents/dist/Assets.js";
import "@ui5/webcomponents-fiori/dist/Assets.js";
import "@ui5/webcomponents-react/dist/Assets.js";
import "@ui5/webcomponents-icons/dist/AllIcons.js";
import "@ui5/webcomponents-icons/dist/Assets.js";

// @styles
import "../app/globals.css";
import "../app/theme-setup";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({
  children,
}: Readonly<ThemeProviderProps>) {
  return <UI5ThemeProvider>{children}</UI5ThemeProvider>;
}
