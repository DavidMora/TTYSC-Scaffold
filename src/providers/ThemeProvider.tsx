"use client";

// @styles
import "@/app/globals.css";
import "@/lib/utils/theme-setup";

import { ThemeProvider as UI5ThemeProvider } from "@ui5/webcomponents-react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({
  children,
}: Readonly<ThemeProviderProps>) {
  return <UI5ThemeProvider>{children}</UI5ThemeProvider>;
}
