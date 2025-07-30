import {
  FilterField,
  FilterOptions,
  FilterState,
  FilterValue,
} from "@/lib/types/analysisFilters";

export enum FilterKeys {
  ANALYSIS = "analysis",
  ORGANIZATION = "organizations",
  CM_SITE_NAME = "CM",
  SKU = "SKU",
  NVPN = "NVPN",
}

export const FILTER_ALL_VALUE: FilterValue = {
  key: null,
  name: "All",
};

export const FILTER_FIELDS: FilterField[] = [
  { key: FilterKeys.ANALYSIS, label: "Select an Analysis" },
  { key: FilterKeys.ORGANIZATION, label: "Select the organization" },
  { key: FilterKeys.CM_SITE_NAME, label: "Select the CM Site Name" },
  { key: FilterKeys.SKU, label: "Select the SKU" },
  { key: FilterKeys.NVPN, label: "Select the NVPN" },
];

export const INITIAL_FILTERS: FilterState = {
  [FilterKeys.ANALYSIS]: FILTER_ALL_VALUE,
  [FilterKeys.ORGANIZATION]: FILTER_ALL_VALUE,
  [FilterKeys.CM_SITE_NAME]: FILTER_ALL_VALUE,
  [FilterKeys.SKU]: FILTER_ALL_VALUE,
  [FilterKeys.NVPN]: FILTER_ALL_VALUE,
};
export const FILTER_OPTIONS: FilterOptions = {
  [FilterKeys.ANALYSIS]: [FILTER_ALL_VALUE],
  [FilterKeys.ORGANIZATION]: [FILTER_ALL_VALUE],
  [FilterKeys.CM_SITE_NAME]: [FILTER_ALL_VALUE],
  [FilterKeys.SKU]: [FILTER_ALL_VALUE],
  [FilterKeys.NVPN]: [FILTER_ALL_VALUE],
};
