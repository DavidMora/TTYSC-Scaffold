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

  const getOrganizationOptions = useCallback((analysis: string): string[] => {
    if (analysis === FILTER_ALL_VALUE) return [FILTER_ALL_VALUE];
    const analysisData = FILTER_DATA[analysis];
    return analysisData
      ? [FILTER_ALL_VALUE, ...Object.keys(analysisData)]
      : [FILTER_ALL_VALUE];
  }, []);

  const getSiteOptions = useCallback(
    (analysis: string, organization: string): string[] => {
      if (analysis === FILTER_ALL_VALUE || organization === FILTER_ALL_VALUE)
        return [FILTER_ALL_VALUE];
      const analysisData = FILTER_DATA[analysis];
      const orgData = analysisData?.[organization];
      return orgData
        ? [FILTER_ALL_VALUE, ...Object.keys(orgData)]
        : [FILTER_ALL_VALUE];
    },
    []
  );

  const getSkuOptions = useCallback(
    (analysis: string, organization: string, cmSiteName: string): string[] => {
      if (
        analysis === FILTER_ALL_VALUE ||
        organization === FILTER_ALL_VALUE ||
        cmSiteName === FILTER_ALL_VALUE
      ) {
        return [FILTER_ALL_VALUE];
      }
      const analysisData = FILTER_DATA[analysis];
      const orgData = analysisData?.[organization];
      const siteData = orgData?.[cmSiteName];
      return siteData
        ? [FILTER_ALL_VALUE, ...Object.keys(siteData)]
        : [FILTER_ALL_VALUE];
    },
    []
  );

  const getNvpnOptions = useCallback(
    (
      analysis: string,
      organization: string,
      cmSiteName: string,
      sku: string
    ): string[] => {
      if (
        analysis === FILTER_ALL_VALUE ||
        organization === FILTER_ALL_VALUE ||
        cmSiteName === FILTER_ALL_VALUE ||
        sku === FILTER_ALL_VALUE
      ) {
        return [FILTER_ALL_VALUE];
      }
      const analysisData = FILTER_DATA[analysis];
      const orgData = analysisData?.[organization];
      const siteData = orgData?.[cmSiteName];
      const nvpnData = siteData?.[sku];
      return nvpnData ? [FILTER_ALL_VALUE, ...nvpnData] : [FILTER_ALL_VALUE];
    },
    []
  );

  const availableOptions = useMemo((): FilterOptions => {
    const { analysis, organization, cmSiteName, sku } = filters;

    return {
      analysis: [FILTER_ALL_VALUE, ...Object.keys(FILTER_DATA)],
      organization: getOrganizationOptions(analysis),
      cmSiteName: getSiteOptions(analysis, organization),
      sku: getSkuOptions(analysis, organization, cmSiteName),
      nvpn: getNvpnOptions(analysis, organization, cmSiteName, sku),
    };
  }, [
    filters,
    getOrganizationOptions,
    getSiteOptions,
    getSkuOptions,
    getNvpnOptions,
  ]);

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

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  return {
    filters,
    availableOptions,
    isDisabled,
    handleFilterChange,
    resetFilters,
  };
};
