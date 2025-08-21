import type { CSSProperties } from 'react';

// Interfaces para definir la estructura de filtros
export interface FilterOption {
  value: string;
  text: string;
}

export interface SelectFilter {
  type: 'select';
  key: string;
  label?: string;
  placeholder?: string;
  options: FilterOption[];
  value?: string;
}

export interface DateFilter {
  type: 'date';
  key: string;
  label?: string;
  placeholder?: string;
  value?: string;
}

export interface UnknownFilter {
  type: string; // Catch-all for unknown types
  key: string;
  label?: string;
  placeholder?: string;
  options?: FilterOption[];
  value?: string;
}

export type Filter = SelectFilter | DateFilter | UnknownFilter;

export interface FilterChangeEvent {
  filterKey: string;
  value: string;
}

export interface TableToolbarProps {
  className?: string;
  title?: string;
  tableId?: number | string;
  filters?: Filter[];
  onFilterChange?: (event: FilterChangeEvent) => void;
  onSearch?: (searchTerm: string) => void;
  onSettingsClick?: () => void;
  disableFullScreen?: boolean;
}

export interface TableDataHeader {
  text: string;
  accessorKey: string;
  visible?: boolean;
}

export type TableDataRowPrimitive = string | number | boolean | null;

export type TableDataRowComplex =
  | TableDataRowPrimitive
  | TableDataRowPrimitive[]
  | TableDataRow
  | TableDataRow[]
  | null;

export interface TableDataRow {
  [key: string]: TableDataRowComplex;
}

export interface TableToolbarFilter {
  type: 'select' | 'date';
  key: string;
  label?: string;
  placeholder?: string;
  options?: FilterOption[];
  accessorKey?: string;
  value?: string;
}

export interface TableData {
  headers: TableDataHeader[];
  rows: TableDataRow[];
  rowIdentifier?: string;
  filters?: TableToolbarFilter[];
}

export interface TableDataProps {
  mainClassName?: string;
  headerClassName?: string;
  tableClassName?: string;
  toolbarClassName?: string;
  style?: CSSProperties;
  data?: TableData;
  title?: string;
  tableId?: string;
  onFilterChange?: (event: FilterChangeEvent) => void;
  onSearch?: (searchTerm: string) => void;
  onRowClick?: (row: TableDataRow) => void;
  onCellClick?: (row: TableDataRow, columnKey: string) => void;
  disableFullScreen?: boolean;
}
