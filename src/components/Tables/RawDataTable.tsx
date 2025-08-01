import React from "react";
import {
  DatePicker,
  Icon,
  Input,
  Option,
  Select,
  Table,
  TableCell,
  TableGrowing,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionMulti,
  Title,
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarSpacer,
} from "@ui5/webcomponents-react";
import "@ui5/webcomponents-icons/dist/add.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import { twMerge } from "tailwind-merge";

interface TableDataHeader {
  text: string;
  accessorKey: string;
}

type TableDataRowPrimitive = string | number | boolean | null;

type TableDataRowComplex =
  | TableDataRowPrimitive
  | TableDataRow
  | TableDataRow[]
  | null;

interface TableDataRow {
  [key: string]: TableDataRowComplex;
}

interface TableData {
  headers: TableDataHeader[];
  rows: TableDataRow[];
  rowIdentifier?: string;
}

interface TableDataProps {
  mainClassName?: string;
  headerClassName?: string;
  tableClassName?: string;
  style?: React.CSSProperties;
  data: TableDataRow;
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
    {
      id: "15",
      demandPriority: 15,
      productFamily: "DGC",
      system: "B100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "16",
      demandPriority: 16,
      productFamily: "HGE",
      system: "B110",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "17",
      demandPriority: 17,
      productFamily: "DGD",
      system: "H100",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "18",
      demandPriority: 18,
      productFamily: "HGI",
      system: "System",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "19",
      demandPriority: 19,
      productFamily: "DGS",
      system: "B110",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
    {
      id: "20",
      demandPriority: 20,
      productFamily: "HGP",
      system: "H200",
      demandUnits: "100K",
      fulfilledDemandUnits: "80k",
    },
  ],
};

function getIdentifier(row: TableDataRow): string {
  return row[tableData.rowIdentifier || "id"] as string;
}

function getRowKey(row: TableDataRow): string {
  return getIdentifier(row);
}

function getValueByAccessor(
  obj: TableDataRow,
  accessor: string
): TableDataRowPrimitive | undefined {
  return accessor
    .split(".")
    .reduce(
      (acc: TableDataRowPrimitive | TableDataRow | undefined, key) =>
        acc && typeof acc === "object"
          ? (acc[key] as TableDataRowPrimitive | TableDataRow | undefined)
          : undefined,
      obj
    ) as TableDataRowPrimitive | undefined;
}

export function RawDataTable(props: Readonly<TableDataProps>) {
  return (
    <div
      className={twMerge(
        "w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]",
        props.mainClassName
      )}
    >
      <Toolbar alignContent="Start">
        <Title level="H2" className="px-1">
          Final summary
        </Title>
        <DatePicker
          onChange={function Xs() {}}
          onClose={function Xs() {}}
          onInput={function Xs() {}}
          onOpen={function Xs() {}}
          onValueStateChange={function Xs() {}}
          primaryCalendarType="Gregorian"
          valueState="None"
        />
        <Select
          onChange={function Xs() {}}
          onClose={function Xs() {}}
          onLiveChange={function Xs() {}}
          onOpen={function Xs() {}}
          valueState="None"
        >
          <Option>Option 1</Option>
          <Option>Option 2</Option>
          <Option>Option 3</Option>
          <Option>Option 4</Option>
          <Option>Option 5</Option>
        </Select>
        <ToolbarSpacer />
        <Input
          icon={<Icon name="search" />}
          onChange={function Xs() {}}
          onClose={function Xs() {}}
          onInput={function Xs() {}}
          onOpen={function Xs() {}}
          onSelect={function Xs() {}}
          onSelectionChange={function Xs() {}}
          type="Text"
          placeholder="Search..."
          valueState="None"
        />
        <ToolbarSeparator />
        <ToolbarButton design="Transparent" icon="action" />
        <ToolbarSeparator />
        <ToolbarButton design="Transparent" icon="action-settings" />
        <ToolbarSeparator />
        <ToolbarButton design="Transparent" icon="excel-attachment" />
        <ToolbarSeparator />
        <ToolbarButton design="Transparent" icon="full-screen" />
      </Toolbar>
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
    </div>
  );
}
