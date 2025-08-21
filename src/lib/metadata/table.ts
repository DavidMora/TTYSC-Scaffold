import type { ExecutionMetadata } from '@/lib/types/chats';
import type {
  TableData,
  TableDataHeader,
  TableDataRow,
  TableToolbarFilter,
} from '@/lib/types/datatable';

// Builds a stable row key from common fields; falls back to index when needed
function stringifyValue(value: unknown): string {
  if (value == null) return '';
  if (value instanceof Date) return value.toISOString();
  const valueType = typeof value;
  if (valueType === 'string') return value as string;
  if (valueType === 'number') return (value as number).toString();
  if (valueType === 'boolean') return (value as boolean).toString();
  if (valueType === 'bigint') return (value as bigint).toString();
  if (valueType === 'symbol')
    return (value as symbol).description ?? (value as symbol).toString();
  if (valueType === 'function') return '[function]';
  try {
    return JSON.stringify(value);
  } catch {
    return '[object]';
  }
}

function buildRowKey(row: Record<string, string>, index: number): string {
  const key = [
    row.nvpn,
    row.cm_site_name,
    row.qt_mp,
    row.date,
    row.component_lt,
  ]
    .filter(Boolean)
    .join('|');
  return key || `row-${index}`;
}

function headerTextForKey(key: string): string {
  const map: Record<string, string> = {
    nvpn: 'NVPN',
    cm_site_name: 'CM Site',
    qt_mp: 'QT/MP',
    component_lt: 'Lead Time',
    lead_time_days: 'Lead Time (Days)',
    date: 'Date',
  };
  return map[key] ?? key;
}

export function metadataToTableData(
  metadata?: ExecutionMetadata | null
): TableData | null {
  const maybeRecords = metadata?.query_results?.dataframe_records;
  const rows: Array<Record<string, unknown>> = Array.isArray(maybeRecords)
    ? maybeRecords
    : [];

  if (!rows.length) return null;

  const firstRow = rows[0] || {};
  const columns = metadata?.query_results?.columns;
  const columnKeys: string[] =
    Array.isArray(columns) &&
    columns.every((c): c is string => typeof c === 'string')
      ? columns
      : Object.keys(firstRow);

  const headers: TableDataHeader[] = columnKeys.map((k) => ({
    text: headerTextForKey(k),
    accessorKey: k,
  }));

  const tableRows: TableDataRow[] = rows.map((r, idx) => {
    const stringifiedRow: TableDataRow = {};
    for (const [key, value] of Object.entries(r)) {
      stringifiedRow[key] = stringifyValue(value);
    }
    stringifiedRow.rowKey = buildRowKey(
      stringifiedRow as Record<string, string>,
      idx
    );
    return stringifiedRow;
  });

  const filters: TableToolbarFilter[] = [];

  return {
    headers,
    rows: tableRows,
    rowIdentifier: 'rowKey',
    filters,
  };
}

export type { TableData };
