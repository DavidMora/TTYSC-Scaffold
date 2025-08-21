import React from 'react';
import { render, screen } from '@testing-library/react';
import TablePage from '@/app/(fullscreen)/full-screen/table/[id]/page';
import '@testing-library/jest-dom';

// Mock UI5 components
jest.mock('@ui5/webcomponents-react', () => ({
  Button: ({
    children,
    design,
    className,
    ...props
  }: React.PropsWithChildren<
    {
      design?: string;
      className?: string;
    } & Record<string, unknown>
  >) => (
    <button
      data-testid="button"
      data-design={design}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
  FlexBox: ({
    children,
    direction,
    className,
    ...props
  }: React.PropsWithChildren<
    {
      direction?: string;
      className?: string;
    } & Record<string, unknown>
  >) => (
    <div
      data-testid="flexbox"
      data-direction={direction}
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  Text: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <p data-testid="text" {...props}>
      {children}
    </p>
  ),
  Title: ({
    children,
    level,
    ...props
  }: React.PropsWithChildren<
    {
      level?: string;
    } & Record<string, unknown>
  >) => {
    const getElementType = (level?: string): string => {
      const headingLevel = level?.toLowerCase();
      if (headingLevel === 'h1') return 'h1';
      if (headingLevel === 'h2') return 'h2';
      if (headingLevel === 'h3') return 'h3';
      if (headingLevel === 'h4') return 'h4';
      if (headingLevel === 'h5') return 'h5';
      if (headingLevel === 'h6') return 'h6';
      return 'div';
    };

    return React.createElement(
      getElementType(level),
      { 'data-testid': 'title', 'data-level': level, ...props },
      children
    );
  },
}));

// Mock BaseDataTable component
jest.mock('@/components/Tables/BaseDataTable', () => {
  return function MockBaseDataTable({
    mainClassName,
    disableFullScreen,
    tableId,
    ...props
  }: {
    data?: unknown;
    mainClassName?: string;
    disableFullScreen?: boolean;
    tableId?: string;
  } & Record<string, unknown>) {
    return (
      <div
        data-testid="base-data-table"
        data-table-id={tableId}
        data-disable-fullscreen={disableFullScreen}
        className={mainClassName}
        {...props}
      >
        Mock BaseDataTable
      </div>
    );
  };
});

// Mock table data
jest.mock('@/lib/constants/mocks/dataTable', () => ({
  tableData: {
    rowIdentifier: 'id',
    headers: [
      { text: 'Test Header 1', accessorKey: 'field1' },
      { text: 'Test Header 2', accessorKey: 'field2' },
    ],
    rows: [
      { id: '1', field1: 'value1', field2: 'value2' },
      { id: '2', field1: 'value3', field2: 'value4' },
    ],
  },
}));

describe('TablePage', () => {
  describe('Rendering', () => {
    it('should render the table page with all required components', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('text')).toBeInTheDocument();
      expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();
    });

    it('should render the correct title for generic table', async () => {
      const mockParams = Promise.resolve({ id: '123' });

      render(await TablePage({ params: mockParams }));

      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('Table 123');
      expect(title).toHaveAttribute('data-level', 'H2');
    });

    it('should render special title for table-1', async () => {
      const mockParams = Promise.resolve({ id: 'table-1' });

      render(await TablePage({ params: mockParams }));

      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('Demand During Lead Time');
    });

    it('should render the descriptive text', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const text = screen.getByTestId('text');
      expect(text).toHaveTextContent('Here is the full table');
    });

    it('should render the download button with correct text and styling', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Download full data');
      expect(button).toHaveAttribute('data-design', 'Emphasized');
      expect(button).toHaveClass('mt-4');
    });
  });

  describe('BaseDataTable Integration', () => {
    it('should pass correct props to BaseDataTable', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const table = screen.getByTestId('base-data-table');
      expect(table).toHaveAttribute('data-table-id', 'test-table');
      expect(table).toHaveAttribute('data-disable-fullscreen', 'true');
      expect(table).toHaveClass('w-full', 'h-[calc(100vh-15rem)]');
    });

    it('should pass table data to BaseDataTable', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const table = screen.getByTestId('base-data-table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveTextContent('Mock BaseDataTable');
    });
  });

  describe('Layout and Styling', () => {
    it('should apply correct styling to header container', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const flexBoxes = screen.getAllByTestId('flexbox');
      const headerContainer = flexBoxes[0];
      expect(headerContainer).toHaveAttribute('data-direction', 'Column');
      expect(headerContainer).toHaveClass(
        'pb-4',
        'border-b-2',
        'border-gray-300',
        'mb-6',
        'sticky',
        'top-0',
        'z-10'
      );
    });

    it('should have proper layout structure', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const flexBoxes = screen.getAllByTestId('flexbox');
      expect(flexBoxes).toHaveLength(2); // Header container and button container

      const headerContainer = flexBoxes[0];
      const buttonContainer = flexBoxes[1];

      // Header container should contain title and text
      expect(headerContainer).toContainElement(screen.getByTestId('title'));
      expect(headerContainer).toContainElement(screen.getByTestId('text'));

      // Button container should contain the download button
      expect(buttonContainer).toContainElement(screen.getByTestId('button'));
    });
  });

  describe('Data Handling', () => {
    it('should handle different table IDs correctly', async () => {
      const testCases = [
        { id: 'table-1', expectedTitle: 'Demand During Lead Time' },
        { id: 'table-2', expectedTitle: 'Table table-2' },
        { id: 'custom-table', expectedTitle: 'Table custom-table' },
        { id: '123', expectedTitle: 'Table 123' },
      ];

      for (const testCase of testCases) {
        const mockParams = Promise.resolve({ id: testCase.id });
        const { unmount } = render(await TablePage({ params: mockParams }));

        const title = screen.getByTestId('title');
        expect(title).toHaveTextContent(testCase.expectedTitle);

        unmount(); // Clean up before next iteration
      }
    });

    it('should pass the correct tableId to BaseDataTable for each table', async () => {
      const testIds = ['table-1', 'table-2', 'custom-123'];

      for (const id of testIds) {
        const mockParams = Promise.resolve({ id });
        const { unmount } = render(await TablePage({ params: mockParams }));

        const table = screen.getByTestId('base-data-table');
        expect(table).toHaveAttribute('data-table-id', id);

        unmount(); // Clean up before next iteration
      }
    });
  });

  describe('Special Cases', () => {
    it('should handle table-1 specifically', async () => {
      const mockParams = Promise.resolve({ id: 'table-1' });

      render(await TablePage({ params: mockParams }));

      const title = screen.getByTestId('title');
      expect(title).toHaveTextContent('Demand During Lead Time');

      const table = screen.getByTestId('base-data-table');
      expect(table).toHaveAttribute('data-table-id', 'table-1');
    });

    it('should handle edge case IDs', async () => {
      const edgeCases = [
        { id: '0', expectedTitle: 'Table 0' },
        { id: 'table-', expectedTitle: 'Table table-' },
        {
          id: 'very-long-table-id-name',
          expectedTitle: 'Table very-long-table-id-name',
        },
      ];

      for (const testCase of edgeCases) {
        const mockParams = Promise.resolve({ id: testCase.id });
        const { unmount } = render(await TablePage({ params: mockParams }));

        const title = screen.getByTestId('title');
        const expectedTitle =
          testCase.id === 'table-1'
            ? 'Demand During Lead Time'
            : testCase.expectedTitle;
        expect(title).toHaveTextContent(expectedTitle);

        unmount(); // Clean up before next iteration
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      const title = screen.getByTestId('title');
      expect(title).toHaveAttribute('data-level', 'H2');
    });

    it('should provide clear content description', async () => {
      const mockParams = Promise.resolve({ id: 'test-table' });

      render(await TablePage({ params: mockParams }));

      expect(screen.getByText('Here is the full table')).toBeInTheDocument();
      expect(screen.getByText('Download full data')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should properly integrate all UI components', async () => {
      const mockParams = Promise.resolve({ id: 'integration-test' });

      render(await TablePage({ params: mockParams }));

      // Verify all components are rendered and accessible
      expect(screen.getByTestId('title')).toBeInTheDocument();
      expect(screen.getByTestId('text')).toBeInTheDocument();
      expect(screen.getByTestId('base-data-table')).toBeInTheDocument();
      expect(screen.getByTestId('button')).toBeInTheDocument();

      // Verify proper data flow
      const table = screen.getByTestId('base-data-table');
      expect(table).toHaveAttribute('data-table-id', 'integration-test');
      expect(table).toHaveAttribute('data-disable-fullscreen', 'true');
    });
  });
});
