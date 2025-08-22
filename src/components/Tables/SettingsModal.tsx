import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Bar,
  Button,
  Title,
  Input,
  FlexBox,
  FlexBoxDirection,
  Icon,
  TabContainer,
  Tab,
  Table,
  TableHeaderRow,
  TableHeaderCell,
  TableRow,
  TableCell,
  TableSelectionMulti,
  TableRowAction,
  Ui5CustomEvent,
  TableSelectionMultiDomRef,
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/search.js';
import { TableDataHeader } from '@/lib/types/datatable';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TableSettings) => void;
  onReset?: () => void;
  headers: TableDataHeader[];
  visibleColumns: Record<string, boolean>;
}

export interface ColumnSetting {
  id: string;
  name: string;
  visible: boolean;
  sortable?: boolean;
}

export interface TableSettings {
  columns: ColumnSetting[];
  sortOrder: 'ascending' | 'descending' | 'none';
  searchTerm?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onReset,
  headers,
  visibleColumns,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState<ColumnSetting[]>([]);
  const [sortOrder, setSortOrder] = useState<
    'ascending' | 'descending' | 'none'
  >('none');

  useEffect(() => {
    if (isOpen && headers.length > 0) {
      const columnSettings = headers.map((header) => ({
        id: header.accessorKey,
        name: header.text,
        visible: visibleColumns[header.accessorKey] !== false,
        sortable: true,
      }));

      setColumns(columnSettings);
    }
  }, [isOpen, headers, visibleColumns]);

  const handleSave = () => {
    const settings: TableSettings = {
      columns,
      sortOrder,
      searchTerm,
    };
    onSave(settings);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleReset = () => {
    const resetColumns = headers.map((header) => ({
      id: header.accessorKey,
      name: header.text,
      visible: true,
      sortable: true,
    }));
    setColumns(resetColumns);
    setSortOrder('none');
    setSearchTerm('');

    // Call external reset function if provided
    if (onReset) {
      onReset();
    }
  };

  const handleColumnToggle = (selectedColumnIds: string[]) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        visible: selectedColumnIds.includes(col.id),
      }))
    );
  };

  const filteredColumns = columns.filter((column) =>
    column.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get the currently selected column IDs (visible columns)
  const selectedColumnIds = columns
    .filter((column) => column.visible)
    .map((column) => column.id)
    .join(' ');

  const headerBar = (
    <Bar
      design="Header"
      startContent={<Title level="H4">View Settings</Title>}
      endContent={
        <Button design="Transparent" onClick={handleReset}>
          Reset
        </Button>
      }
    />
  );

  const footerBar = (
    <Bar
      design="Footer"
      endContent={
        <FlexBox>
          <Button design="Emphasized" onClick={handleSave} className="mr-2">
            OK
          </Button>
          <Button design="Transparent" onClick={handleCancel}>
            Cancel
          </Button>
        </FlexBox>
      }
    />
  );

  return (
    <Dialog
      open={isOpen}
      headerText=""
      header={headerBar}
      footer={footerBar}
      onClose={onClose}
      className="paddingless-header paddingless-content paddingless-footer w-[26rem] min-h-[30rem]"
    >
      <FlexBox direction={FlexBoxDirection.Column} className="h-full p-0">
        <TabContainer
          className="paddingless-header"
          contentBackgroundDesign="Transparent"
          headerBackgroundDesign="Solid"
        >
          <Tab selected text="Columns">
            <FlexBox direction={FlexBoxDirection.Column} className="">
              {/* Search Input */}
              <FlexBox className="w-full px-4 py-1">
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onInput={(e) =>
                    setSearchTerm(
                      (e.target as unknown as HTMLInputElement).value
                    )
                  }
                  icon={<Icon name="search" />}
                  className="w-full"
                />
              </FlexBox>

              {/* Column List */}
              <FlexBox
                direction={FlexBoxDirection.Column}
                className="flex-1 overflow-auto"
              >
                <Table
                  headerRow={
                    <TableHeaderRow sticky>
                      <TableHeaderCell>List Header (1/6)</TableHeaderCell>
                    </TableHeaderRow>
                  }
                  features={
                    <TableSelectionMulti
                      selected={selectedColumnIds}
                      onChange={(
                        event: Ui5CustomEvent<TableSelectionMultiDomRef, never>
                      ) => {
                        const selectedRows = event.target.getSelectedRows();
                        const selectedRowsKeys = selectedRows.map(
                          (row) => row.getAttribute('row-key') || ''
                        );
                        handleColumnToggle(selectedRowsKeys);
                      }}
                    />
                  }
                  rowActionCount={4}
                  onRowActionClick={function _ie(e) {
                    console.log('Row action triggered');
                    console.log(e);
                  }}
                  onMove={function _ie() {
                    console.log('Move action triggered');
                  }}
                  onMoveOver={function _ie() {
                    console.log('Move over action triggered');
                  }}
                >
                  {filteredColumns.map((column) => (
                    <TableRow
                      key={column.id}
                      rowKey={column.id}
                      actions={
                        <>
                          <TableRowAction
                            icon="collapse-group"
                            text="Move to Top"
                          />
                          <TableRowAction icon="slim-arrow-up" text="Move up" />
                          <TableRowAction
                            icon="slim-arrow-down"
                            text="Move down"
                          />
                          <TableRowAction
                            icon="expand-group"
                            text="Move to Bottom"
                          />
                        </>
                      }
                      movable
                      data-id={column.id}
                    >
                      <TableCell>
                        <span>{column.name}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </Table>
              </FlexBox>
            </FlexBox>
          </Tab>
        </TabContainer>
      </FlexBox>
    </Dialog>
  );
};

export default SettingsModal;
