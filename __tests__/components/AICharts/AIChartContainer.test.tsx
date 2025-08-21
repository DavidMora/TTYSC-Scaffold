import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIChartContainer } from '@/components/AICharts/AIChartContainer';
import { useChart } from '@/hooks/charts';
import { AIChartData } from '@/lib/types/charts';

// Mock the useChart hook
jest.mock('@/hooks/charts');
const mockUseChart = useChart as jest.MockedFunction<typeof useChart>;

// Mock the AIChart component
jest.mock('@/components/AICharts/AIChart', () => ({
  AIChart: ({
    data,
    isFullscreen,
    onDateRangeChange,
    onRegionChange,
  }: {
    data: AIChartData;
    isFullscreen?: boolean;
    onDateRangeChange?: (from: string, to: string) => void;
    onRegionChange?: (region: string) => void;
  }) => (
    <div
      data-testid="ai-chart"
      data-chart-data={JSON.stringify(data)}
      data-is-fullscreen={isFullscreen ? 'true' : 'false'}
    >
      AI Chart Component
      <button
        data-testid="trigger-date"
        onClick={() => onDateRangeChange?.('2024-01-01', '2024-01-31')}
      />
      <button
        data-testid="trigger-region"
        onClick={() => onRegionChange?.('north')}
      />
    </div>
  ),
}));

describe('AIChartContainer', () => {
  const mockChartId = 'test-chart-id';
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should render skeleton when loading', () => {
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: undefined,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      // Check if skeleton is rendered (the skeleton doesn't have test IDs, so we check for the structure)
      const skeletonContainer = document.querySelector(
        '[style*="border-radius: 8px"]'
      );
      expect(skeletonContainer).toBeInTheDocument();

      // Check if skeleton items are rendered (3 skeleton items)
      const skeletonItems = document.querySelectorAll(
        '[style*="width: 12px; height: 12px"]'
      );
      expect(skeletonItems).toHaveLength(3);
    });
  });

  describe('Error state', () => {
    it('should render error component with retry button', () => {
      const mockError = new Error('Failed to load chart');
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      // Check if error component is rendered
      expect(screen.getByText('Error loading chart')).toBeInTheDocument();
      expect(screen.getByText('Failed to load chart')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();

      // Check if icon is rendered
      const icon = screen.getByTestId('ui5-icon');
      expect(icon).toBeInTheDocument();
    });

    it('should render error component without error message when error is not an Error instance', () => {
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('String error'),
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      expect(screen.getByText('Error loading chart')).toBeInTheDocument();
      expect(screen.getByText('String error')).toBeInTheDocument();
    });

    it("should render error component with 'Unknown error occurred' when error is not an Error instance", () => {
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: 'String error message' as unknown as Error,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      expect(screen.getByText('Error loading chart')).toBeInTheDocument();
      expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
    });

    it('should call mutate when retry button is clicked', () => {
      const mockError = new Error('Failed to load chart');
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    it('should handle retry gracefully if mutate is undefined', () => {
      const mockError = new Error('Failed to load chart');
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
        mutate: undefined,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      const retryButton = screen.getByText('Retry');
      // Should not throw when clicking retry
      expect(() => fireEvent.click(retryButton)).not.toThrow();
    });
  });

  describe('Success state', () => {
    const mockData = {
      success: true,
      data: {
        headline: 'Test Chart',
        timestamp: '2024-01-01',
        chart: {
          type: 'bar' as const,
          labels: ['A', 'B', 'C'],
          data: [1, 2, 3],
        },
      },
    };

    it('should render AIChart component when data is available', () => {
      mockUseChart.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      const aiChart = screen.getByTestId('ai-chart');
      expect(aiChart).toBeInTheDocument();
      expect(aiChart).toHaveAttribute(
        'data-chart-data',
        JSON.stringify(mockData.data)
      );
      expect(aiChart).toHaveAttribute('data-is-fullscreen', 'false');
    });

    it('passes isFullscreen to AIChart', () => {
      mockUseChart.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} isFullscreen />);

      const aiChart = screen.getByTestId('ai-chart');
      expect(aiChart).toHaveAttribute('data-is-fullscreen', 'true');
    });

    it('wires up date range and region handlers to manage filters', () => {
      mockUseChart.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      // Trigger date range change
      fireEvent.click(screen.getByTestId('trigger-date'));
      // Trigger region change
      fireEvent.click(screen.getByTestId('trigger-region'));

      // Re-render to ensure filters updates don't crash and content still renders
      const aiChart = screen.getByTestId('ai-chart');
      expect(aiChart).toBeInTheDocument();
    });
  });

  describe('Null state', () => {
    it('should render nothing when no data is available and not loading', () => {
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      const { container } = render(<AIChartContainer chartId={mockChartId} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when data exists but data.data is falsy', () => {
      mockUseChart.mockReturnValue({
        data: { success: true, data: null as unknown as AIChartData },
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      const { container } = render(<AIChartContainer chartId={mockChartId} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Hook integration', () => {
    it('should call useChart with correct chartId', () => {
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      render(<AIChartContainer chartId={mockChartId} />);

      expect(mockUseChart).toHaveBeenCalledWith(mockChartId, undefined);
    });

    it('should call onTitleChange when headline changes and handle undefined gracefully', () => {
      const onTitleChange = jest.fn();

      // Initial render: no data
      mockUseChart.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });
      const { rerender } = render(
        <AIChartContainer chartId={mockChartId} onTitleChange={onTitleChange} />
      );
      // No call yet because data is undefined
      expect(onTitleChange).not.toHaveBeenCalled();

      // Update: data with headline
      mockUseChart.mockReturnValue({
        data: {
          success: true,
          data: {
            headline: 'My Title',
            timestamp: '2024-01-01',
            chart: {
              type: 'bar' as const,
              labels: ['X'],
              data: [1],
            },
          },
        },
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });
      rerender(
        <AIChartContainer chartId={mockChartId} onTitleChange={onTitleChange} />
      );

      expect(onTitleChange).toHaveBeenCalledWith('My Title');

      // Update: headline becomes empty string
      mockUseChart.mockReturnValue({
        data: {
          success: true,
          data: {
            headline: '',
            timestamp: '2024-01-01',
            chart: {
              type: 'bar' as const,
              labels: ['X'],
              data: [1],
            },
          },
        },
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });
      rerender(
        <AIChartContainer chartId={mockChartId} onTitleChange={onTitleChange} />
      );

      expect(onTitleChange).toHaveBeenCalledWith('');
    });

    it('should call onTitleChange with empty string when headline is undefined but data exists', () => {
      const onTitleChange = jest.fn();

      mockUseChart.mockReturnValue({
        data: {
          success: true,
          data: {
            // headline intentionally undefined to trigger ?? "" branch
            headline: undefined as unknown as string,
            timestamp: '2024-01-01',
            chart: {
              type: 'bar' as const,
              labels: ['X'],
              data: [1],
            },
          },
        },
        isLoading: false,
        error: undefined,
        mutate: mockMutate,
      });

      render(
        <AIChartContainer chartId={mockChartId} onTitleChange={onTitleChange} />
      );

      expect(onTitleChange).toHaveBeenCalledWith('');
    });
  });
});
