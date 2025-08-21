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
} from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/search.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: TableSettings) => void;
  currentSettings?: TableSettings;
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

const defaultColumns: ColumnSetting[] = [
  { id: 'product', name: 'Product', visible: true, sortable: true },
  { id: 'supplier', name: 'Supplier', visible: true, sortable: true },
  { id: 'weight', name: 'Weight', visible: true, sortable: true },
  { id: 'price', name: 'Price', visible: true, sortable: true },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentSettings,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [columns, setColumns] = useState<ColumnSetting[]>(defaultColumns);
  const [sortOrder, setSortOrder] = useState<
    'ascending' | 'descending' | 'none'
  >('none');

  useEffect(() => {
    if (currentSettings) {
      setColumns(currentSettings.columns || defaultColumns);
      setSortOrder(currentSettings.sortOrder || 'none');
      setSearchTerm(currentSettings.searchTerm || '');
    }
  }, [currentSettings, isOpen]);

  const handleSave = () => {
    const settings: TableSettings = {
      columns,
      sortOrder,
      searchTerm,
    };
    onSave(settings);
    onClose();
  };

  const handleCancel = () => {
    // Reset to current settings
    if (currentSettings) {
      setColumns(currentSettings.columns || defaultColumns);
      setSortOrder(currentSettings.sortOrder || 'none');
      setSearchTerm(currentSettings.searchTerm || '');
    }
    onClose();
  };

  const handleReset = () => {
    setColumns(defaultColumns);
    setSortOrder('none');
    setSearchTerm('');
  };

  const filteredColumns = columns.filter((column) =>
    column.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Columns Section */}

        <TabContainer
          className="paddingless-header"
          contentBackgroundDesign="Transparent"
          headerBackgroundDesign="Solid"
          onMove={function _ie() {}}
          onMoveOver={function _ie() {}}
          onTabSelect={function _ie() {}}
          tabLayout="Standard"
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
                  features={<TableSelectionMulti />}
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
                {/* {filteredColumns.map((column) => (
                  <FlexBox
                    key={column.id}
                    alignItems={FlexBoxAlignItems.Center}
                    className={`py-0 border-b border-gray-200 ${
                      column.visible ? "bg-green-50" : "bg-transparent"
                    }`}
                  >
                    <CheckBox
                      checked={column.visible}
                      onChange={() => handleColumnToggle(column.id)}
                      text={column.name}
                      className="flex-1"
                    />
                  </FlexBox>
                ))} */}
              </FlexBox>
            </FlexBox>
          </Tab>
        </TabContainer>
      </FlexBox>
    </Dialog>
  );
};
