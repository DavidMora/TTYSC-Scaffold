import { renderHook, act } from "@testing-library/react";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import {
  FilterKeys,
  FILTER_ALL_VALUE,
  INITIAL_FILTERS,
} from "@/lib/constants/UI/analysisFilters";

jest.mock("@/hooks/useCases", () => ({
  useCasesAnalysis: jest.fn(),
  useCasesByAnalysis: jest.fn(),
}));

import { useCasesAnalysis, useCasesByAnalysis } from "@/hooks/useCases";

const mockUseCasesAnalysis = useCasesAnalysis as jest.MockedFunction<typeof useCasesAnalysis>;
const mockUseCasesByAnalysis = useCasesByAnalysis as jest.MockedFunction<typeof useCasesByAnalysis>;

const mockCasesAnalysisData = {
  data: {
    analysisTypes: [
      { name: "Supply Gap Analysis", key: "supply_gap" },
      { name: "Demand Forecast Analysis", key: "demand_forecast" },
    ],
  },
};

const mockCasesData = {
  data: {
    analysisNameType: "supply_gap",
    filters: {
      organizations: ["North America", "Europe"],
      CM: ["Site 001 - New York", "Site 002 - Chicago"],
      SKU: ["SKU-12345", "SKU-23456"],
      NVPN: ["NVPN-001", "NVPN-002"],
    },
  },
};

describe("useAnalysisFilters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock setup
    mockUseCasesAnalysis.mockReturnValue({
      data: mockCasesAnalysisData,
      isLoading: false,
      error: undefined,
    });
    
    mockUseCasesByAnalysis.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    });
  });

  describe("Initial State", () => {
    it("should initialize with default filters", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.filters).toEqual({
        [FilterKeys.ANALYSIS]: FILTER_ALL_VALUE,
        [FilterKeys.ORGANIZATION]: FILTER_ALL_VALUE,
        [FilterKeys.CM_SITE_NAME]: FILTER_ALL_VALUE,
        [FilterKeys.SKU]: FILTER_ALL_VALUE,
        [FilterKeys.NVPN]: FILTER_ALL_VALUE,
      });
    });

    it("should provide initial available options from API", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.availableOptions).toEqual({
        [FilterKeys.ANALYSIS]: [
          FILTER_ALL_VALUE,
          "Supply Gap Analysis",
          "Demand Forecast Analysis",
        ],
        [FilterKeys.ORGANIZATION]: [FILTER_ALL_VALUE],
        [FilterKeys.CM_SITE_NAME]: [FILTER_ALL_VALUE],
        [FilterKeys.SKU]: [FILTER_ALL_VALUE],
        [FilterKeys.NVPN]: [FILTER_ALL_VALUE],
      });
    });

    it("should have correct initial disabled states", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.isDisabled(FilterKeys.ANALYSIS)).toBe(false);
      expect(result.current.isDisabled(FilterKeys.ORGANIZATION)).toBe(true);
      expect(result.current.isDisabled(FilterKeys.CM_SITE_NAME)).toBe(true);
      expect(result.current.isDisabled(FilterKeys.SKU)).toBe(true);
      expect(result.current.isDisabled(FilterKeys.NVPN)).toBe(true);
    });

    it("should return loading state when API is loading", () => {
      mockUseCasesAnalysis.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      });
      
      const { result } = renderHook(() => useAnalysisFilters());
      
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("Filter Changes", () => {
    it("should update analysis filter and reset dependent filters", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });

      expect(result.current.filters).toEqual({
        [FilterKeys.ANALYSIS]: "Supply Gap Analysis",
        [FilterKeys.ORGANIZATION]: FILTER_ALL_VALUE,
        [FilterKeys.CM_SITE_NAME]: FILTER_ALL_VALUE,
        [FilterKeys.SKU]: FILTER_ALL_VALUE,
        [FilterKeys.NVPN]: FILTER_ALL_VALUE,
      });
    });

    it("should load cases data when analysis is selected", () => {
      mockUseCasesByAnalysis.mockReturnValue({
        data: mockCasesData,
        isLoading: false,
        error: undefined,
      });
      
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });

      expect(result.current.availableOptions[FilterKeys.ORGANIZATION]).toEqual([
        FILTER_ALL_VALUE,
        "North America",
        "Europe",
      ]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty or invalid filter values", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(FilterKeys.ANALYSIS, "");
      });

      expect(result.current.filters[FilterKeys.ANALYSIS]).toBe(
        FILTER_ALL_VALUE
      );
    });

    it("should handle API loading states", () => {
      mockUseCasesAnalysis.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
      });
      
      const { result } = renderHook(() => useAnalysisFilters());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.availableOptions[FilterKeys.ANALYSIS]).toEqual([FILTER_ALL_VALUE]);
    });

    it("should handle API error states", () => {
      mockUseCasesAnalysis.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error("API Error"),
      });
      
      const { result } = renderHook(() => useAnalysisFilters());
      
      expect(result.current.availableOptions[FilterKeys.ANALYSIS]).toEqual([FILTER_ALL_VALUE]);
    });
  });

  describe("Reset Functionality", () => {
    it("should reset all filters to initial state", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      // Set some filters
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });

      // Reset filters
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(INITIAL_FILTERS);
    });
  });
});
