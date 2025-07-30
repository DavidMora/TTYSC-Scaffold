import type { CSSProperties } from "react";

export type TableDataRowPrimitive = string | number | boolean | null;

export type TableDataRowComplex =
  | TableDataRowPrimitive
  | TableDataRow
  | TableDataRow[];

export interface TableDataRow {
  [key: string]: TableDataRowComplex;
}

export interface TableData {
  headers: { text: string; accessorKey: string }[];
  rows: TableDataRow[];
  rowIdentifier?: string;
}

export interface TableDataProps {
  mainClassName?: string;
  headerClassName?: string;
  tableClassName?: string;
  toolbarClassName?: string;
  style?: CSSProperties;
  data: TableData;
}
