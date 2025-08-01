"use client";

import React from "react";
import {
  Text,
  Table,
  TableRow,
  TableCell,
  TableSelectionMulti,
  TableHeaderRow,
  TableHeaderCell,
  TableGrowing,
} from "@ui5/webcomponents-react";
import { TableDataRow, TableDataProps } from "@/lib/types/datatable";
import TableToolbar from "@/components/Tables/TableToolbar";
import { useTableSearch } from "@/hooks/useTableSearch";

const BaseDataTable: React.FC<Readonly<TableDataProps>> = (props) => {
  const { filteredRows, handleSearch, hasResults } = useTableSearch({
    rows: props.data.rows,
    headers: props.data.headers,
  });

  const getRowKey = (row: TableDataRow): string => {
    const value = row[props.data.rowIdentifier ?? "id"];
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <div
      data-testid="base-data-table"
      className={
        "w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)] " +
        props.mainClassName
      }
    >
      <TableToolbar
        className={props.toolbarClassName}
        onSearch={handleSearch}
      />
      <Table
        features={[
          ...(hasResults
            ? [<TableSelectionMulti behavior="RowSelector" key="selection" />]
            : []),
          <TableGrowing mode="Scroll" key="growing" />,
        ]}
        className={props.tableClassName}
        noDataText="No results found"
        overflowMode="Scroll"
        headerRow={
          <TableHeaderRow sticky>
            {props.data.headers.map((column) => (
              <TableHeaderCell
                key={column.accessorKey}
                className={!hasResults ? "pl-11" : undefined}
              >
                <Text>{column.text}</Text>
              </TableHeaderCell>
            ))}
          </TableHeaderRow>
        }
      >
        {filteredRows.map((row) => {
          const rowKey = getRowKey(row);
          return (
            <TableRow key={rowKey} rowKey={rowKey}>
              {props.data.headers.map((column) => (
                <TableCell key={column.accessorKey}>
                  <Text>
                    {(() => {
                      const value = row[column.accessorKey];
                      if (value === null || value === undefined) return "";
                      if (typeof value === "object")
                        return JSON.stringify(value);
                      return String(value);
                    })()}
                  </Text>
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </Table>
    </div>
  );
};

export default BaseDataTable;
