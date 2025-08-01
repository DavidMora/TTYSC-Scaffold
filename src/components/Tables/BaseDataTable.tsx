"use client";

import React from "react";
import {
  Table,
  TableCell,
  TableGrowing,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionMulti,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import { twMerge } from "tailwind-merge";
import TableToolbar from "@/components/Tables/TableToolbar";
import { useTableSearch } from "@/hooks/useTableSearch";
import {
  Filter,
  FilterOption,
  TableData,
  TableDataProps,
  TableDataRow,
  TableDataRowPrimitive,
  TableToolbarFilter,
} from "@/lib/types/datatable";

const processFilters = (
  filters: TableToolbarFilter[],
  tableRows: TableDataRow[]
): Filter[] => {
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
};

const getUniqueValuesFromData = (
  rows: TableDataRow[],
  accessorKey: string
): FilterOption[] => {
  const uniqueValues = new Set<string>();

  rows.forEach((row) => {
    const value = getValueByAccessor(row, accessorKey);
    if (value !== undefined && value !== null) {
      uniqueValues.add(String(value));
    }
  });

  return Array.from(uniqueValues)
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, text: value }));
};

const convertToTableToolbarFilter = (filter: TableToolbarFilter): Filter => {
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
};

// Manejador para cambios en los filtros
const handleFilterChange = (event: { filterKey: string; value: string }) => {
  console.log(`Filter triggered: ${event.filterKey} = ${event.value}`);
};

function getIdentifier(row: TableDataRow, data: TableData): string {
  return row[data.rowIdentifier || "id"] as string;
}

function getRowKey(row: TableDataRow, data: TableData): string {
  return getIdentifier(row, data);
}

function getValueByAccessor(
  obj: TableDataRow,
  accessor: string
): TableDataRowPrimitive | undefined {
  const value = accessor
    .split(".")
    .reduce(
      (acc: TableDataRowPrimitive | TableDataRow | undefined, key) =>
        acc && typeof acc === "object"
          ? (acc[key] as TableDataRowPrimitive | TableDataRow | undefined)
          : undefined,
      obj
    ) as TableDataRowPrimitive | undefined;

  if (value === null || value === undefined) {
    return "";
  } else if (typeof value === "object") {
    return JSON.stringify(value);
  } else {
    return String(value);
  }
}

const BaseDataTable: React.FC<Readonly<TableDataProps>> = (props) => {
  const { filteredRows, handleSearch, hasResults } = useTableSearch({
    rows: props.data?.rows || [],
    headers: props.data?.headers || [],
  });

  const processedFilters = props.data?.filters
    ? processFilters(props.data.filters, props.data.rows)
    : [];

  return (
    <div
      className={twMerge(
        "w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]",
        props.mainClassName
      )}
    >
      <TableToolbar
        title="Final Summary"
        tableId={1}
        filters={processedFilters}
        // className="py-8 px-4"
        className={props.toolbarClassName}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
      />
      <Table
        features={[
          ...(hasResults
            ? [<TableSelectionMulti behavior="RowSelector" key="selection" />]
            : []),
          <TableGrowing mode="Scroll" key="growing" />,
        ]}
        className={twMerge("h-auto", props.tableClassName)}
        noDataText="No results found"
        overflowMode="Scroll"
        headerRow={
          <TableHeaderRow sticky>
            {props.data?.headers.map((column) => (
              <TableHeaderCell key={column.accessorKey}>
                {column.text}
              </TableHeaderCell>
            ))}
          </TableHeaderRow>
        }
      >
        {filteredRows.map((row) => {
          const rowKey = getRowKey(
            row,
            props.data || { rows: [], headers: [] }
          );
          return (
            <TableRow key={rowKey} rowKey={rowKey}>
              {props.data?.headers.map((column) => {
                const value = getValueByAccessor(row, column.accessorKey);
                return (
                  <TableCell key={column.accessorKey}>
                    <span>{value}</span>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </Table>
    </div>
  );
};

export default BaseDataTable;
