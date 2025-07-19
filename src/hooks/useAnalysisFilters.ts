import { useState, useCallback, useMemo, useEffect } from "react";
import {
  INITIAL_FILTERS,
  FilterKeys,
  FILTER_ALL_VALUE,
} from "@/lib/constants/UI/analysisFilters";
import { useCasesAnalysis, useCasesByAnalysis } from "@/hooks/useCases";
import { CasesRequest, FilterKeyType } from "@/lib/types/cases";

const extractFilterValues = (filterData: unknown): string[] => {
  if (!filterData || !Array.isArray(filterData)) {
    return [];
  }

  if (filterData.length === 0) {
    return [];
  }

  const firstItem = filterData[0];
  if (
    typeof firstItem === "object" &&
    firstItem !== null &&
    "name" in firstItem
  ) {
    return filterData.map((item: any) => item.name).filter(Boolean);
  }

  return filterData.filter(Boolean);
};

const createFilterOptions = (values: string[]): string[] => [
  FILTER_ALL_VALUE,
  ...values,
];

const resetDependentFilters = (): Partial<CasesRequest> => ({
  organizations: [FILTER_ALL_VALUE],
  cmSiteName: [FILTER_ALL_VALUE],
  sku: [FILTER_ALL_VALUE],
  nvpn: [FILTER_ALL_VALUE],
});

export const useAnalysisFilters = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [availableOptions, setAvailableOptions] = useState<FilterOptions>({
    analysis: [FILTER_ALL_VALUE],
    organization: [FILTER_ALL_VALUE],
    cmSiteName: [FILTER_ALL_VALUE],
    sku: [FILTER_ALL_VALUE],
    nvpn: [FILTER_ALL_VALUE],
  });

  const { data: casesAnalysisData, isLoading: isLoadingAnalysis } =
    useCasesAnalysis();

  const selectedAnalysisKey = useMemo(() => {
    if (filters.analysis === FILTER_ALL_VALUE) {
      return null;
    }

    const analysisTypes = casesAnalysisData?.data?.analysis || [];
    const selectedType = analysisTypes.find(
      (type) => type.name === filters.analysis
    );

    return selectedType?.key || null;
  }, [filters.analysis, casesAnalysisData]);

  const { data: casesData, isLoading: isLoadingCases } = useCasesByAnalysis(
    selectedAnalysisKey || ""
  );

  // Effect to update analysis options
  useEffect(() => {
    const analysisData = casesAnalysisData?.data?.analysis;
    if (!analysisData) return;

    const analysisNames = analysisData.map((type) => type.name);

    setAvailableOptions((prev) => ({
      ...prev,
      analysis: createFilterOptions(analysisNames),
    }));
  }, [casesAnalysisData]);

  // Effect to update dependent filter options
  useEffect(() => {
    const isAnalysisSelected = filters.analysis !== FILTER_ALL_VALUE;
    const hasValidCasesData = casesData?.data;

    if (isAnalysisSelected && hasValidCasesData) {
      const { organizations, CM, SKU, NVPN } = casesData.data;

      setAvailableOptions((prev) => ({
        ...prev,
        organization: createFilterOptions(extractFilterValues(organizations)),
        cmSiteName: createFilterOptions(extractFilterValues(CM)),
        sku: createFilterOptions(extractFilterValues(SKU)),
        nvpn: createFilterOptions(extractFilterValues(NVPN)),
      }));
    } else {
      // Reset dependent filters when no analysis is selected
      setAvailableOptions((prev) => ({
        ...prev,
        ...resetDependentFilters(),
      }));
    }
  }, [casesData, filters.analysis]);

  const isFilterDisabled = useCallback(
    (filterKey: FilterKey): boolean => {
      if (filterKey === FilterKeys.ANALYSIS) {
        return false;
      }
      return filters.analysis === FILTER_ALL_VALUE;
    },
    [filters.analysis]
  );

  const updateFilter = useCallback((filterKey: FilterKey, value: string) => {
    if (!value) return;

    const isAnalysisFilter = filterKey === FilterKeys.ANALYSIS;

    if (isAnalysisFilter) {
      // Reset all filters when analysis changes
      setFilters({
        ...INITIAL_FILTERS,
        [filterKey]: value,
      });
    } else {
      // Update only the specific filter
      setFilters((prev) => ({
        ...prev,
        [filterKey]: value,
      }));
    }
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const isLoading = isLoadingAnalysis || isLoadingCases;

  return {
    filters,
    availableOptions,
    isDisabled: isFilterDisabled,
    handleFilterChange: updateFilter,
    resetFilters: resetAllFilters,
    isLoading,
  } as const;
};
