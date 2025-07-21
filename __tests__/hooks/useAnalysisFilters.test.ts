import { renderHook, act } from "@testing-library/react";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import {
  FILTER_ALL_VALUE,
  INITIAL_FILTERS,
} from "@/lib/constants/UI/analysisFilters";
import { useCasesAnalysis, useCasesByAnalysis } from "@/hooks/useCases";

jest.mock("@/hooks/useCases", () => ({
  useCasesAnalysis: jest.fn(() => ({
    data: {
      data: {
        analysis: [
          { name: "Supply Gap Analysis", key: "supply-gap" },
          { name: "Demand Forecast Analysis", key: "demand-forecast" },
        ],
      },
    },
    isLoading: false,
    error: undefined,
  })),
  useCasesByAnalysis: jest.fn(() => ({
    data: {
      data: {
        organizations: [
          { name: "North America", key: "north-america" },
          { name: "Asia Pacific", key: "asia-pacific" },
        ],
        CM: [
          { name: "Site 001 - New York", key: "site-001" },
          { name: "Site 004 - Tokyo", key: "site-004" },
        ],
        SKU: [
          { name: "SKU-12345", key: "sku-12345" },
          { name: "SKU-23456", key: "sku-23456" },
        ],
        NVPN: [
          { name: "NVPN-001", key: "nvpn-001" },
          { name: "NVPN-008", key: "nvpn-008" },
        ],
      },
    },
    isLoading: false,
    error: undefined,
  })),
}));

jest.mock("@/lib/constants/UI/analysisFilters", () => {
  const actual = jest.requireActual("@/lib/constants/UI/analysisFilters");
  return {
    ...actual,
    FILTER_OPTIONS: {
      analysis: [{ key: null, name: "All" }],
      organizations: [{ key: null, name: "All" }],
      CM: [{ key: null, name: "All" }],
      SKU: [{ key: null, name: "All" }],
      NVPN: [{ key: null, name: "All" }],
    },
  };
});

describe("useAnalysisFilters", () => {
  describe("Initial State", () => {
    it("should initialize with default filters", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.filters).toEqual({
        analysis: FILTER_ALL_VALUE,
        organizations: FILTER_ALL_VALUE,
        CM: FILTER_ALL_VALUE,
        SKU: FILTER_ALL_VALUE,
        NVPN: FILTER_ALL_VALUE,
      });
    });

    it("should provide initial available options", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.availableOptions.analysis).toEqual([
        FILTER_ALL_VALUE,
        { name: "Supply Gap Analysis", key: "supply-gap" },
        { name: "Demand Forecast Analysis", key: "demand-forecast" },
      ]);
    });

    it("should have correct initial disabled states", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.isDisabled("analysis")).toBe(false);
      expect(result.current.isDisabled("organizations")).toBe(true);
      expect(result.current.isDisabled("CM")).toBe(true);
      expect(result.current.isDisabled("SKU")).toBe(true);
      expect(result.current.isDisabled("NVPN")).toBe(true);
    });
  });

  describe("Filter Changes", () => {
    it("should not update filter if option not found", () => {
      const { result } = renderHook(() => useAnalysisFilters());
      const initialFilters = result.current.filters;

      act(() => {
        result.current.handleFilterChange("analysis", "Non-existent Analysis");
      });

      expect(result.current.filters).toEqual(initialFilters);
    });
  });

  describe("resetFilters", () => {
    it("should reset all filters to initial state", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange("analysis", "Supply Gap Analysis");
      });

      act(() => {
        result.current.handleFilterChange("organizations", "North America");
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(INITIAL_FILTERS);
    });
  });

  describe("Data Processing Edge Cases", () => {
    it("should handle createFilterValue with primitive values", () => {
      (useCasesAnalysis as jest.Mock).mockReturnValueOnce({
        data: {
          data: {
            analysis: ["string-value", 123, null, undefined],
          },
        },
        isLoading: false,
        error: undefined,
      });

      const { result } = renderHook(() => useAnalysisFilters());

      expect(result.current.availableOptions.analysis).toEqual([
        FILTER_ALL_VALUE,
        { name: "string-value", key: "string-value" },
        { name: "123", key: "123" },
      ]);
    });

    it("should handle non-array data in casesResponse", () => {
      jest.clearAllMocks();

      (useCasesAnalysis as jest.Mock).mockReturnValue({
        data: {
          data: {
            analysis: [{ name: "Supply Gap Analysis", key: "supply-gap" }],
          },
        },
        isLoading: false,
        error: undefined,
      });

      (useCasesByAnalysis as jest.Mock).mockReturnValue({
        data: {
          data: {
            organizations: "not-an-array",
            CM: null,
            SKU: undefined,
            NVPN: { invalid: "object" },
          },
        },
        isLoading: false,
        error: undefined,
      });

      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange("analysis", "Supply Gap Analysis");
      });

      expect(result.current.availableOptions.organizations).toEqual([
        FILTER_ALL_VALUE,
      ]);
      expect(result.current.availableOptions.CM).toEqual([FILTER_ALL_VALUE]);
      expect(result.current.availableOptions.SKU).toEqual([FILTER_ALL_VALUE]);
      expect(result.current.availableOptions.NVPN).toEqual([FILTER_ALL_VALUE]);
    });
  });

  describe("Loading States", () => {
    it("should handle loading state from useCasesAnalysis", () => {
      (useCasesAnalysis as jest.Mock).mockReturnValueOnce({
        data: null,
        isLoading: true,
        error: undefined,
      });

      const { result } = renderHook(() => useAnalysisFilters());
      expect(result.current.isLoading).toBe(true);
    });
  });
});
