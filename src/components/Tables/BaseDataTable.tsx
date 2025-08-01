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
  const currentData = props.data || { headers: [], rows: [] };

  const processedFilters = currentData.filters
    ? processFilters(currentData.filters, currentData.rows)
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
        className="py-8 px-4"
        onFilterChange={handleFilterChange}
      />
      <Table
        className={twMerge("h-auto", props.tableClassName)}
        overflowMode="Scroll"
        features={
          <>
            <TableSelectionMulti behavior="RowSelector" />
            <TableGrowing mode="Scroll" onLoadMore={function Xs() {}} />
          </>
        }
        headerRow={
          <TableHeaderRow sticky>
            {currentData.headers.map((header) => (
              <TableHeaderCell key={header.accessorKey}>
                {header.text}
              </TableHeaderCell>
            ))}
          </TableHeaderRow>
        }
        onMove={function Xs() {}}
        onMoveOver={function Xs() {}}
        onRowActionClick={function Xs() {}}
        onRowClick={function Xs() {}}
        rowActionCount={3}
      >
        {currentData.rows.map((row) => (
          <TableRow
            key={getRowKey(row, currentData)}
            data-ui5-row-key={getRowKey(row, currentData)}
          >
            {currentData.headers.map((header) => {
              const value = getValueByAccessor(row, header.accessorKey);
              return (
                <TableCell key={header.accessorKey}>
                  <span>{value}</span>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </Table>
    </div>
  );
};

export default BaseDataTable;
