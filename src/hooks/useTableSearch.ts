import { useState, useMemo } from "react";
import { TableDataRow } from "@/lib/types/datatable";

interface UseTableSearchProps {
  rows: TableDataRow[];
  headers: { text: string; accessorKey: string }[];
}

interface UseTableSearchReturn {
  searchTerm: string;
  filteredRows: TableDataRow[];
  handleSearch: (term: string) => void;
  hasResults: boolean;
}

// Helper function to build the indexed search text for each row
function buildSearchText(
  row: TableDataRow,
  headers: { accessorKey: string }[]
) {
  return headers
    .map(({ accessorKey }) => {
      const value = row[accessorKey];
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    })
    .join(" ")
    .toLowerCase();
}

export const useTableSearch = ({
  rows,
  headers,
}: UseTableSearchProps): UseTableSearchReturn => {
  const [searchTerm, setSearchTerm] = useState("");

  // Build the search index only when rows or headers change
  const searchIndex = useMemo(() => {
    return rows.map((row) => ({
      row,
      searchText: buildSearchText(row, headers),
    }));
  }, [rows, headers]);

  // Filter using only the precomputed search index (much faster)
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;

    const searchLower = searchTerm.toLowerCase();
    return searchIndex
      .filter((item) => item.searchText.includes(searchLower))
      .map((item) => item.row);
  }, [searchTerm, rows, searchIndex]);

  const handleSearch = setSearchTerm;

  const hasResults = filteredRows.length > 0;

  return {
    searchTerm,
    filteredRows,
    handleSearch,
    hasResults,
  };
};
