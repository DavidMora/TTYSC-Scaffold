import {
  getSingleMeasures,
  getMultiMeasures,
  getBulletMeasures,
  getColumnWithTrendMeasures,
  addChartType,
  getChartDataInfo,
} from '@/lib/utils/chartUtils';
import { ChartSeries, ChartMeasure } from '@/lib/types/charts';

describe('chartUtils', () => {
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
    {
      name: 'Series 3',
      data: [80, 180, 120],
      color: '#00d4aa',
    },
  ];

  const mockLabels = ['Category 1', 'Category 2', 'Category 3'];
  const mockData = [100, 200, 150];

  describe('getSingleMeasures', () => {
    it('returns single measures with correct structure', () => {
      const measures = getSingleMeasures();

      expect(measures).toHaveLength(1);
      expect(measures[0]).toEqual({
        accessor: 'value',
        label: 'Value',
        formatter: expect.any(Function),
        axis: 'y',
      });
    });

    it('formatter function works correctly', () => {
      const measures = getSingleMeasures();
      const formatter = measures[0].formatter;

      expect(formatter(100)).toBe('100');
      expect(formatter(0)).toBe('0');
      expect(formatter(-50)).toBe('-50');
      expect(formatter(3.14)).toBe('3.14');
    });
  });

  describe('getMultiMeasures', () => {
    it('formatter functions work correctly', () => {
      const measures = getMultiMeasures(mockSeriesData);

      measures.forEach((measure) => {
        const formatter = measure.formatter;
        expect(formatter(100)).toBe('100');
        expect(formatter(0)).toBe('0');
        expect(formatter(-50)).toBe('-50');
      });
    });
  });

  describe('getBulletMeasures', () => {
    it('covers all bullet measure type branches', () => {
      // Test with 4 series to cover the "additional" type branch
      const fourSeries = [
        ...mockSeriesData,
        {
          name: 'Series 4',
          data: [90, 190, 110],
          color: '#ff9900',
        },
      ];

      const measures = getBulletMeasures(fourSeries);

      expect(measures).toHaveLength(4);
      expect(measures[0].type).toBe('primary');
      expect(measures[1].type).toBe('comparison');
      expect(measures[2].type).toBe('additional');
      expect(measures[3].type).toBe('additional');

      // Execute formatter functions to ensure coverage
      measures.forEach((measure) => {
        expect(measure.formatter(100)).toBe('100');
      });
    });
  });

  describe('getColumnWithTrendMeasures', () => {
    it('returns column with trend measures with correct types', () => {
      const measures = getColumnWithTrendMeasures(mockSeriesData);

      expect(measures).toHaveLength(3);

      // First series should be column
      expect(measures[0]).toEqual({
        accessor: 'series0',
        label: 'Series 1',
        formatter: expect.any(Function),
        color: '#0070f3',
        axis: 'y',
        type: 'column',
      });

      // Other series should be line
      expect(measures[1]).toEqual({
        accessor: 'series1',
        label: 'Series 2',
        formatter: expect.any(Function),
        color: '#ff6b6b',
        axis: 'y',
        type: 'line',
      });

      expect(measures[2]).toEqual({
        accessor: 'series2',
        label: 'Series 3',
        formatter: expect.any(Function),
        color: '#00d4aa',
        axis: 'y',
        type: 'line',
      });
    });

    it('executes formatter functions in column with trend measures', () => {
      const measures = getColumnWithTrendMeasures(mockSeriesData);

      expect(measures).toHaveLength(3);

      // Execute formatter functions to ensure coverage
      measures.forEach((measure) => {
        expect(measure.formatter(100)).toBe('100');
        expect(measure.formatter(0)).toBe('0');
        expect(measure.formatter(-50)).toBe('-50');
      });
    });
  });

  describe('addChartType', () => {
    it('adds chart type to measures', () => {
      const measures: ChartMeasure[] = [
        {
          accessor: 'value',
          label: 'Value',
          formatter: (v: number) => v.toString(),
          axis: 'y',
        },
        {
          accessor: 'count',
          label: 'Count',
          formatter: (v: number) => v.toString(),
          axis: 'y',
        },
      ];

      const result = addChartType(measures, 'bar');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        accessor: 'value',
        label: 'Value',
        formatter: expect.any(Function),
        axis: 'y',
        type: 'bar',
      });
      expect(result[1]).toEqual({
        accessor: 'count',
        label: 'Count',
        formatter: expect.any(Function),
        axis: 'y',
        type: 'bar',
      });
    });
  });

  describe('getChartDataInfo', () => {
    it('creates single chart data info from number array', () => {
      const chart = {
        data: mockData,
        labels: mockLabels,
      };

      const result = getChartDataInfo(chart);

      expect(result).toEqual({
        isMulti: false,
        dataset: expect.arrayContaining([
          { name: 'Category 1', value: 100 },
          { name: 'Category 2', value: 200 },
          { name: 'Category 3', value: 150 },
        ]),
        measures: expect.arrayContaining([
          {
            accessor: 'value',
            label: 'Value',
            formatter: expect.any(Function),
            axis: 'y',
          },
        ]),
        seriesData: undefined,
      });
    });

    it('creates multi chart data info from series array', () => {
      const chart = {
        data: mockSeriesData,
        labels: mockLabels,
      };

      const result = getChartDataInfo(chart);

      expect(result).toEqual({
        isMulti: true,
        dataset: expect.arrayContaining([
          { name: 'Category 1', series0: 100, series1: 150, series2: 80 },
          { name: 'Category 2', series0: 200, series1: 250, series2: 180 },
          { name: 'Category 3', series0: 150, series1: 200, series2: 120 },
        ]),
        measures: expect.arrayContaining([
          {
            accessor: 'series0',
            label: 'Series 1',
            formatter: expect.any(Function),
            color: '#0070f3',
            axis: 'y',
          },
          {
            accessor: 'series1',
            label: 'Series 2',
            formatter: expect.any(Function),
            color: '#ff6b6b',
            axis: 'y',
          },
          {
            accessor: 'series2',
            label: 'Series 3',
            formatter: expect.any(Function),
            color: '#00d4aa',
            axis: 'y',
          },
        ]),
        seriesData: mockSeriesData,
      });
    });
  });
});
