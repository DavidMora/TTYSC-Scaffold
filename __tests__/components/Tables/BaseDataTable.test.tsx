import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BaseDataTable from '@/components/Tables/BaseDataTable';
import { TableDataProps, TableDataRow } from '@/lib/types/datatable';
import '@testing-library/jest-dom';

// Mock the TableToolbar component with onSearch prop tracking
const mockOnSearch = jest.fn();
jest.mock('@/components/Tables/TableToolbar', () => {
  return function MockTableToolbar({
    className,
    onSearch,
  }: {
    className?: string;
    onSearch?: (searchTerm: string) => void;
  }) {
    // Store the onSearch function for testing
    if (onSearch) {
      mockOnSearch.mockImplementation(onSearch);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      mockOnSearch(value); // Track the call
      onSearch?.(value); // Call the actual function
    };

    return (
      <div data-testid="table-toolbar" className={className}>
        <input
          data-testid="search-input"
          placeholder="Search..."
          onChange={handleInputChange}
        />{' '}
        Mock Table Toolbar
      </div>
    );
  };
});

const mockTableData: TableDataProps = {
  data: {
    headers: [
      { text: 'Name', accessorKey: 'name' },
      { text: 'Age', accessorKey: 'age' },
      { text: 'Email', accessorKey: 'email' },
    ],
    rows: [
      { id: '1', name: 'John Doe', age: 30, email: 'john@example.com' },
      { id: '2', name: 'Jane Smith', age: 25, email: 'jane@example.com' },
      { id: '3', name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
    ],
    rowIdentifier: 'id',
  },
};

const mockTableDataWithoutRowIdentifier: TableDataProps = {
  data: {
    headers: [
      { text: 'Name', accessorKey: 'name' },
      { text: 'Age', accessorKey: 'age' },
    ],
    rows: [
      { id: '1', name: 'John Doe', age: 30 },
      { id: '2', name: 'Jane Smith', age: 25 },
    ],
  },
};

describe('BaseDataTable', () => {
  describe('Rendering', () => {
    it('should render the table container with correct styling', () => {
      render(<BaseDataTable {...mockTableData} />);

      const container = screen.getByTestId('ui5-table').parentElement;
      expect(container).toHaveClass(
        'w-full rounded-xl overflow-hidden outline outline-gray-300 bg-[var(--sapBaseColor)]'
      );
    });

    it('should render the TableToolbar component', () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId('table-toolbar')).toBeInTheDocument();
    });

    it('should render the table with correct features', () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
      expect(screen.getByTestId('ui5-table')).toHaveAttribute(
        'data-overflow-mode',
        'Scroll'
      );
      expect(
        screen.getByTestId('ui5-table-selection-multi')
      ).toBeInTheDocument();
      expect(screen.getByTestId('ui5-table-growing')).toBeInTheDocument();
    });

    it('should render table headers correctly', () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId('ui5-table-header-row')).toBeInTheDocument();
      expect(screen.getByTestId('ui5-table-header-row')).toHaveAttribute(
        'data-sticky',
        'true'
      );

      const headerCells = screen.getAllByTestId('ui5-table-header-cell');
      expect(headerCells).toHaveLength(3);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render table rows correctly', () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableRows = screen.getAllByTestId('ui5-table-row');
      expect(tableRows).toHaveLength(3);

      // Check that each row has the correct rowKey
      expect(tableRows[0]).toHaveAttribute('data-ui5-row-key', '1');
      expect(tableRows[1]).toHaveAttribute('data-ui5-row-key', '2');
      expect(tableRows[2]).toHaveAttribute('data-ui5-row-key', '3');
    });

    it('should render table cells with correct data', () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableCells = screen.getAllByTestId('ui5-table-cell');
      expect(tableCells).toHaveLength(9); // 3 rows × 3 columns

      // Check first row data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();

      // Check second row data
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should apply custom table className', () => {
      const customProps = {
        ...mockTableData,
        tableClassName: 'custom-table-class',
      };

      render(<BaseDataTable {...customProps} />);

      expect(screen.getByTestId('ui5-table')).toHaveClass('custom-table-class');
    });

    it('should use default rowIdentifier when not provided', () => {
      render(<BaseDataTable {...mockTableDataWithoutRowIdentifier} />);

      const tableRows = screen.getAllByTestId('ui5-table-row');
      expect(tableRows[0]).toHaveAttribute('data-ui5-row-key', '1');
      expect(tableRows[1]).toHaveAttribute('data-ui5-row-key', '2');
    });

    it('should handle custom rowIdentifier', () => {
      const customData = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
          ],
          rows: [
            { customId: 'custom1', name: 'John Doe', age: 30 },
            { customId: 'custom2', name: 'Jane Smith', age: 25 },
          ],
          rowIdentifier: 'customId',
        },
      };

      render(<BaseDataTable {...customData} />);

      const tableRows = screen.getAllByTestId('ui5-table-row');
      expect(tableRows[0]).toHaveAttribute('data-ui5-row-key', 'custom1');
      expect(tableRows[1]).toHaveAttribute('data-ui5-row-key', 'custom2');
    });
  });

  describe('Data Handling', () => {
    it('should handle empty rows array', () => {
      const emptyData = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
          ],
          rows: [],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...emptyData} />);

      expect(screen.getByTestId('ui5-table-header-row')).toBeInTheDocument();
      expect(screen.queryAllByTestId('ui5-table-row')).toHaveLength(1);
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });

    it('should handle rows with missing data', () => {
      const incompleteData = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
            { text: 'Email', accessorKey: 'email' },
          ],
          rows: [
            { id: '1', name: 'John Doe', age: 30, email: null }, // missing email
            {
              id: '2',
              name: 'Jane Smith',
              age: null,
              email: 'jane@example.com',
            }, // missing age
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...incompleteData} />);

      // Should still render the rows even with missing data
      const tableRows = screen.getAllByTestId('ui5-table-row');
      expect(tableRows).toHaveLength(2);

      // Check that existing data is displayed
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should handle non-string values in cells', () => {
      const mixedData = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
            { text: 'Active', accessorKey: 'active' },
          ],
          rows: [
            { id: '1', name: 'John Doe', age: 30, active: true },
            { id: '2', name: 'Jane Smith', age: 25, active: false },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...mixedData} />);

      // Boolean values should be converted to strings
      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getByText('false')).toBeInTheDocument();
    });

    it('should handle object values in cells by stringifying them', () => {
      const dataWithObjects = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Metadata', accessorKey: 'metadata' },
            { text: 'Settings', accessorKey: 'settings' },
          ],
          rows: [
            {
              id: '1',
              name: 'John Doe',
              metadata: { department: 'IT', role: 'Developer' },
              settings: { theme: 'dark', notifications: true },
            },
            {
              id: '2',
              name: 'Jane Smith',
              metadata: { department: 'HR', role: 'Manager' },
              settings: { theme: 'light', notifications: false },
            },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithObjects} />);

      // Object values should be JSON stringified
      expect(
        screen.getByText('{"department":"IT","role":"Developer"}')
      ).toBeInTheDocument();
      expect(
        screen.getByText('{"theme":"dark","notifications":true}')
      ).toBeInTheDocument();
      expect(
        screen.getByText('{"department":"HR","role":"Manager"}')
      ).toBeInTheDocument();
      expect(
        screen.getByText('{"theme":"light","notifications":false}')
      ).toBeInTheDocument();
    });
  });

  describe('Table Features', () => {
    it('should render table selection feature with correct behavior', () => {
      render(<BaseDataTable {...mockTableData} />);

      const selectionFeature = screen.getByTestId('ui5-table-selection-multi');
      expect(selectionFeature).toHaveAttribute('data-behavior', 'RowSelector');
    });

    it('should render table growing feature with correct mode', () => {
      render(<BaseDataTable {...mockTableData} />);

      const growingFeature = screen.getByTestId('ui5-table-growing');
      expect(growingFeature).toHaveAttribute('data-mode', 'Scroll');
    });

    it('should render sticky header row', () => {
      render(<BaseDataTable {...mockTableData} />);

      const headerRow = screen.getByTestId('ui5-table-header-row');
      expect(headerRow).toHaveAttribute('data-sticky', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
      expect(screen.getByTestId('ui5-table-header-row')).toBeInTheDocument();
      expect(screen.getAllByTestId('ui5-table-row')).toHaveLength(3);
    });

    it('should have unique row keys', () => {
      render(<BaseDataTable {...mockTableData} />);

      const tableRows = screen.getAllByTestId('ui5-table-row');
      const rowKeys = tableRows.map((row) =>
        row.getAttribute('data-ui5-row-key')
      );

      // Check that all row keys are unique
      const uniqueKeys = new Set(rowKeys);
      expect(uniqueKeys.size).toBe(rowKeys.length);
    });

    it('should have proper header text', () => {
      render(<BaseDataTable {...mockTableData} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null or undefined values in row data', () => {
      const dataWithNulls = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
            { text: 'Email', accessorKey: 'email' },
          ],
          rows: [
            { id: '1', name: 'John Doe', age: null, email: null },
            { id: '2', name: null, age: 25, email: 'jane@example.com' },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithNulls} />);

      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
      expect(screen.getAllByTestId('ui5-table-row')).toHaveLength(2);
    });

    it('should handle empty headers array', () => {
      const dataWithEmptyHeaders = {
        data: {
          headers: [],
          rows: [{ id: '1', name: 'John Doe', age: 30 }],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithEmptyHeaders} />);

      // Should render table without headers
      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
      expect(screen.queryByTestId('ui5-table-header-row')).toBeInTheDocument();
      expect(screen.queryAllByTestId('ui5-table-header-cell')).toHaveLength(0);
    });

    it('should handle missing row identifier gracefully', () => {
      const dataWithMissingIdentifier = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
          ],
          rows: [
            { name: 'John Doe', age: 30 } as { name: string; age: number }, // Missing 'id' field
            { id: '2', name: 'Jane Smith', age: 25 },
          ] as TableDataRow[],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithMissingIdentifier} />);

      // Should still render the table
      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
      expect(screen.getAllByTestId('ui5-table-row')).toHaveLength(2);
    });

    it('should handle object values as row identifiers', () => {
      const dataWithObjectIdentifier = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
          ],
          rows: [
            {
              id: { type: 'user', value: '123' },
              name: 'John Doe',
              age: 30,
            },
            {
              id: { type: 'user', value: '456' },
              name: 'Jane Smith',
              age: 25,
            },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithObjectIdentifier} />);

      const tableRows = screen.getAllByTestId('ui5-table-row');

      // Object identifiers should be JSON stringified
      expect(tableRows[0]).toHaveAttribute(
        'data-ui5-row-key',
        '{"type":"user","value":"123"}'
      );
      expect(tableRows[1]).toHaveAttribute(
        'data-ui5-row-key',
        '{"type":"user","value":"456"}'
      );
    });

    it('should handle nested accessor keys', () => {
      const dataWithNestedKeys = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'user.name' },
            { text: 'Department', accessorKey: 'user.department.name' },
            { text: 'Settings', accessorKey: 'user.settings.theme' },
          ],
          rows: [
            {
              id: '1',
              user: {
                name: 'John Doe',
                department: { name: 'Engineering' },
                settings: { theme: 'dark' },
              },
            },
            {
              id: '2',
              user: {
                name: 'Jane Smith',
                department: { name: 'Marketing' },
                settings: { theme: 'light' },
              },
            },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithNestedKeys} />);

      // Should render nested data correctly
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Marketing')).toBeInTheDocument();
      expect(screen.getByText('dark')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
    });

    it('should handle undefined props gracefully', () => {
      const dataWithUndefinedProps = {} as TableDataProps;

      render(<BaseDataTable {...dataWithUndefinedProps} />);

      // Should still render table structure with empty data
      expect(screen.getByTestId('ui5-table')).toBeInTheDocument();
    });

    it('should handle complex nested accessor edge cases', () => {
      const dataWithComplexNesting = {
        data: {
          headers: [
            { text: 'Deep Value', accessorKey: 'level1.level2.level3.value' },
            { text: 'Null Chain', accessorKey: 'level1.null.value' },
            { text: 'Primitive Chain', accessorKey: 'primitive.value' },
          ],
          rows: [
            {
              id: '1',
              level1: {
                level2: {
                  level3: { value: 'deep-value' },
                },
                null: null,
              },
              primitive: 'not-an-object',
            },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithComplexNesting} />);

      // Should handle deep nesting correctly
      expect(screen.getByText('deep-value')).toBeInTheDocument();

      // Should handle null in chain gracefully (empty string)
      const cells = screen.getAllByTestId('ui5-table-cell');
      // The null chain should result in empty string
      expect(cells[1]).toHaveTextContent('');

      // Should handle primitive in chain gracefully (empty string)
      expect(cells[2]).toHaveTextContent('');
    });
  });

  describe('UI Integration', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render TableToolbar with search functionality', () => {
      render(<BaseDataTable {...mockTableData} />);

      // Verify the TableToolbar is rendered
      expect(screen.getByTestId('table-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();

      // Verify search input interaction works
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      expect(mockOnSearch).toHaveBeenCalledWith('test');
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        data: {
          headers: [
            { text: 'Name', accessorKey: 'name' },
            { text: 'Age', accessorKey: 'age' },
          ],
          rows: [],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...emptyData} />);

      // Should not have the selection feature when no results
      expect(
        screen.queryByTestId('ui5-table-selection-multi')
      ).not.toBeInTheDocument();

      // Should still have the growing feature
      expect(screen.getByTestId('ui5-table-growing')).toBeInTheDocument();
    });

    it('handles rows with null/undefined row identifier values', () => {
      const dataWithNullIds: TableDataProps = {
        data: {
          headers: [{ text: 'Name', accessorKey: 'name' }],
          rows: [
            { id: null, name: 'Null ID' },
            { name: 'Missing ID' }, // undefined case
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithNullIds} />);

      // Component should still render despite null/undefined IDs
      expect(screen.getByText('Null ID')).toBeInTheDocument();
      expect(screen.getByText('Missing ID')).toBeInTheDocument();
    });

    it('handles rows with object row identifier values', () => {
      const dataWithObjectIds: TableDataProps = {
        data: {
          headers: [{ text: 'Name', accessorKey: 'name' }],
          rows: [
            { id: { nested: 'value' }, name: 'Object ID' },
            { id: { complex: { data: 'test' } }, name: 'Complex Object ID' },
          ],
          rowIdentifier: 'id',
        },
      };

      render(<BaseDataTable {...dataWithObjectIds} />);

      // Component should still render with object IDs
      expect(screen.getByText('Object ID')).toBeInTheDocument();
      expect(screen.getByText('Complex Object ID')).toBeInTheDocument();
    });
  });
});
