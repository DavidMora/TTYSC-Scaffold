import { MenuItem, MenuItemKey, HeaderBarConfig } from "@/lib/types/HeaderBar";

export const HEADER_BAR_CONFIG: Record<string, HeaderBarConfig> = {
  supplyChain: {
    title: "Talk to your supply chain",
    subtitle:
      "Turn data into insights with advanced analytics from LLMs (Check for accuracy)",
    actions: ["RETRY", "SETTINGS", "PRINT", "RECORD_SCREENCAST", "ABOUT"],
  },
};

export const SUPPLY_CHAIN_MENU: Record<MenuItemKey, MenuItem> = {
  RETRY: { key: "RETRY", label: "Rerun", icon: "refresh" },
  SETTINGS: { key: "SETTINGS", label: "Settings", icon: "action-settings" },
  PRINT: { key: "PRINT", label: "Print", icon: "print" },
  RECORD_SCREENCAST: {
    key: "RECORD_SCREENCAST",
    label: "Record a screencast",
    icon: "sys-monitor",
  },
  ABOUT: { key: "ABOUT", label: "About", icon: "hint" },
};
