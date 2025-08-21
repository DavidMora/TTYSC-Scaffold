import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  BarChartRenderer,
  ColumnChartRenderer,
  LineChartRenderer,
  AreaChartRenderer,
  RadarChartRenderer,
  PieChartRenderer,
  DonutChartRenderer,
  BulletChartRenderer,
  ColumnWithTrendRenderer,
  ComposedChartRenderer,
  UnsupportedChartRenderer,
  MultiSeriesRequiredRenderer,
} from '@/components/Charts/renderers';
import {
  ChartDimension,
  ChartMeasure,
  SingleDataPoint,
  MultiDataPoint,
  ChartSeries,
} from '@/lib/types/charts';

// Mock the chart utilities
jest.mock('@/lib/utils/chartUtils', () => ({
  getBulletMeasures: jest.fn((seriesData: ChartSeries[]) =>
    seriesData.map((series: ChartSeries, i: number) => ({
      accessor: `series${i}`,
      label: series.name,
      formatter: (v: number) => v.toString(),
      color: series.color,
      axis: 'y',
      type: i === 0 ? 'primary' : i === 1 ? 'comparison' : 'additional',
    }))
  ),
  getColumnWithTrendMeasures: jest.fn((seriesData: ChartSeries[]) =>
    seriesData.map((series: ChartSeries, i: number) => ({
      accessor: `series${i}`,
      label: series.name,
      formatter: (v: number) => v.toString(),
      color: series.color,
      axis: 'y',
      type: i === 0 ? 'column' : 'line',
    }))
  ),
  addChartType: jest.fn((measures: ChartMeasure[], chartType: string) =>
    measures.map((measure: ChartMeasure) => ({
      ...measure,
      type: chartType,
    }))
  ),
}));

