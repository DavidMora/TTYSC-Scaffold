'use client';

import React from 'react';
import {
  Table,
  TableCell,
  TableGrowing,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  TableSelectionMulti,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents/dist/TableRow.js';
import '@ui5/webcomponents/dist/TableCell.js';
import '@ui5/webcomponents/dist/TableHeaderRow.js';
import '@ui5/webcomponents/dist/TableHeaderCell.js';
import { twMerge } from 'tailwind-merge';
import TableToolbar from '@/components/Tables/TableToolbar';
import { useTableData } from '@/hooks/useTableData';
import { TableDataProps, TableDataRow } from '@/lib/types/datatable';
import { getFormattedValueByAccessor } from '@/lib/utils/tableHelpers';

function getIdentifier(
  row: TableDataRow,
  identifier: string | undefined
): unknown {
  return row[identifier || 'id'];
}

function getRowKey(row: TableDataRow, identifier: string | undefined): string {
  const value = getIdentifier(row, identifier);

  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
}

const BaseDataTable: React.FC<Readonly<TableDataProps>> = (props) => {
  // Settings modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<TableSettings>({
    columns: [
      { id: 'product', name: 'Product', visible: true, sortable: true },
      { id: 'supplier', name: 'Supplier', visible: true, sortable: true },
      { id: 'weight', name: 'Weight', visible: true, sortable: true },
      { id: 'price', name: 'Price', visible: true, sortable: true },
    ],
    sortOrder: 'none',
    searchTerm: '',
  });

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSettings = (settings: typeof currentSettings) => {
    setCurrentSettings(settings);
    console.log('Settings saved:', settings);
    // Here you might want to apply the settings to the table, e.g., update columns visibility
  };

  // Finish setting up the settings modal

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

  const shouldEnableGrowing = filteredRows.length > 30;

  return (
    <div
      data-testid="base-data-table"
      className={twMerge(
        'w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]',
        props.mainClassName
      )}
    >
      <TableToolbar
        title={props.title || 'Table Data'}
        tableId={props.tableId || 'table-1'}
        filters={processedFilters}
        className={props.toolbarClassName}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        disableFullScreen={props.disableFullScreen}
      />
      <Table
        features={[
          ...(hasResults
            ? [<TableSelectionMulti behavior="RowSelector" key="selection" />]
            : []),
          ...(shouldEnableGrowing
            ? [<TableGrowing mode="Scroll" key="growing" />]
            : []),
        ]}
        className={twMerge('h-auto', props.tableClassName)}
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
      <SettingsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSettings}
        currentSettings={currentSettings}
      />
    </div>
  );
};

export default BaseDataTable;
