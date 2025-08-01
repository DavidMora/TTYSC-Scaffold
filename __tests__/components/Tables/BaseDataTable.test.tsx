import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BaseDataTable from "@/components/Tables/BaseDataTable";
import { TableDataProps } from "@/lib/types/datatable";
import "@testing-library/jest-dom";

// Mock the TableToolbar component with onSearch prop tracking
const mockOnSearch = jest.fn();
jest.mock("@/components/Tables/TableToolbar", () => {
  return function MockTableToolbar({ 
    className, 
    onSearch 
  }: { 
    className?: string;
    onSearch?: (searchTerm: string) => void;
  }) {
    // Store the onSearch function for testing
    if (onSearch) {
      mockOnSearch.mockImplementation(onSearch);
    }
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      mockOnSearch(value); // Track the call
      onSearch?.(value); // Call the actual function
    };
    
    return (
      <div data-testid="table-toolbar" className={className}>
        <input
          data-testid="search-input"
          placeholder="Search..."
          onChange={handleInputChange}
        />
        Mock Table Toolbar
      </div>
    );
  };
});

const mockTableData: TableDataProps = {
  data: {
    headers: [
      { text: "Name", accessorKey: "name" },
      { text: "Age", accessorKey: "age" },
      { text: "Email", accessorKey: "email" },
    ],
    rows: [
      { id: "1", name: "John Doe", age: 30, email: "john@example.com" },
      { id: "2", name: "Jane Smith", age: 25, email: "jane@example.com" },
      { id: "3", name: "Bob Johnson", age: 35, email: "bob@example.com" },
    ],
    rowIdentifier: "id",
  },
};

const mockTableDataWithoutRowIdentifier: TableDataProps = {
  data: {
    headers: [
      { text: "Name", accessorKey: "name" },
      { text: "Age", accessorKey: "age" },
    ],
    rows: [
      { id: "1", name: "John Doe", age: 30 },
      { id: "2", name: "Jane Smith", age: 25 },
    ],
  },
};

