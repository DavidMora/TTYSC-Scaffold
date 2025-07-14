import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilter";
import { FILTER_CONFIGS, FilterKeys } from "@/lib/constants/UI/analysisFilters";
import type { FilterState, FilterOptions } from "@/lib/types/analysisFilters";

describe("AnalysisFilter", () => {
  const mockFilters: FilterState = {
    [FilterKeys.ANALYSIS]: "Supply Gap Analysis",
    [FilterKeys.ORGANIZATION]: "North America",
    [FilterKeys.CM_SITE_NAME]: "Site 001 - New York",
    [FilterKeys.SKU]: "SKU-12345",
    [FilterKeys.NVPN]: "NVPN-001",
  };

  const mockAvailableOptions: FilterOptions = {
    [FilterKeys.ANALYSIS]: ["Supply Gap Analysis", "Demand Forecast"],
    [FilterKeys.ORGANIZATION]: ["North America", "Europe", "Asia"],
    [FilterKeys.CM_SITE_NAME]: ["Site 001 - New York", "Site 002 - Chicago"],
    [FilterKeys.SKU]: ["SKU-12345", "SKU-23456"],
    [FilterKeys.NVPN]: ["NVPN-001", "NVPN-002"],
  };

  const mockIsDisabled = jest.fn();
  const mockHandleFilterChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDisabled.mockReturnValue(false);
  });

  const renderComponent = (overrideProps = {}) => {
    const defaultProps = {
      filters: mockFilters,
      availableOptions: mockAvailableOptions,
      isDisabled: mockIsDisabled,
      handleFilterChange: mockHandleFilterChange,
    };

    return render(<AnalysisFilter {...defaultProps} {...overrideProps} />);
  };

  describe("Rendering", () => {
    it("renders the component without crashing", () => {
      renderComponent();
      expect(screen.getByText(/Click to view the data/)).toBeInTheDocument();
    });

    it("renders the instructional text", () => {
      renderComponent();
      expect(
        screen.getByText(
          "Click to view the data, choose your filters, and select the use cases to continue."
        )
      ).toBeInTheDocument();
    });

    it("renders all filter selects based on FILTER_CONFIGS", () => {
      renderComponent();
      const selects = screen.getAllByTestId("ui5-select");
      expect(selects).toHaveLength(FILTER_CONFIGS.length);
    });

    it("renders filter labels correctly", () => {
      renderComponent();
      FILTER_CONFIGS.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("displays correct values for each filter", () => {
      renderComponent();
      const selects = screen.getAllByTestId("ui5-select");

      FILTER_CONFIGS.forEach(({ key }, index) => {
        expect(selects[index]).toHaveValue(mockFilters[key]);
      });
    });

    it("renders options for each select", () => {
      renderComponent();

      FILTER_CONFIGS.forEach(({ key }) => {
        mockAvailableOptions[key].forEach((option) => {
          expect(screen.getByText(option)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Functionality", () => {
    it("calls handleFilterChange when a filter value changes", () => {
      renderComponent();
      const selects = screen.getAllByTestId("ui5-select");
      const firstSelect = selects[0];

      fireEvent.change(firstSelect, { target: { value: "Demand Forecast" } });

      expect(mockHandleFilterChange).toHaveBeenCalledWith(
        FILTER_CONFIGS[0].key,
        "Demand Forecast"
      );
    });

    it("does not call handleFilterChange when selectedValue is falsy (line 41 coverage)", () => {
      renderComponent();
      const selects = screen.getAllByTestId("ui5-select");
      const firstSelect = selects[0];
      mockHandleFilterChange.mockClear();
      fireEvent.change(firstSelect, { target: { value: "" } });
      expect(mockHandleFilterChange).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles empty availableOptions gracefully", () => {
      const emptyOptions: FilterOptions = {
        [FilterKeys.ANALYSIS]: [],
        [FilterKeys.ORGANIZATION]: [],
        [FilterKeys.CM_SITE_NAME]: [],
        [FilterKeys.SKU]: [],
        [FilterKeys.NVPN]: [],
      };

      renderComponent({ availableOptions: emptyOptions });

      expect(screen.getAllByTestId("ui5-select")).toHaveLength(
        FILTER_CONFIGS.length
      );
    });
  });
});
