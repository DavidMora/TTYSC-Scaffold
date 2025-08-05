import { renderHook, act } from "@testing-library/react";
import { useTableData } from "@/hooks/useTableData";
import { TableDataRow } from "@/lib/types/datatable";

const mockHeaders = [
  { text: "Name", accessorKey: "name" },
  { text: "Age", accessorKey: "age" },
  { text: "Email", accessorKey: "email" },
];

const mockRows: TableDataRow[] = [
  { id: "1", name: "John Doe", age: 30, email: "john@example.com" },
  { id: "2", name: "Jane Smith", age: 25, email: "jane@example.com" },
  { id: "3", name: "Bob Johnson", age: 35, email: "bob@example.com" },
];

describe("useTableData", () => {
  describe("Initial State", () => {
    it("should return all rows when search term is empty", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      expect(result.current.searchTerm).toBe("");
      expect(result.current.filteredRows).toHaveLength(3);
      expect(result.current.hasResults).toBe(true);
    });

    it("should return empty filtered rows when input rows are empty", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: [], headers: mockHeaders })
      );

      expect(result.current.filteredRows).toHaveLength(0);
      expect(result.current.hasResults).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    it("should filter rows by name", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.searchTerm).toBe("john");
      expect(result.current.filteredRows).toHaveLength(2); // "John Doe" and "Bob Johnson"
      expect(result.current.hasResults).toBe(true);
    });

    it("should filter rows by email", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("jane@example.com");
      });

      expect(result.current.searchTerm).toBe("jane@example.com");
      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("Jane Smith");
      expect(result.current.hasResults).toBe(true);
    });

    it("should filter rows by age", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("30");
      });

      expect(result.current.searchTerm).toBe("30");
      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("John Doe");
      expect(result.current.hasResults).toBe(true);
    });

    it("should be case insensitive", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("JOHN");
      });

      expect(result.current.filteredRows).toHaveLength(2);
      expect(result.current.hasResults).toBe(true);
    });

    it("should return no results for non-matching search", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("xyz");
      });

      expect(result.current.searchTerm).toBe("xyz");
      expect(result.current.filteredRows).toHaveLength(0);
      expect(result.current.hasResults).toBe(false);
    });

    it("should return all rows when search term is cleared", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.filteredRows).toHaveLength(2);

      act(() => {
        result.current.handleSearch("");
      });

      expect(result.current.searchTerm).toBe("");
      expect(result.current.filteredRows).toHaveLength(3);
      expect(result.current.hasResults).toBe(true);
    });

    it("should handle whitespace-only search terms", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("   ");
      });

      expect(result.current.filteredRows).toHaveLength(3);
      expect(result.current.hasResults).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values", () => {
      const rowsWithNulls: TableDataRow[] = [
        { id: "1", name: "John Doe", age: null, email: "john@example.com" },
        { id: "2", name: null, age: 25, email: "jane@example.com" },
      ];

      const { result } = renderHook(() =>
        useTableData({ rows: rowsWithNulls, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.hasResults).toBe(true);
    });

    it("should handle object values by stringifying them", () => {
      const rowsWithObjects: TableDataRow[] = [
        {
          id: "1",
          name: "John Doe",
          age: 30,
          email: {
            primary: "john@example.com",
            secondary: "john.doe@work.com",
          },
        },
      ];

      const { result } = renderHook(() =>
        useTableData({ rows: rowsWithObjects, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john@example.com");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.hasResults).toBe(true);
    });

    it("should handle empty headers array", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: [] })
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.filteredRows).toHaveLength(0);
      expect(result.current.hasResults).toBe(false);
    });

    it("should handle search across multiple columns", () => {
      const { result } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john doe");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("John Doe");
      expect(result.current.hasResults).toBe(true);
    });
  });

  describe("Performance", () => {
    it("should not re-filter when search term hasn't changed", () => {
      const { result, rerender } = renderHook(() =>
        useTableData({ rows: mockRows, headers: mockHeaders })
      );

      const initialFilteredRows = result.current.filteredRows;

      // Re-render with same props
      rerender();

      expect(result.current.filteredRows).toBe(initialFilteredRows);
    });

    it("should update filtered rows when input data changes", () => {
      const { result, rerender } = renderHook(
        ({ rows, headers }) => useTableData({ rows, headers }),
        { initialProps: { rows: mockRows, headers: mockHeaders } }
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.filteredRows).toHaveLength(2);

      // Add a new row and re-render
      const newRows = [
        ...mockRows,
        { id: "4", name: "Johnny Cash", age: 40, email: "johnny@example.com" },
      ];
      rerender({ rows: newRows, headers: mockHeaders });

      expect(result.current.filteredRows).toHaveLength(3);
      expect(result.current.hasResults).toBe(true);
    });
  });

  describe("Filter Functionality", () => {
    const mockFilters = [
      {
        type: "select" as const,
        key: "age",
        label: "Age",
        placeholder: "Select age",
        options: [
          { value: "25", text: "25" },
          { value: "30", text: "30" },
          { value: "35", text: "35" },
        ],
      },
    ];

    it("should filter rows by select filter", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: mockFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({ filterKey: "age", value: "30" });
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("John Doe");
    });

    it("should combine search and filters", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: mockFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({ filterKey: "age", value: "25" });
        result.current.handleSearch("jane");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("Jane Smith");
    });

    it("should clear all filters", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: mockFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({ filterKey: "age", value: "30" });
        result.current.handleSearch("test");
      });

      expect(result.current.filteredRows).toHaveLength(0);

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchTerm).toBe("");
      expect(result.current.filteredRows).toHaveLength(3);
    });
  });

  describe("Auto-generated Filter Options", () => {
    it("should auto-generate options for select filters without options", () => {
      const filtersWithoutOptions = [
        {
          type: "select" as const,
          key: "age",
          label: "Age",
          placeholder: "Select age",
          accessorKey: "age",
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: filtersWithoutOptions,
        })
      );

      expect(result.current.processedFilters).toHaveLength(1);
      const processedFilter = result.current.processedFilters[0];
      expect(processedFilter.type).toBe("select");
      if (processedFilter.type === "select") {
        expect(processedFilter.options).toEqual([
          { value: "25", text: "25" },
          { value: "30", text: "30" },
          { value: "35", text: "35" },
        ]);
      }
    });

    it("should handle filters with predefined options", () => {
      const filtersWithOptions = [
        {
          type: "select" as const,
          key: "status",
          label: "Status",
          placeholder: "Select status",
          options: [
            { value: "active", text: "Active" },
            { value: "inactive", text: "Inactive" },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: filtersWithOptions,
        })
      );

      expect(result.current.processedFilters).toHaveLength(1);
      const processedFilter = result.current.processedFilters[0];
      expect(processedFilter.type).toBe("select");
      if (processedFilter.type === "select") {
        expect(processedFilter.options).toEqual([
          { value: "active", text: "Active" },
          { value: "inactive", text: "Inactive" },
        ]);
      }
    });

    it("should handle date filters", () => {
      const dateFilters = [
        {
          type: "date" as const,
          key: "created",
          label: "Created Date",
          placeholder: "Select date",
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: dateFilters,
        })
      );

      expect(result.current.processedFilters).toHaveLength(1);
      const processedFilter = result.current.processedFilters[0];
      expect(processedFilter.type).toBe("date");
    });
  });

  describe("Date Filtering", () => {
    const rowsWithDates: TableDataRow[] = [
      { id: "1", name: "John", date: "2024-01-01" },
      { id: "2", name: "Jane", date: "2024-02-01" },
      { id: "3", name: "Bob", date: "2024-01-01" },
    ];

    const dateFilters = [
      {
        type: "date" as const,
        key: "date",
        label: "Date",
        placeholder: "Select date",
      },
    ];

    it("should filter rows by date", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: rowsWithDates,
          headers: [{ text: "Date", accessorKey: "date" }],
          filters: dateFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({
          filterKey: "date",
          value: "2024-01-01",
        });
      });

      expect(result.current.filteredRows).toHaveLength(2);
      expect(result.current.filteredRows.map((row) => row.name)).toEqual([
        "John",
        "Bob",
      ]);
    });

    it("should handle invalid date values gracefully", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: [{ id: "1", name: "John", date: "invalid-date" }],
          headers: [{ text: "Date", accessorKey: "date" }],
          filters: dateFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({
          filterKey: "date",
          value: "2024-01-01",
        });
      });

      expect(result.current.filteredRows).toHaveLength(0);
    });
  });

  describe("Complex Data Types", () => {
    const complexRows: TableDataRow[] = [
      {
        id: "1",
        name: "John",
        metadata: { role: "admin", active: true },
        tags: "developer,lead",
      },
      {
        id: "2",
        name: "Jane",
        metadata: { role: "user", active: false },
        tags: "designer",
      },
    ];

    it("should handle object values in search", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: complexRows,
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Metadata", accessorKey: "metadata" },
          ],
        })
      );

      act(() => {
        result.current.handleSearch("admin");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("John");
    });

    it("should handle object values in filter generation", () => {
      const filtersForObjects = [
        {
          type: "select" as const,
          key: "metadata",
          label: "Metadata",
          placeholder: "Select metadata",
          accessorKey: "metadata",
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: complexRows,
          headers: [{ text: "Metadata", accessorKey: "metadata" }],
          filters: filtersForObjects,
        })
      );

      expect(result.current.processedFilters).toHaveLength(1);
      const processedFilter = result.current.processedFilters[0];
      if (processedFilter.type === "select") {
        expect(processedFilter.options).toHaveLength(2);
        expect(processedFilter.options[0].value).toContain("role");
      }
    });

    it("should handle object values in select filters", () => {
      const filtersForObjects = [
        {
          type: "select" as const,
          key: "metadata",
          label: "Metadata",
          placeholder: "Select metadata",
          accessorKey: "metadata",
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: complexRows,
          headers: [{ text: "Metadata", accessorKey: "metadata" }],
          filters: filtersForObjects,
        })
      );

      act(() => {
        result.current.handleFilterChange({
          filterKey: "metadata",
          value: '{"role":"admin","active":true}',
        });
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("John");
    });
  });

  describe("Edge Cases for Search", () => {
    const edgeRows: TableDataRow[] = [
      { id: "1", name: "John", value: null },
      { id: "2", name: "Jane", value: "" },
      { id: "3", name: "Bob", value: 0 },
      { id: "4", name: "Alice", value: false },
      { id: "5", name: "Mike", unknownType: "symbol" },
    ];

    it("should handle various data types in search text building", () => {
      const { result } = renderHook(() =>
        useTableData({
          rows: edgeRows,
          headers: [
            { text: "Name", accessorKey: "name" },
            { text: "Value", accessorKey: "value" },
            { text: "Unknown", accessorKey: "unknownType" },
          ],
        })
      );

      act(() => {
        result.current.handleSearch("false");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0].name).toBe("Alice");
    });

    it("should handle empty filter values", () => {
      const simpleFilters = [
        {
          type: "select" as const,
          key: "age",
          label: "Age",
          placeholder: "Select age",
          options: [
            { value: "25", text: "25" },
            { value: "30", text: "30" },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useTableData({
          rows: mockRows,
          headers: mockHeaders,
          filters: simpleFilters,
        })
      );

      act(() => {
        result.current.handleFilterChange({ filterKey: "age", value: "" });
      });

      expect(result.current.filteredRows).toHaveLength(3); // Should return all rows when filter is empty

      act(() => {
        result.current.handleFilterChange({ filterKey: "age", value: "[]" });
      });

      expect(result.current.filteredRows).toHaveLength(0); // Should filter when value is "[]" string
    });

    it("should handle date filter error cases", () => {
      const dateFilters = [
        {
          type: "date" as const,
          key: "date",
          label: "Date",
          placeholder: "Select date",
        },
      ];

      // Test by temporarily modifying the hook to force an exception
      // We'll override the Date constructor locally within the test
      const originalDateConstructor = Date;

      // Mock the Date constructor to throw an error
      jest
        .spyOn(global, "Date")
        .mockImplementation((value?: string | number | Date) => {
          // Throw error only for specific values to trigger catch block
          if (typeof value === "string" && value.includes("error")) {
            throw new Error("Simulated date error");
          }
          return new originalDateConstructor(value as string | number | Date);
        });

      const { result } = renderHook(() =>
        useTableData({
          rows: [{ id: "1", name: "John", date: "2024-01-01" }],
          headers: [{ text: "Date", accessorKey: "date" }],
          filters: dateFilters,
        })
      );

      act(() => {
        // This should trigger the error in Date constructor
        result.current.handleFilterChange({
          filterKey: "date",
          value: "error-date",
        });
      });

      // Should handle date parsing errors gracefully
      expect(result.current.filteredRows).toHaveLength(0);

      // Restore the original Date constructor
      jest.restoreAllMocks();
    });

    it("should handle unknown filter types by returning true", () => {
      const testFilter = {
        type: "select" as const,
        key: "category",
        label: "Category",
        placeholder: "Select category",
      };

      const { result } = renderHook(() =>
        useTableData({
          rows: [
            { id: "1", name: "John", category: "A" },
            { id: "2", name: "Jane", category: "B" },
          ],
          headers: [{ text: "Category", accessorKey: "category" }],
          filters: [testFilter],
        })
      );

      // Temporarily modify the filter type to something unknown
      Object.defineProperty(testFilter, "type", {
        value: "custom",
        writable: true,
        configurable: true,
      });

      act(() => {
        result.current.handleFilterChange({
          filterKey: "category",
          value: "A",
        });
      });

      // With unknown filter type, should default to true and return all rows
      expect(result.current.filteredRows).toHaveLength(2);
    });
  });
});
