import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionMulti,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/add.js";
import React from "react";

interface TableHeader {
  text: string;
  accessorKey: string;
}

type TableRowPrimitive = string | number | boolean | null;

type TableRowComplex = TableRowPrimitive | TableRow | TableRow[] | null;

interface TableRow {
  [key: string]: TableRowComplex;
}

interface TableData {
  headers: TableHeader[];
  rows: TableRow[];
  rowIdentifier?: string;
}

const tableData: TableData = {
  headers: [
    { text: "Demand Priority", accessorKey: "demandPriority" },
    { text: "Product Family", accessorKey: "productFamily" },
    { text: "System", accessorKey: "system" },
    { text: "Demand Units", accessorKey: "demandUnits" },
    { text: "Fullfilled Demand Units", accessorKey: "fulfilledDemandUnits" },
  ],
  rows: [
    {
      id: "1",
      demandPriority: 1,
      productFamily: "HGS",
      system: "H100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "2",
      demandPriority: 2,
      productFamily: "DGI",
      system: "B110",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "3",
      demandPriority: 3,
      productFamily: "HGD",
      system: "System",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "4",
      demandPriority: 4,
      productFamily: "DGE",
      system: "B100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "5",
      demandPriority: 5,
      productFamily: "HGC",
      system: "B110",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "6",
      demandPriority: 6,
      productFamily: "DGT",
      system: "System",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "7",
      demandPriority: 7,
      productFamily: "HGP",
      system: "B110",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "8",
      demandPriority: 8,
      productFamily: "DGS",
      system: "H100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "9",
      demandPriority: 9,
      productFamily: "HGI",
      system: "H200",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "10",
      demandPriority: 10,
      productFamily: "DGS",
      system: "System",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "11",
      demandPriority: 11,
      productFamily: "HGI",
      system: "B100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "12",
      demandPriority: 12,
      productFamily: "DGD",
      system: "H200",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "13",
      demandPriority: 13,
      productFamily: "HGE",
      system: "System",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "14",
      demandPriority: 14,
      productFamily: "DGC",
      system: "B100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
  ],
};

function getIdentifier(row: TableRow): string {
  return row[tableData.rowIdentifier || "id"] as string;
}

function getRowKey(row: TableRow): string {
  return getIdentifier(row);
}

function getValueByAccessor(
  obj: TableRow,
  accessor: string
): TableRowPrimitive | undefined {
  return accessor
    .split(".")
    .reduce(
      (acc: TableRowPrimitive | TableRow | undefined, key) =>
        acc && typeof acc === "object"
          ? (acc[key] as TableRowPrimitive | TableRow | undefined)
          : undefined,
      obj
    ) as TableRowPrimitive | undefined;
}

export function RawDataTable() {
  return (
    <Table
      features={<TableSelectionMulti behavior="RowSelector" />}
      headerRow={
        <TableHeaderRow sticky>
          {tableData.headers.map((header) => (
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
      {tableData.rows.map((row) => (
        <TableRow key={getRowKey(row)} data-ui5-row-key={getRowKey(row)}>
          {tableData.headers.map((header) => {
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
  );
}
