import { renderHook, act } from "@testing-library/react";
import { useTableSearch } from "@/hooks/useTableSearch";
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

describe("useTableSearch", () => {
  describe("Initial State", () => {
    it("should return all rows when search term is empty", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: mockRows, headers: mockHeaders })
      );

      expect(result.current.searchTerm).toBe("");
      expect(result.current.filteredRows).toHaveLength(3);
      expect(result.current.hasResults).toBe(true);
    });

    it("should return empty filtered rows when input rows are empty", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: [], headers: mockHeaders })
      );

      expect(result.current.filteredRows).toHaveLength(0);
      expect(result.current.hasResults).toBe(false);
    });
  });

  describe("Search Functionality", () => {
    it("should filter rows by name", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("JOHN");
      });

      expect(result.current.filteredRows).toHaveLength(2);
      expect(result.current.hasResults).toBe(true);
    });

    it("should return no results for non-matching search", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: rowsWithNulls, headers: mockHeaders })
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
        useTableSearch({ rows: rowsWithObjects, headers: mockHeaders })
      );

      act(() => {
        result.current.handleSearch("john@example.com");
      });

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.hasResults).toBe(true);
    });

    it("should handle empty headers array", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: mockRows, headers: [] })
      );

      act(() => {
        result.current.handleSearch("john");
      });

      expect(result.current.filteredRows).toHaveLength(0);
      expect(result.current.hasResults).toBe(false);
    });

    it("should handle search across multiple columns", () => {
      const { result } = renderHook(() =>
        useTableSearch({ rows: mockRows, headers: mockHeaders })
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
        useTableSearch({ rows: mockRows, headers: mockHeaders })
      );

      const initialFilteredRows = result.current.filteredRows;

      // Re-render with same props
      rerender();

      expect(result.current.filteredRows).toBe(initialFilteredRows);
    });

    it("should update filtered rows when input data changes", () => {
      const { result, rerender } = renderHook(
        ({ rows, headers }) => useTableSearch({ rows, headers }),
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
});
