import { useState, useCallback, useMemo } from "react";
import type {
  FilterState,
  FilterOptions,
  FilterKey,
} from "@/lib/types/analysisFilters";
import {
  FILTER_DATA,
  INITIAL_FILTERS,
  FilterKeys,
  FILTER_ALL_VALUE,
} from "@/lib/constants/UI/analysisFilters";

const RESET_DEPENDENCIES: Record<FilterKey, FilterKey[]> = {
  [FilterKeys.ANALYSIS]: [
    FilterKeys.ORGANIZATION,
    FilterKeys.CM_SITE_NAME,
    FilterKeys.SKU,
    FilterKeys.NVPN,
  ],
  [FilterKeys.ORGANIZATION]: [
    FilterKeys.CM_SITE_NAME,
    FilterKeys.SKU,
    FilterKeys.NVPN,
  ],
  [FilterKeys.CM_SITE_NAME]: [FilterKeys.SKU, FilterKeys.NVPN],
  [FilterKeys.SKU]: [FilterKeys.NVPN],
  [FilterKeys.NVPN]: [],
};

const DEPENDENCY_CHAIN: Record<FilterKey, FilterKey | null> = {
  [FilterKeys.ANALYSIS]: null,
  [FilterKeys.ORGANIZATION]: FilterKeys.ANALYSIS,
  [FilterKeys.CM_SITE_NAME]: FilterKeys.ORGANIZATION,
  [FilterKeys.SKU]: FilterKeys.CM_SITE_NAME,
  [FilterKeys.NVPN]: FilterKeys.SKU,
};

export const useAnalysisFilters = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const availableOptions = useMemo((): FilterOptions => {
    const options: FilterOptions = {
      analysis: [FILTER_ALL_VALUE, ...Object.keys(FILTER_DATA)],
      organization: [FILTER_ALL_VALUE],
      cmSiteName: [FILTER_ALL_VALUE],
      sku: [FILTER_ALL_VALUE],
      nvpn: [FILTER_ALL_VALUE],
    };

    const { analysis, organization, cmSiteName, sku } = filters;

    if (analysis !== FILTER_ALL_VALUE) {
      const analysisData = FILTER_DATA[analysis];
      if (analysisData) {
        options.organization = [FILTER_ALL_VALUE, ...Object.keys(analysisData)];

        if (organization !== FILTER_ALL_VALUE) {
          const orgData = analysisData[organization];
          if (orgData) {
            options.cmSiteName = [FILTER_ALL_VALUE, ...Object.keys(orgData)];

            if (cmSiteName !== FILTER_ALL_VALUE) {
              const siteData = orgData[cmSiteName];
              if (siteData) {
                options.sku = [FILTER_ALL_VALUE, ...Object.keys(siteData)];

                if (sku !== FILTER_ALL_VALUE) {
                  const nvpnData = siteData[sku];
                  if (nvpnData) {
                    options.nvpn = [FILTER_ALL_VALUE, ...nvpnData];
                  }
                }
              }
            }
          }
        }
      }
    }

    return options;
  }, [filters]);

  const resetDependentFilters = useCallback(
    (filterKey: FilterKey): Partial<FilterState> => {
      return RESET_DEPENDENCIES[filterKey].reduce((acc, key) => {
        acc[key] = FILTER_ALL_VALUE;
        return acc;
      }, {} as Partial<FilterState>);
    },
    []
  );

  const isDisabled = useCallback(
    (filterKey: FilterKey): boolean => {
      const parentKey = DEPENDENCY_CHAIN[filterKey];
      return parentKey ? filters[parentKey] === FILTER_ALL_VALUE : false;
    },
    [filters]
  );

  const handleFilterChange = useCallback(
    (filterKey: FilterKey, value: string) => {
      if (!value) return;

      setFilters((prev) => ({
        ...prev,
        [filterKey]: value,
        ...resetDependentFilters(filterKey),
      }));
    },
    [resetDependentFilters]
  );

  return {
    filters,
    availableOptions,
    isDisabled,
    handleFilterChange,
  };
};
