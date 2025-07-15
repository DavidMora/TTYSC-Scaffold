import type {
  FilterConfig,
  FilterState,
  FilterData,
} from "@/lib/types/analysisFilters";

export enum FilterKeys {
  ANALYSIS = "analysis",
  ORGANIZATION = "organization",
  CM_SITE_NAME = "cmSiteName",
  SKU = "sku",
  NVPN = "nvpn",
}

export const FILTER_ALL_VALUE = "All";

export const FILTER_CONFIGS: FilterConfig[] = [
  { key: FilterKeys.ANALYSIS, label: "Select an Analysis" },
  { key: FilterKeys.ORGANIZATION, label: "Select the organization" },
  { key: FilterKeys.CM_SITE_NAME, label: "Select the CM Site Name" },
  { key: FilterKeys.SKU, label: "Select the SKU" },
  { key: FilterKeys.NVPN, label: "Select the NVPN" },
];

export const INITIAL_FILTERS: FilterState = {
  analysis: FILTER_ALL_VALUE,
  organization: FILTER_ALL_VALUE,
  cmSiteName: FILTER_ALL_VALUE,
  sku: FILTER_ALL_VALUE,
  nvpn: FILTER_ALL_VALUE,
};

export const FILTER_DATA: FilterData = {
  "Supply Gap Analysis": {
    "North America": {
      "Site 001 - New York": {
        "SKU-12345": ["NVPN-001", "NVPN-002"],
        "SKU-23456": ["NVPN-003"],
      },
      "Site 002 - Chicago": {
        "SKU-34567": ["NVPN-004"],
        "SKU-45678": ["NVPN-005"],
      },
    },
    Europe: {
      "Site 003 - London": {
        "SKU-12345": ["NVPN-001"],
        "SKU-56789": ["NVPN-006"],
      },
    },
  },
  "Demand Forecast Analysis": {
    "Asia Pacific": {
      "Site 004 - Tokyo": {
        "SKU-23456": ["NVPN-007", "NVPN-008"],
        "SKU-67890": ["NVPN-009"],
      },
      "Site 005 - Singapore": {
        "SKU-78901": ["NVPN-010"],
      },
    },
    Europe: {
      "Site 006 - Berlin": {
        "SKU-89012": ["NVPN-011", "NVPN-012"],
      },
    },
  },
  "Inventory Optimization": {
    "Latin America": {
      "Site 007 - São Paulo": {
        "SKU-90123": ["NVPN-013"],
        "SKU-01234": ["NVPN-014", "NVPN-015"],
      },
    },
    "North America": {
      "Site 008 - Mexico City": {
        "SKU-12346": ["NVPN-016"],
      },
    },
  },
};
