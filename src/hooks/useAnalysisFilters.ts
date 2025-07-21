import { useState, useCallback, useMemo } from "react";
import {
  FILTER_ALL_VALUE,
  FILTER_OPTIONS,
  INITIAL_FILTERS,
} from "@/lib/constants/UI/analysisFilters";
import {
  FilterKey,
  FilterOptions,
  FilterState,
  FilterValue,
} from "@/lib/types/analysisFilters";
import { useCasesAnalysis, useCasesByAnalysis } from "@/hooks/useCases";

const DEPENDENT_FILTER_KEYS: ReadonlyArray<FilterKey> = [
  "organizations",
  "CM",
  "SKU",
  "NVPN",
] as const;

const createFilterValue = (item: unknown): FilterValue => {
  const itemObj = item as Record<string, unknown>;
  const name = String(itemObj?.name ?? item);
  const key = String(itemObj?.key ?? itemObj?.name ?? item);

  return { name, key };
};

const createFilterOptions = (items: unknown[] = []): FilterValue[] => [
  FILTER_ALL_VALUE,
  ...items.filter(Boolean).map(createFilterValue),
];

export const useAnalysisFilters = () => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  const { data: analysisResponse, isLoading: isLoadingAnalysis } =
    useCasesAnalysis();
  const analysisKey = filters.analysis.key || "";
  const { data: casesResponse, isLoading: isLoadingCases } =
    useCasesByAnalysis(analysisKey);

  const availableOptions = useMemo<FilterOptions>(() => {
    const options = { ...FILTER_OPTIONS };

    if (analysisResponse?.data?.analysis) {
      options.analysis = createFilterOptions(analysisResponse.data.analysis);
    }

    if (analysisKey && casesResponse?.data) {
      DEPENDENT_FILTER_KEYS.forEach((filterKey) => {
        const data = casesResponse.data[filterKey];
        options[filterKey] = createFilterOptions(
          Array.isArray(data) ? data : []
        );
      });
    }

    return options;
  }, [
    analysisResponse?.data?.analysis,
    casesResponse?.data,
    analysisKey,
  ]);

  const handleFilterChange = useCallback(
    (filterKey: FilterKey, value: string): void => {
      const selectedOption = availableOptions[filterKey]?.find(
        (option) => option.name === value
      );

      if (!selectedOption) return;

      setFilters((prevFilters) => {
        if (filterKey === "analysis") {
          return {
            ...INITIAL_FILTERS,
            analysis: selectedOption,
          };
        }

        return {
          ...prevFilters,
          [filterKey]: selectedOption,
        };
      });
    },
    [availableOptions]
  );

  const resetFilters = useCallback((): void => {
    setFilters(INITIAL_FILTERS);
  }, []);

  const isDisabled = useCallback(
    (filterKey: FilterKey): boolean => {
      return filterKey !== "analysis" && !analysisKey;
    },
    [analysisKey]
  );

  return {
    filters,
    availableOptions,
    isDisabled,
    handleFilterChange,
    resetFilters,
    isLoading: isLoadingAnalysis || isLoadingCases,
  };
};
