import { renderHook, act } from "@testing-library/react";
import { useAnalysisFilters } from "@/hooks/useAnalysisFilters";
import {
  FilterKeys,
  FILTER_ALL_VALUE,
  INITIAL_FILTERS,
} from "@/lib/constants/UI/analysisFilters";

jest.mock("@/lib/constants/UI/analysisFilters", () => ({
  FILTER_DATA: {
    "Supply Gap Analysis": {
      "North America": {
        "Site 001 - New York": {
          "SKU-12345": ["NVPN-001", "NVPN-002"],
          "SKU-23456": ["NVPN-003"],
        },
        "Site 002 - Chicago": {
          "SKU-34567": ["NVPN-004"],
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
        },
      },
    },
  },
  INITIAL_FILTERS: {
    analysis: "All",
    organization: "All",
    cmSiteName: "All",
    sku: "All",
    nvpn: "All",
  },
  FilterKeys: {
    ANALYSIS: "analysis",
    ORGANIZATION: "organization",
    CM_SITE_NAME: "cmSiteName",
    SKU: "sku",
    NVPN: "nvpn",
  },
  FILTER_ALL_VALUE: "All",
}));

describe("useAnalysisFilters", () => {
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

    it("should provide initial available options", () => {
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

    it("should handle non-existent analysis selection", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Non-existent Analysis"
        );
      });

      expect(result.current.filters[FilterKeys.ANALYSIS]).toBe(
        "Non-existent Analysis"
      );
      expect(result.current.availableOptions[FilterKeys.ORGANIZATION]).toEqual([
        FILTER_ALL_VALUE,
      ]);
    });

    it("should handle selection of non-existent organization", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ORGANIZATION,
          "Non-existent Org"
        );
      });

      expect(result.current.filters[FilterKeys.ORGANIZATION]).toBe(
        "Non-existent Org"
      );
      expect(result.current.availableOptions[FilterKeys.CM_SITE_NAME]).toEqual([
        FILTER_ALL_VALUE,
      ]);
    });
  });

  describe("Available Options Logic", () => {
    it("should handle case where nvpnData exists and contains data", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ORGANIZATION,
          "North America"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.CM_SITE_NAME,
          "Site 001 - New York"
        );
      });
      act(() => {
        result.current.handleFilterChange(FilterKeys.SKU, "SKU-12345");
      });

      expect(result.current.availableOptions[FilterKeys.NVPN]).toEqual([
        FILTER_ALL_VALUE,
        "NVPN-001",
        "NVPN-002",
      ]);
    });

    it("should handle case where siteData is undefined", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ORGANIZATION,
          "North America"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.CM_SITE_NAME,
          "Non-existent Site"
        );
      });

      expect(result.current.availableOptions[FilterKeys.SKU]).toEqual([
        FILTER_ALL_VALUE,
      ]);
      expect(result.current.availableOptions[FilterKeys.NVPN]).toEqual([
        FILTER_ALL_VALUE,
      ]);
    });

    it("should handle case where nvpnData is undefined (line 70 else case)", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ORGANIZATION,
          "North America"
        );
      });
      act(() => {
        result.current.handleFilterChange(
          FilterKeys.CM_SITE_NAME,
          "Site 001 - New York"
        );
      });
      act(() => {
        result.current.handleFilterChange(FilterKeys.SKU, "Non-existent SKU");
      });

      expect(result.current.availableOptions[FilterKeys.NVPN]).toEqual([
        FILTER_ALL_VALUE,
      ]);
    });
  });

  describe("resetFilters", () => {
    it("should reset all filters to initial state", () => {
      const { result } = renderHook(() => useAnalysisFilters());

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ANALYSIS,
          "Supply Gap Analysis"
        );
      });

      act(() => {
        result.current.handleFilterChange(
          FilterKeys.ORGANIZATION,
          "Example Organization"
        );
      });

      expect(result.current.filters[FilterKeys.ANALYSIS]).toBe(
        "Supply Gap Analysis"
      );
      expect(result.current.filters[FilterKeys.ORGANIZATION]).toBe(
        "Example Organization"
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(INITIAL_FILTERS);
      expect(result.current.filters[FilterKeys.ANALYSIS]).toBe(
        FILTER_ALL_VALUE
      );
      expect(result.current.filters[FilterKeys.ORGANIZATION]).toBe(
        FILTER_ALL_VALUE
      );
      expect(result.current.filters[FilterKeys.CM_SITE_NAME]).toBe(
        FILTER_ALL_VALUE
      );
      expect(result.current.filters[FilterKeys.SKU]).toBe(FILTER_ALL_VALUE);
      expect(result.current.filters[FilterKeys.NVPN]).toBe(FILTER_ALL_VALUE);
    });
  });
});
