import { validateChart } from '@/lib/utils/chartValidation';
import { CHART_TYPE, ChartData, ChartSeries } from '@/lib/types/charts';

describe('validateChart', () => {
  it('returns error when chart is undefined', () => {
    expect(validateChart(undefined)).toBe(
      'Error Displaying Chart: Invalid chart configuration'
    );
  });

  it('returns error when chart type is missing', () => {
    const chart = { labels: ['A'], data: [1] } as unknown as ChartData;
    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Chart type is required'
    );
  });

  it('returns error when labels is not a non-empty array', () => {
    const chart = {
      type: CHART_TYPE.bar,
      labels: [],
      data: [1, 2, 3],
    } as unknown as ChartData;

    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Labels must be a non-empty array'
    );
  });

  it('returns error when data is not a non-empty array', () => {
    const chart = {
      type: CHART_TYPE.bar,
      labels: ['A', 'B', 'C'],
      data: [],
    } as unknown as ChartData;

    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Data must be a non-empty array'
    );
  });

  it('returns error when data contains non-number values for numeric data', () => {
    const chart = {
      type: CHART_TYPE.bar,
      labels: ['A', 'B', 'C'],
      data: [1, '2', 3] as unknown as number[],
    } as ChartData;

    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Data must be an array of numbers'
    );
  });

  it('returns error when data length does not match labels length for numeric data', () => {
    const chart = {
      type: CHART_TYPE.bar,
      labels: ['A', 'B', 'C'],
      data: [1, 2],
    } as ChartData;

    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Data length must match labels length'
    );
  });

  it('accepts valid numeric data and matching labels', () => {
    const chart: ChartData = {
      type: CHART_TYPE.line,
      labels: ['A', 'B', 'C'],
      data: [1, 2, 3],
    };

    expect(validateChart(chart)).toBeUndefined();
  });

  it('accepts series data (non-numeric first item) without numeric checks', () => {
    const series: ChartSeries[] = [
      { name: 'S1', data: [1, 2, 3] },
      { name: 'S2', data: [2, 3, 4] },
    ];

    const chart: ChartData = {
      type: CHART_TYPE.composed,
      labels: ['A', 'B', 'C'],
      data: series,
    };

    expect(validateChart(chart)).toBeUndefined();
  });

  it('returns error when labels contain string "undefined"', () => {
    const chart: ChartData = {
      type: CHART_TYPE.pie,
      labels: ['A', 'undefined', 'C'],
      data: [1, 2, 3],
    };

    expect(validateChart(chart)).toBe(
      'Error Displaying Chart: Labels must be an array of strings'
    );
  });
});
