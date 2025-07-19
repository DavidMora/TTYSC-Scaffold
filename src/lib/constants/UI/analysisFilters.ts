import { CasesRequest, FilterKeyType } from "@/lib/types/cases";

export enum FilterKeys {
  ANALYSIS = "analysis",
  ORGANIZATIONS = "organizations",
  CM = "CM",
  SKU = "SKU",
  NVPN = "NVPN",
}

export const FILTER_ALL_VALUE: FilterKeyType = {
  key: "",
  name: "All",
};

export const FILTER_CONFIGS: FilterKeyType[] = [
  { key: FilterKeys.ANALYSIS, name: "Select an Analysis" },
  { key: FilterKeys.ORGANIZATIONS, name: "Select the organization" },
  { key: FilterKeys.CM, name: "Select the CM Site Name" },
  { key: FilterKeys.SKU, name: "Select the SKU" },
  { key: FilterKeys.NVPN, name: "Select the NVPN" },
];

export const INITIAL_FILTERS: CasesRequest = {
  analysis: [FILTER_ALL_VALUE],
  organizations: [FILTER_ALL_VALUE],
  CM: [FILTER_ALL_VALUE],
  SKU: [FILTER_ALL_VALUE],
  NVPN: [FILTER_ALL_VALUE],
};
