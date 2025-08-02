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
import { useTableData } from "@/hooks/useTableData";
import { TableDataProps, TableDataRow } from "@/lib/types/datatable";
import { getFormattedValueByAccessor } from "@/lib/utils/tableHelpers";

function getIdentifier(
  row: TableDataRow,
  identifier: string | undefined
): string {
  return row[identifier || "id"] as string;
}

function getRowKey(row: TableDataRow, identifier: string | undefined): string {
  const value = getIdentifier(row, identifier);

  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

const BaseDataTable: React.FC<Readonly<TableDataProps>> = (props) => {
  const {
    filteredRows,
    processedFilters,
    handleSearch,
    handleFilterChange,
    hasResults,
  } = useTableData({
    rows: props.data?.rows || [],
    headers: props.data?.headers || [],
    filters: props.data?.filters || [],
  });

  return (
    <div
      className={twMerge(
        "w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]",
        props.mainClassName
      )}
    >
      <TableToolbar
        title={props.title || "Table Data"}
        tableId={props.tableId || "table-1"}
        filters={processedFilters}
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
          const rowKey = getRowKey(row, props.data?.rowIdentifier);
          return (
            <TableRow key={rowKey} rowKey={rowKey}>
              {props.data?.headers.map((column) => {
                const value = getFormattedValueByAccessor(
                  row,
                  column.accessorKey
                );
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
