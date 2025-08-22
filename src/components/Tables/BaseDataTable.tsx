'use client';

import React, { useState } from 'react';
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
import {
  SettingsModal,
  TableSettings,
} from '@/components/Tables/SettingsModal';

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveSettings = (settings: TableSettings) => {
    // Apply column visibility settings
    settings.columns.forEach((column) => {
      setColumnVisibility(column.id, column.visible);
    });
    handleCloseModal();
  };

  const {
    filteredRows,
    processedFilters,
    visibleHeaders,
    visibleColumns,
    setColumnVisibility,
    resetColumnVisibility,
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
        onSettingsClick={handleOpenModal}
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
            {visibleHeaders.map((column) => (
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
              {visibleHeaders.map((column) => {
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
        onReset={resetColumnVisibility}
        headers={props.data?.headers || []}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

export default BaseDataTable;
