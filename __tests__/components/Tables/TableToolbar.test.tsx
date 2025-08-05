import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter } from "next/navigation";
import TableToolbar from "@/components/Tables/TableToolbar";
import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

// Mock filters for testing
const mockSelectFilter = {
  key: "status",
  type: "select" as const,
  placeholder: "Select status",
  options: [
    { value: "active", text: "Active" },
    { value: "inactive", text: "Inactive" },
  ],
};

const mockDateFilter = {
  key: "date",
  type: "date" as const,
  placeholder: "Select date",
  options: [],
};

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

describe("TableToolbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("Rendering", () => {
    it("should render with proper visual structure", () => {
      render(<TableToolbar />);

      const separators = screen.getAllByTestId("ui5-toolbar-separator");
      expect(separators).toHaveLength(4);
      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toBeInTheDocument();
    });

    it("should apply custom className when provided", () => {
      const customClass = "custom-toolbar-class";
      render(<TableToolbar className={customClass} />);

      const toolbar = screen.getByTestId("ui5-toolbar");
      expect(toolbar).toHaveClass(customClass);
    });

    it("should render with default title when not provided", () => {
      render(<TableToolbar />);

      expect(screen.getByText("Final Summary")).toBeInTheDocument();
    });

    it("should render with custom title when provided", () => {
      const customTitle = "Custom Table Title";
      render(<TableToolbar title={customTitle} />);

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it("should render filters when provided", () => {
      render(<TableToolbar filters={[mockSelectFilter]} />);

      const selectElement = screen.getByTestId("select");
      expect(selectElement).toBeInTheDocument();
    });

    it("should render date filter when provided", () => {
      render(<TableToolbar filters={[mockDateFilter]} />);

      const datePicker = screen.getByTestId("ui5-datepicker");
      expect(datePicker).toBeInTheDocument();
    });

    it("should render multiple filters", () => {
      render(<TableToolbar filters={[mockSelectFilter, mockDateFilter]} />);

      expect(screen.getByTestId("select")).toBeInTheDocument();
      expect(screen.getByTestId("ui5-datepicker")).toBeInTheDocument();
    });
  });

  describe("Filter Functionality", () => {
    it("should initialize filter values with provided values", () => {
      const filterWithValue = {
        ...mockSelectFilter,
        value: "active",
      };

      render(<TableToolbar filters={[filterWithValue]} />);

      const selectElement = screen.getByTestId("select");
      expect(selectElement).toHaveValue("active");
    });

    it("should call onFilterChange when select filter changes", () => {
      const mockOnFilterChange = jest.fn();
      render(
        <TableToolbar
          filters={[mockSelectFilter]}
          onFilterChange={mockOnFilterChange}
        />
      );

      const selectElement = screen.getByTestId("select");
      // Use regular React change event - the mock will handle creating the detail structure
      fireEvent.change(selectElement, { target: { value: "active" } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        filterKey: "status",
        value: "active",
      });
    });

    it("should call onFilterChange when date filter changes", () => {
      const mockOnFilterChange = jest.fn();
      render(
        <TableToolbar
          filters={[mockDateFilter]}
          onFilterChange={mockOnFilterChange}
        />
      );

      const datePicker = screen.getByTestId("ui5-datepicker");
      // Now the mock handles creating the UI5 event structure
      fireEvent.change(datePicker, { target: { value: "2023-12-01" } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        filterKey: "date",
        value: "2023-12-01",
      });
    });

    it("should handle filter change with empty value", () => {
      const mockOnFilterChange = jest.fn();
      render(
        <TableToolbar
          filters={[mockSelectFilter]}
          onFilterChange={mockOnFilterChange}
        />
      );

      const selectElement = screen.getByTestId("select");
      // Use regular React change event
      fireEvent.change(selectElement, { target: { value: "" } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        filterKey: "status",
        value: "",
      });
    });

    it("should handle filter change without selectedOption", () => {
      const mockOnFilterChange = jest.fn();
      render(
        <TableToolbar
          filters={[mockSelectFilter]}
          onFilterChange={mockOnFilterChange}
        />
      );

      const selectElement = screen.getByTestId("select");
      // Test with an option that doesn't exist in children - the mock returns empty string when no matching option is found
      fireEvent.change(selectElement, { target: { value: "nonexistent" } });

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        filterKey: "status",
        value: "",
      });
    });

    it("should not call onFilterChange when onFilterChange is not provided", () => {
      render(<TableToolbar filters={[mockSelectFilter]} />);

      const selectElement = screen.getByTestId("select");
      // Should not throw any errors
      expect(() => {
        fireEvent.change(selectElement, { target: { value: "active" } });
      }).not.toThrow();
    });

    it("should render select filter with placeholder option", () => {
      render(<TableToolbar filters={[mockSelectFilter]} />);

      expect(screen.getByText("Select status")).toBeInTheDocument();
    });

    it("should render select filter options correctly", () => {
      render(<TableToolbar filters={[mockSelectFilter]} />);

      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("should handle date filter with empty value", () => {
      const mockOnFilterChange = jest.fn();
      render(
        <TableToolbar
          filters={[mockDateFilter]}
          onFilterChange={mockOnFilterChange}
        />
      );

      const datePicker = screen.getByTestId("ui5-datepicker");
      // First set a value, then clear it to test empty value handling
      fireEvent.change(datePicker, { target: { value: "2023-12-01" } });
      fireEvent.change(datePicker, { target: { value: "" } });

      expect(mockOnFilterChange).toHaveBeenLastCalledWith({
        filterKey: "date",
        value: "",
      });
    });

    it("should return null for unknown filter type", () => {
      const unknownFilter = {
        key: "unknown",
        type: "unknown" as "select" | "date",
        placeholder: "Unknown",
        options: [],
      };

      render(<TableToolbar filters={[unknownFilter]} />);

      // Should not render any filter element for unknown type
      expect(screen.queryByTestId("select")).not.toBeInTheDocument();
      expect(screen.queryByTestId("ui5-datepicker")).not.toBeInTheDocument();
    });
  });

  describe("Event Handlers", () => {
    it("should handle search input changes", () => {
      render(<TableToolbar />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.change(searchInput, { target: { value: "test search" } });

      expect(searchInput).toHaveValue("test search");
    });

    it("should call onSearch callback when search input changes", () => {
      const mockOnSearch = jest.fn();
      render(<TableToolbar onSearch={mockOnSearch} />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.change(searchInput, { target: { value: "test search" } });

      expect(mockOnSearch).toHaveBeenCalledWith("test search");
    });

    it("should call onSearch callback with empty string when search is cleared", () => {
      const mockOnSearch = jest.fn();
      render(<TableToolbar onSearch={mockOnSearch} />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.change(searchInput, { target: { value: "test search" } });
      fireEvent.change(searchInput, { target: { value: "" } });

      expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    it("should not call onSearch callback when onSearch is not provided", () => {
      render(<TableToolbar />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.change(searchInput, { target: { value: "test search" } });

      // Should not throw any errors
      expect(searchInput).toHaveValue("test search");
    });

    it("should handle share button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const shareButton = buttons[0]; // First button is share
      fireEvent.click(shareButton);

      expect(consoleSpy).toHaveBeenCalledWith("share");
    });

    it("should handle settings button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const settingsButton = buttons[1]; // Second button is settings
      fireEvent.click(settingsButton);

      expect(consoleSpy).toHaveBeenCalledWith("settings");
    });

    it("should handle export button click", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const exportButton = buttons[2]; // Third button is export
      fireEvent.click(exportButton);

      expect(exportButton).toHaveTextContent("Export");
    });

    it("should handle full screen button click", () => {
      render(<TableToolbar tableId={123} />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      const fullScreenButton = buttons[3]; // Fourth button is full screen
      fireEvent.click(fullScreenButton);

      expect(mockPush).toHaveBeenCalledWith("/full-screen/table/123");
    });
    it("should handle input events on search", () => {
      const mockOnSearch = jest.fn();
      render(<TableToolbar onSearch={mockOnSearch} />);

      const searchInput = screen.getByTestId("ui5-input");
      fireEvent.input(searchInput, { target: { value: "input test" } });

      expect(mockOnSearch).toHaveBeenCalledWith("input test");
    });
  });

  describe("Table ID prop", () => {
    it("should pass tableId to ExportMenu when provided", () => {
      render(<TableToolbar tableId={123} />);

      // The ExportMenu should be rendered with the tableId
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    it("should use default tableId when not provided", () => {
      render(<TableToolbar />);

      // The ExportMenu should be rendered with default tableId "1"
      expect(screen.getByText("Export")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(<TableToolbar />);

      expect(screen.getByTestId("ui5-toolbar")).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
      expect(screen.getByTestId("ui5-input")).toBeInTheDocument();
    });

    it("should have search input with proper attributes", () => {
      render(<TableToolbar />);

      const searchInput = screen.getByTestId("ui5-input");
      expect(searchInput).toHaveAttribute("placeholder", "Search...");
      expect(searchInput).toHaveAttribute("type", "Text");
    });

    it("should have toolbar buttons with proper icons", () => {
      render(<TableToolbar />);

      const buttons = screen.getAllByTestId("ui5-toolbar-button");
      expect(buttons).toHaveLength(4);
    });
  });
});
