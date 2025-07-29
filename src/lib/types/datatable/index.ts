import type { CSSProperties } from "react";

export type TableDataRowPrimitive = string | number | boolean | null;

export type TableDataRowComplex =
  | TableDataRowPrimitive
  | TableDataRow
  | TableDataRow[];

export interface TableDataRow {
  [key: string]: TableDataRowComplex;
}

export interface TableData<
  T extends Record<string, TableDataRowComplex> = TableDataRow
> {
  headers: { text: string; accessorKey: keyof T & string }[];
  rows: T[];
  rowIdentifier?: keyof T & string;
}

export interface TableDataProps {
  mainClassName?: string;
  headerClassName?: string;
  tableClassName?: string;
  toolbarClassName?: string;
  style?: CSSProperties;
  data: TableData;
}
