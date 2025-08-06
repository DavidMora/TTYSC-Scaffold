import { useState, useMemo, useCallback } from "react";
import {
  TableDataRow,
  Filter,
  FilterChangeEvent,
  TableToolbarFilter,
  FilterOption,
} from "@/lib/types/datatable";
import { getValueByAccessor } from "@/lib/utils/tableHelpers";

interface UseTableDataProps {
  rows: TableDataRow[];
  headers: { text: string; accessorKey: string }[];
  filters?: TableToolbarFilter[];
}

interface UseTableDataReturn {
  searchTerm: string;
  activeFilters: Record<string, unknown>;
  filteredRows: TableDataRow[];
  processedFilters: Filter[];
  handleSearch: (term: string) => void;
  handleFilterChange: (event: FilterChangeEvent) => void;
  clearFilters: () => void;
  hasResults: boolean;
}

// Helper function to get unique values from data for select filters
function getUniqueValuesFromData(
  rows: TableDataRow[],
  accessorKey: string
): FilterOption[] {
  const uniqueValues = new Set<string>();

  rows.forEach((row) => {
    const value = getValueByAccessor(row, accessorKey);
    if (value !== undefined && value !== null) {
      // Handle different types safely
      if (typeof value === "object") {
        try {
          uniqueValues.add(JSON.stringify(value));
        } catch {
          uniqueValues.add("[Complex Object]");
        }
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        uniqueValues.add(value.toString());
      }
    }
  });

  return Array.from(uniqueValues)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, text: value }));
}

// Convert TableToolbarFilter to Filter
function convertToTableToolbarFilter(filter: TableToolbarFilter): Filter {
  if (filter.type === "select") {
    return {
      type: "select" as const,
      key: filter.key,
      label: filter.label,
      placeholder: filter.placeholder,
      options: filter.options || [],
      value: filter.value,
    };
  } else {
    return {
      type: "date" as const,
      key: filter.key,
      label: filter.label,
      placeholder: filter.placeholder,
      value: filter.value,
    };
  }
}

// Process filters and auto-generate options for select filters
function processFilters(
  filters: TableToolbarFilter[],
  tableRows: TableDataRow[]
): Filter[] {
  return filters.map((filter) => {
    if (filter.type === "select" && filter.accessorKey && !filter.options) {
      const processedFilter = {
        ...filter,
        options: getUniqueValuesFromData(tableRows, filter.accessorKey),
      };
      return convertToTableToolbarFilter(processedFilter);
    }
    return convertToTableToolbarFilter(filter);
  });
}

// Helper function to build the indexed search text for each row
function buildSearchText(
  row: TableDataRow,
  headers: { accessorKey: string }[]
) {
  return headers
    .map(({ accessorKey }) => {
      const value = getValueByAccessor(row, accessorKey);
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        return value.toString();
      }
      return "";
    })
    .join(" ")
    .toLowerCase();
}

// Helper function to check if filter value is empty
function isFilterValueEmpty(filterValue: unknown): boolean {
  return (
    !filterValue ||
    filterValue === "" ||
    (Array.isArray(filterValue) && filterValue.length === 0)
  );
}

// Helper function to convert value to string for comparison
function valueToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value.toString();
  }
  return "";
}

// Helper function to match select filter
function matchSelectFilter(rowValue: unknown, filterValue: unknown): boolean {
  const rowValueStr = valueToString(rowValue);
  const filterValueStr = typeof filterValue === "string" ? filterValue : "";
  return rowValueStr === filterValueStr;
}

// Helper function to match date filter
function matchDateFilter(rowValue: unknown, filterValue: unknown): boolean {
  try {
    const rowDate = new Date(rowValue as string);
    const filterDate = new Date(filterValue as string);
    return rowDate.toDateString() === filterDate.toDateString();
  } catch {
    return false;
  }
}

// Apply filters to rows
function applyFilters(
  rows: TableDataRow[],
  activeFilters: Record<string, unknown>,
  filters: Filter[]
): TableDataRow[] {
  return rows.filter((row) => {
    return filters.every((filter) => {
      const filterValue = activeFilters[filter.key];

      if (isFilterValueEmpty(filterValue)) {
        return true;
      }

      const rowValue = getValueByAccessor(row, filter.key);

      if (filter.type === "select") {
        return matchSelectFilter(rowValue, filterValue);
      } else if (filter.type === "date") {
        return matchDateFilter(rowValue, filterValue);
      } else {
        console.warn(`Unhandled filter type: ${filter.type}`);
        return false;
      }
    });
  });
}

export const useTableData = ({
  rows,
  headers,
  filters = [],
}: UseTableDataProps): UseTableDataReturn => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>(
    {}
  );

  // Process filters with memoization
  const processedFilters = useMemo(() => {
    return processFilters(filters, rows);
  }, [filters, rows]);

  // Build the search index only when rows or headers change
  const searchIndex = useMemo(() => {
    return rows.map((row) => ({
      row,
      searchText: buildSearchText(row, headers),
    }));
  }, [rows, headers]);

  // Apply filters first, then search
  const filteredRows = useMemo(() => {
    let result = rows;

    // Apply filters using processed filters
    if (Object.keys(activeFilters).length > 0) {
      result = applyFilters(result, activeFilters, processedFilters);
    }

    // Apply search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const filteredSearchIndex = searchIndex.filter(
        (item) =>
          result.includes(item.row) && item.searchText.includes(searchLower)
      );
      result = filteredSearchIndex.map((item) => item.row);
    }

    return result;
  }, [rows, activeFilters, searchTerm, searchIndex, processedFilters]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((event: FilterChangeEvent) => {
    setActiveFilters((prev) => ({
      ...prev,
      [event.filterKey]: event.value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchTerm("");
  }, []);

  const hasResults = filteredRows.length > 0;

  return {
    searchTerm,
    activeFilters,
    filteredRows,
    processedFilters,
    handleSearch,
    handleFilterChange,
    clearFilters,
    hasResults,
  };
};