describe('Chart Renderers', () => {
  const mockSingleDataPoint: SingleDataPoint[] = [
    { name: 'Category 1', value: 100 },
    { name: 'Category 2', value: 200 },
    { name: 'Category 3', value: 150 },
  ];

  const mockMultiDataPoint: MultiDataPoint[] = [
    { name: 'Category 1', series0: 100, series1: 150 },
    { name: 'Category 2', series0: 200, series1: 250 },
    { name: 'Category 3', series0: 150, series1: 200 },
  ];

  const mockDimensions: ChartDimension[] = [
    {
      accessor: 'name',
      formatter: (v: string) => v,
    },
  ];

  const mockMeasures: ChartMeasure[] = [
    {
      accessor: 'value',
      label: 'Value',
      formatter: (v: number) => v.toString(),
      axis: 'y',
    },
  ];

  const mockSeriesData: ChartSeries[] = [
    {
      name: 'Series 1',
      data: [100, 200, 150],
      color: '#0070f3',
    },
    {
      name: 'Series 2',
      data: [150, 250, 200],
      color: '#ff6b6b',
    },
  ];

  describe('Basic Chart Renderers', () => {
    describe('BarChartRenderer', () => {
      it('renders BarChart with correct props', () => {
        render(
          <BarChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const barChart = screen.getByTestId('bar-chart-mock');
        expect(barChart).toBeInTheDocument();
        expect(barChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockMultiDataPoint)
        );
        expect(barChart).toHaveAttribute(
          'data-dimensions',
          JSON.stringify(mockDimensions)
        );
        expect(barChart).toHaveAttribute(
          'data-measures',
          JSON.stringify(mockMeasures)
        );
      });
    });

    describe('ColumnChartRenderer', () => {
      it('renders ColumnChart with correct props', () => {
        render(
          <ColumnChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const columnChart = screen.getByTestId('column-chart-mock');
        expect(columnChart).toBeInTheDocument();
        expect(columnChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockMultiDataPoint)
        );
        expect(columnChart).toHaveAttribute(
          'data-dimensions',
          JSON.stringify(mockDimensions)
        );
        expect(columnChart).toHaveAttribute(
          'data-measures',
          JSON.stringify(mockMeasures)
        );
      });
    });

    describe('LineChartRenderer', () => {
      it('renders LineChart with correct props', () => {
        render(
          <LineChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const lineChart = screen.getByTestId('line-chart-mock');
        expect(lineChart).toBeInTheDocument();
        expect(lineChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockMultiDataPoint)
        );
        expect(lineChart).toHaveAttribute(
          'data-dimensions',
          JSON.stringify(mockDimensions)
        );
        expect(lineChart).toHaveAttribute(
          'data-measures',
          JSON.stringify(mockMeasures)
        );
      });
    });

    describe('AreaChartRenderer', () => {
      it('renders LineChart (area) with correct props', () => {
        render(
          <AreaChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const areaChart = screen.getByTestId('line-chart-mock');
        expect(areaChart).toBeInTheDocument();
        expect(areaChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockMultiDataPoint)
        );
        expect(areaChart).toHaveAttribute(
          'data-dimensions',
          JSON.stringify(mockDimensions)
        );
        expect(areaChart).toHaveAttribute(
          'data-measures',
          JSON.stringify(mockMeasures)
        );
      });
    });

    describe('RadarChartRenderer', () => {
      it('renders RadarChart with correct props', () => {
        render(
          <RadarChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const radarChart = screen.getByTestId('radar-chart-mock');
        expect(radarChart).toBeInTheDocument();
        expect(radarChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockMultiDataPoint)
        );
        expect(radarChart).toHaveAttribute(
          'data-dimensions',
          JSON.stringify(mockDimensions)
        );
        expect(radarChart).toHaveAttribute(
          'data-measures',
          JSON.stringify(mockMeasures)
        );
      });
    });
  });

  describe('Single Data Point Chart Renderers', () => {
    const mockDimension: ChartDimension = {
      accessor: 'name',
      formatter: (v: string) => v,
    };

    const mockMeasure: ChartMeasure = {
      accessor: 'value',
      label: 'Value',
      formatter: (v: number) => v.toString(),
      axis: 'y',
    };

    describe('PieChartRenderer', () => {
      it('renders PieChart with correct props', () => {
        render(
          <PieChartRenderer
            dataset={mockSingleDataPoint}
            dimension={mockDimension}
            measure={mockMeasure}
          />
        );

        const pieChart = screen.getByTestId('pie-chart-mock');
        expect(pieChart).toBeInTheDocument();
        expect(pieChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockSingleDataPoint)
        );
        expect(pieChart).toHaveAttribute(
          'data-dimension',
          JSON.stringify(mockDimension)
        );
        expect(pieChart).toHaveAttribute(
          'data-measure',
          JSON.stringify(mockMeasure)
        );
      });
    });

    describe('DonutChartRenderer', () => {
      it('renders DonutChart with correct props', () => {
        render(
          <DonutChartRenderer
            dataset={mockSingleDataPoint}
            dimension={mockDimension}
            measure={mockMeasure}
          />
        );

        const donutChart = screen.getByTestId('donut-chart-mock');
        expect(donutChart).toBeInTheDocument();
        expect(donutChart).toHaveAttribute(
          'data-dataset',
          JSON.stringify(mockSingleDataPoint)
        );
        expect(donutChart).toHaveAttribute(
          'data-dimension',
          JSON.stringify(mockDimension)
        );
        expect(donutChart).toHaveAttribute(
          'data-measure',
          JSON.stringify(mockMeasure)
        );
      });
    });
  });

  describe('Specialized Chart Renderers', () => {
    describe('BulletChartRenderer', () => {
      it('renders BulletChart with processed measures', () => {
        const { getBulletMeasures } = jest.requireMock(
          '@/lib/utils/chartUtils'
        );
        getBulletMeasures.mockReturnValue([
          {
            accessor: 'series0',
            label: 'Series 1',
            formatter: (v: number) => v.toString(),
            color: '#0070f3',
            axis: 'y',
            type: 'primary',
          },
          {
            accessor: 'series1',
            label: 'Series 2',
            formatter: (v: number) => v.toString(),
            color: '#ff6b6b',
            axis: 'y',
            type: 'comparison',
          },
        ]);

        render(
          <BulletChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            seriesData={mockSeriesData}
          />
        );

        const bulletChart = screen.getByTestId('bullet-chart-mock');
        expect(bulletChart).toBeInTheDocument();
        expect(getBulletMeasures).toHaveBeenCalledWith(mockSeriesData);
      });
    });

    describe('ColumnWithTrendRenderer', () => {
      it('renders ColumnChartWithTrend with processed measures', () => {
        const { getColumnWithTrendMeasures } = jest.requireMock(
          '@/lib/utils/chartUtils'
        );
        getColumnWithTrendMeasures.mockReturnValue([
          {
            accessor: 'series0',
            label: 'Series 1',
            formatter: (v: number) => v.toString(),
            color: '#0070f3',
            axis: 'y',
            type: 'column',
          },
          {
            accessor: 'series1',
            label: 'Series 2',
            formatter: (v: number) => v.toString(),
            color: '#ff6b6b',
            axis: 'y',
            type: 'line',
          },
        ]);

        render(
          <ColumnWithTrendRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            seriesData={mockSeriesData}
          />
        );

        const columnWithTrendChart = screen.getByTestId(
          'column-with-trend-chart-mock'
        );
        expect(columnWithTrendChart).toBeInTheDocument();
        expect(getColumnWithTrendMeasures).toHaveBeenCalledWith(mockSeriesData);
      });
    });

    describe('ComposedChartRenderer', () => {
      it('renders ComposedChart with chart type added to measures', () => {
        const { addChartType } = jest.requireMock('@/lib/utils/chartUtils');
        const measuresWithType = mockMeasures.map((measure) => ({
          ...measure,
          type: 'bar',
        }));
        addChartType.mockReturnValue(measuresWithType);

        render(
          <ComposedChartRenderer
            dataset={mockMultiDataPoint}
            dimensions={mockDimensions}
            measures={mockMeasures}
          />
        );

        const composedChart = screen.getByTestId('composed-chart-mock');
        expect(composedChart).toBeInTheDocument();
        expect(addChartType).toHaveBeenCalledWith(mockMeasures, 'bar');
      });
    });
  });

  describe('Error Renderers', () => {
    describe('UnsupportedChartRenderer', () => {
      it('renders error message for unsupported chart type', () => {
        render(
          <UnsupportedChartRenderer chartType="unsupported" isMulti={false} />
        );

        const messageStrip = screen.getByTestId('ui5-messagestrip');
        expect(messageStrip).toBeInTheDocument();
        expect(messageStrip.textContent).toBe(
          'Chart type not supported: unsupported'
        );
      });

      it('renders error message for unsupported multi-series chart type', () => {
        render(
          <UnsupportedChartRenderer chartType="unsupported" isMulti={true} />
        );

        const messageStrip = screen.getByTestId('ui5-messagestrip');
        expect(messageStrip).toBeInTheDocument();
        expect(messageStrip.textContent).toBe(
          'Chart type not supported for multiple series: unsupported'
        );
      });
    });

    describe('MultiSeriesRequiredRenderer', () => {
      it('renders error message for chart requiring multiple series', () => {
        render(<MultiSeriesRequiredRenderer chartType="bullet" />);

        const messageStrip = screen.getByTestId('ui5-messagestrip');
        expect(messageStrip).toBeInTheDocument();
        expect(messageStrip.textContent).toBe(
          'bullet requires multiple data series'
        );
      });
    });
  });
});
