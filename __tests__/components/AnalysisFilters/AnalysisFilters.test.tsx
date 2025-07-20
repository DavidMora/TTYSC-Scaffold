import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AnalysisFilter from "@/components/AnalysisFilters/AnalysisFilters";
import { FILTER_FIELDS, FilterKeys } from "@/lib/constants/UI/analysisFilters";
import type { FilterState, FilterOptions } from "@/lib/types/analysisFilters";

describe("AnalysisFilter", () => {
  const mockFilters: FilterState = {
    [FilterKeys.ANALYSIS]: { key: "supply-gap", name: "Supply Gap Analysis" },
    [FilterKeys.ORGANIZATION]: { key: "north-america", name: "North America" },
    [FilterKeys.CM_SITE_NAME]: { key: "site-001", name: "Site 001 - New York" },
    [FilterKeys.SKU]: { key: "sku-12345", name: "SKU-12345" },
    [FilterKeys.NVPN]: { key: "nvpn-001", name: "NVPN-001" },
  };

  const mockAvailableOptions: FilterOptions = {
    [FilterKeys.ANALYSIS]: [
      { key: "supply-gap", name: "Supply Gap Analysis" },
      { key: "demand-forecast", name: "Demand Forecast" },
    ],
    [FilterKeys.ORGANIZATION]: [
      { key: "north-america", name: "North America" },
      { key: "europe", name: "Europe" },
      { key: "asia", name: "Asia" },
    ],
    [FilterKeys.CM_SITE_NAME]: [
      { key: "site-001", name: "Site 001 - New York" },
      { key: "site-002", name: "Site 002 - Chicago" },
    ],
    [FilterKeys.SKU]: [
      { key: "sku-12345", name: "SKU-12345" },
      { key: "sku-23456", name: "SKU-23456" },
    ],
    [FilterKeys.NVPN]: [
      { key: "nvpn-001", name: "NVPN-001" },
      { key: "nvpn-002", name: "NVPN-002" },
    ],
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

    it("renders all filter selects based on FILTER_FIELDS", () => {
      renderComponent();
      const selects = screen.getAllByTestId("select");
      expect(selects).toHaveLength(FILTER_FIELDS.length);
    });

    it("renders filter labels correctly", () => {
      renderComponent();
      FILTER_FIELDS.forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("displays correct values for each filter", () => {
      renderComponent();
      const selects = screen.getAllByTestId("select");

      FILTER_FIELDS.forEach(({ key }, index) => {
        expect(selects[index]).toHaveValue(mockFilters[key].name);
      });
    });

    it("renders options for each select", () => {
      renderComponent();

      FILTER_FIELDS.forEach(({ key }) => {
        mockAvailableOptions[key].forEach((option) => {
          expect(screen.getByText(option.name)).toBeInTheDocument();
        });
      });
    });
  });

  describe("Functionality", () => {
    it("calls handleFilterChange when a filter value changes", () => {
      renderComponent();
      const selects = screen.getAllByTestId("select");
      const firstSelect = selects[0];

      fireEvent.change(firstSelect, { target: { value: "Demand Forecast" } });

      expect(mockHandleFilterChange).toHaveBeenCalledWith(
        FILTER_FIELDS[0].key,
        "Demand Forecast"
      );
    });

    it("does not call handleFilterChange when selectedValue is falsy (line 41 coverage)", () => {
      renderComponent();
      const selects = screen.getAllByTestId("select");
      const firstSelect = selects[0];
      mockHandleFilterChange.mockClear();

      // Trigger a change event with a falsy value (empty string)
      fireEvent.change(firstSelect, { target: { value: "" } });
      expect(mockHandleFilterChange).not.toHaveBeenCalled();

      // Also test with null value
      fireEvent.change(firstSelect, { target: { value: null } });
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

      expect(screen.getAllByTestId("select")).toHaveLength(
        FILTER_FIELDS.length
      );
    });
  });
});