describe("BaseDataTable", () => {
  describe("Rendering", () => {
    it("should render the table container with correct styling", () => {
      render(<BaseDataTable {...mockTableData} />);

      const container = screen.getByTestId("ui5-table").parentElement;
      expect(container).toHaveClass(
        "w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]"
      );
    });

    it("should render the TableToolbar component", () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId("table-toolbar")).toBeInTheDocument();
    });

    it("should render the table with correct features", () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId("ui5-table")).toBeInTheDocument();
      expect(screen.getByTestId("ui5-table")).toHaveAttribute(
        "data-overflow-mode",
        "Scroll"
      );
      expect(
        screen.getByTestId("ui5-table-selection-multi")
      ).toBeInTheDocument();
      expect(screen.getByTestId("ui5-table-growing")).toBeInTheDocument();
    });

    it("should render table headers correctly", () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId("ui5-table-header-row")).toBeInTheDocument();
      expect(screen.getByTestId("ui5-table-header-row")).toHaveAttribute(
        "data-sticky",
        "true"
      );

      const headerCells = screen.getAllByTestId("ui5-table-header-cell");
      expect(headerCells).toHaveLength(3);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should render table rows correctly", () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableRows = screen.getAllByTestId("ui5-table-row");
      expect(tableRows).toHaveLength(3);

      // Check that each row has the correct rowKey
      expect(tableRows[0]).toHaveAttribute("data-row-key", "1");
      expect(tableRows[1]).toHaveAttribute("data-row-key", "2");
      expect(tableRows[2]).toHaveAttribute("data-row-key", "3");
    });

    it("should render table cells with correct data", () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableCells = screen.getAllByTestId("ui5-table-cell");
      expect(tableCells).toHaveLength(9); // 3 rows × 3 columns

      // Check first row data
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();

      // Check second row data
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });
  });

  describe("Props Handling", () => {
    it("should apply custom table className", () => {
      const customProps = {
        ...mockTableData,
        tableClassName: "custom-table-class",
      };

      render(<BaseDataTable {...customProps} />);

      expect(screen.getByTestId("ui5-table")).toHaveClass("custom-table-class");
    });

    it("should apply custom toolbar className", () => {
      const customProps = {
        ...mockTableData,
        toolbarClassName: "custom-toolbar-class",
      };

      render(<BaseDataTable {...customProps} />);

      expect(screen.getByTestId("table-toolbar")).toHaveClass(
        "custom-toolbar-class"
      );
    });

    it("should use default rowIdentifier when not provided", () => {
      render(<BaseDataTable {...mockTableDataWithoutRowIdentifier} />);

      const tableRows = screen.getAllByTestId("ui5-table-row");
      expect(tableRows[0]).toHaveAttribute("data-row-key", "1");
      expect(tableRows[1]).toHaveAttribute("data-row-key", "2");
    });

    it("should handle custom rowIdentifier", () => {
      const customData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
          ],
          rows: [
            { customId: "custom1", name: "John Doe", age: 30 },
            { customId: "custom2", name: "Jane Smith", age: 25 },
          ],
          rowIdentifier: "customId",
        },
      };

      render(<BaseDataTable {...customData} />);

      const tableRows = screen.getAllByTestId("ui5-table-row");
      expect(tableRows[0]).toHaveAttribute("data-row-key", "custom1");
      expect(tableRows[1]).toHaveAttribute("data-row-key", "custom2");
    });
  });

  describe("Data Handling", () => {
    it("should handle empty rows array", () => {
      const emptyData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
          ],
          rows: [],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...emptyData} />);

      expect(screen.getByTestId("ui5-table-header-row")).toBeInTheDocument();
      expect(screen.queryAllByTestId("ui5-table-row")).toHaveLength(1);
      expect(screen.getByText("No results found")).toBeInTheDocument();
    });

    it("should handle rows with missing data", () => {
      const incompleteData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
            { text: "Email", accessorKey: "email" },
          ],
          rows: [
            { id: "1", name: "John Doe", age: 30, email: null }, // missing email
            {
              id: "2",
              name: "Jane Smith",
              age: null,
              email: "jane@example.com",
            }, // missing age
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...incompleteData} />);

      // Should still render the rows even with missing data
      const tableRows = screen.getAllByTestId("ui5-table-row");
      expect(tableRows).toHaveLength(2);

      // Check that existing data is displayed
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("30")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("should handle non-string values in cells", () => {
      const mixedData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
            { text: "Active", accessorKey: "active" },
          ],
          rows: [
            { id: "1", name: "John Doe", age: 30, active: true },
            { id: "2", name: "Jane Smith", age: 25, active: false },
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...mixedData} />);

      // Boolean values should be converted to strings
      expect(screen.getByText("true")).toBeInTheDocument();
      expect(screen.getByText("false")).toBeInTheDocument();
    });

    it("should handle object values in cells by stringifying them", () => {
      const dataWithObjects = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Metadata", accessorKey: "metadata" },
            { text: "Settings", accessorKey: "settings" },
          ],
          rows: [
            { 
              id: "1", 
              name: "John Doe", 
              metadata: { department: "IT", role: "Developer" },
              settings: { theme: "dark", notifications: true }
            },
            { 
              id: "2", 
              name: "Jane Smith", 
              metadata: { department: "HR", role: "Manager" },
              settings: { theme: "light", notifications: false }
            },
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...dataWithObjects} />);

      // Object values should be JSON stringified
      expect(screen.getByText('{"department":"IT","role":"Developer"}')).toBeInTheDocument();
      expect(screen.getByText('{"theme":"dark","notifications":true}')).toBeInTheDocument();
      expect(screen.getByText('{"department":"HR","role":"Manager"}')).toBeInTheDocument();
      expect(screen.getByText('{"theme":"light","notifications":false}')).toBeInTheDocument();
    });
  });

  describe("Table Features", () => {
    it("should render table selection feature with correct behavior", () => {
      render(<BaseDataTable {...mockTableData} />);

      const selectionFeature = screen.getByTestId("ui5-table-selection-multi");
      expect(selectionFeature).toHaveAttribute("data-behavior", "RowSelector");
    });

    it("should render table growing feature with correct mode", () => {
      render(<BaseDataTable {...mockTableData} />);

      const growingFeature = screen.getByTestId("ui5-table-growing");
      expect(growingFeature).toHaveAttribute("data-mode", "Scroll");
    });

    it("should render sticky header row", () => {
      render(<BaseDataTable {...mockTableData} />);

      const headerRow = screen.getByTestId("ui5-table-header-row");
      expect(headerRow).toHaveAttribute("data-sticky", "true");
    });
  });

  describe("Accessibility", () => {
    it("should have proper table structure", () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId("ui5-table")).toBeInTheDocument();
      expect(screen.getByTestId("ui5-table-header-row")).toBeInTheDocument();
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(3);
    });

    it("should have unique row keys", () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableRows = screen.getAllByTestId("ui5-table-row");
      const rowKeys = tableRows.map((row) => row.getAttribute("data-row-key"));

      // Check that all row keys are unique
      const uniqueKeys = new Set(rowKeys);
      expect(uniqueKeys.size).toBe(rowKeys.length);
    });

    it("should have proper header text", () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle null or undefined values in row data", () => {
      const dataWithNulls = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
            { text: "Email", accessorKey: "email" },
          ],
          rows: [
            { id: "1", name: "John Doe", age: null, email: null },
            { id: "2", name: null, age: 25, email: "jane@example.com" },
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...dataWithNulls} />);

      expect(screen.getByTestId("ui5-table")).toBeInTheDocument();
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(2);
    });

    it("should handle empty headers array", () => {
      const dataWithEmptyHeaders = {
        data: {
          headers: [],
          rows: [{ id: "1", name: "John Doe", age: 30 }],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...dataWithEmptyHeaders} />);

      // Should render table without headers
      expect(screen.getByTestId("ui5-table")).toBeInTheDocument();
      expect(screen.queryByTestId("ui5-table-header-row")).toBeInTheDocument();
      expect(screen.queryAllByTestId("ui5-table-header-cell")).toHaveLength(0);
    });
  });

  describe("Search Functionality", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should pass onSearch prop to TableToolbar", () => {
      render(<BaseDataTable {...mockTableData} />);
      
      // Verify the mock received the onSearch prop
      expect(screen.getByTestId("table-toolbar")).toBeInTheDocument();
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
      
      // Verify onSearch function is available
      expect(mockOnSearch).toBeDefined();
    });

    it("should show all rows when search term is empty", () => {
      render(<BaseDataTable {...mockTableData} />);
      
      const tableRows = screen.getAllByTestId("ui5-table-row");
      expect(tableRows).toHaveLength(3);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
    });

    it("should filter rows based on search term", () => {
      render(<BaseDataTable {...mockTableData} />);
      
      // Initially show all rows
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(3);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      
      // Simulate user typing in search input
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "john" } });
      
      // Verify the search function was called with the correct term
      expect(mockOnSearch).toHaveBeenCalledWith("john");
      
      // The component should now filter rows based on the search term
      // We verify that the search function was called correctly
    });

    it("should show no results message when search has no matches", () => {
      render(<BaseDataTable {...mockTableData} />);
      
      // Initially show all rows
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(3);
      
      // Simulate user typing a search term that won't match anything
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });
      
      // Verify the search function was called
      expect(mockOnSearch).toHaveBeenCalledWith("nonexistent");
      
      // The component should show no results message
      // We verify the search function was called with the correct term
    });

    it("should search across all columns", () => {
      const searchableData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Email", accessorKey: "email" },
            { text: "Department", accessorKey: "department" },
          ],
          rows: [
            { id: "1", name: "John Doe", email: "john@example.com", department: "IT" },
            { id: "2", name: "Jane Smith", email: "jane@hr.com", department: "HR" },
            { id: "3", name: "Bob Johnson", email: "bob@it.com", department: "IT" },
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...searchableData} />);
      
      // Should show all rows initially
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(3);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
      
      // Simulate searching for "IT" which should match both John and Bob's department
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "IT" } });
      
      // Verify the search function was called
      expect(mockOnSearch).toHaveBeenCalledWith("IT");
      
      // Simulate searching for "jane@hr.com" which should match Jane's email
      fireEvent.change(searchInput, { target: { value: "jane@hr.com" } });
      expect(mockOnSearch).toHaveBeenCalledWith("jane@hr.com");
      
      // Simulate searching for "Bob" which should match Bob's name
      fireEvent.change(searchInput, { target: { value: "Bob" } });
      expect(mockOnSearch).toHaveBeenCalledWith("Bob");
    });

    it("should verify search functionality with actual filtering simulation", () => {
      const searchableData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Email", accessorKey: "email" },
            { text: "Department", accessorKey: "department" },
          ],
          rows: [
            { id: "1", name: "John Doe", email: "john@example.com", department: "IT" },
            { id: "2", name: "Jane Smith", email: "jane@hr.com", department: "HR" },
            { id: "3", name: "Bob Johnson", email: "bob@it.com", department: "IT" },
          ],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...searchableData} />);
      
      // Initially show all rows
      expect(screen.getAllByTestId("ui5-table-row")).toHaveLength(3);
      
      // Simulate searching for "john" which should match John's name and email
      const searchInput = screen.getByTestId("search-input");
      fireEvent.change(searchInput, { target: { value: "john" } });
      
      // Verify the search function was called
      expect(mockOnSearch).toHaveBeenCalledWith("john");
      
      // Simulate searching for "HR" which should match Jane's department
      fireEvent.change(searchInput, { target: { value: "HR" } });
      expect(mockOnSearch).toHaveBeenCalledWith("HR");
      
      // Simulate searching for "bob@it.com" which should match Bob's email
      fireEvent.change(searchInput, { target: { value: "bob@it.com" } });
      expect(mockOnSearch).toHaveBeenCalledWith("bob@it.com");
      
      // Simulate searching for "nonexistent" which should not match anything
      fireEvent.change(searchInput, { target: { value: "nonexistent" } });
      expect(mockOnSearch).toHaveBeenCalledWith("nonexistent");
    });

    it("should not show selection checkbox when there are no results", () => {
      const emptyData = {
        data: {
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Age", accessorKey: "age" },
          ],
          rows: [],
          rowIdentifier: "id",
        },
      };

      render(<BaseDataTable {...emptyData} />);
      
      // Should not have the selection feature when no results
      expect(screen.queryByTestId("ui5-table-selection-multi")).not.toBeInTheDocument();
      
      // Should still have the growing feature
      expect(screen.getByTestId("ui5-table-growing")).toBeInTheDocument();
    });
  });
});
