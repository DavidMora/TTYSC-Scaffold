import {
  ChartSeries,
  ChartMeasure,
  SingleDataPoint,
  MultiDataPoint,
  BulletMeasure,
  ChartMeasureWithType,
  ChartDataInfo,
} from '@/lib/types/charts';

export const getSingleMeasures = (): ChartMeasure[] => [
  {
    accessor: 'value',
    label: 'Value',
    formatter: (v: number) => v.toString(),
    axis: 'y',
  },
];

export const getMultiMeasures = (seriesData: ChartSeries[]): ChartMeasure[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: 'y',
  }));

export const getBulletMeasures = (
  seriesData: ChartSeries[]
): BulletMeasure[] => {
  const types: ('primary' | 'comparison' | 'additional')[] = [
    'primary',
    'comparison',
    'additional',
  ];

  return seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: 'y',
    type: types[i] || 'additional',
  }));
};

export const getColumnWithTrendMeasures = (
  seriesData: ChartSeries[]
): ChartMeasureWithType[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: 'y',
    type: i === 0 ? 'column' : 'line',
  }));

export const addChartType = (
  measures: ChartMeasure[],
  chartType: string
): ChartMeasureWithType[] =>
  measures.map((measure) => ({
    ...measure,
    type: chartType,
  }));

export const getMultiDataset = (
  labels: string[],
  seriesData: ChartSeries[]
): MultiDataPoint[] =>
  labels.map((label, idx) => ({
    name: label,
    ...seriesData.reduce(
      (acc, s, i) => ({ ...acc, [`series${i}`]: s.data[idx] }),
      {}
    ),
  }));

export const getSingleDataset = (
  labels: string[],
  data: number[]
): SingleDataPoint[] =>
  data.map((value, idx) => ({ name: labels[idx], value }));

export const getChartDataInfo = (chart: {
  data: number[] | ChartSeries[];
  labels: string[];
}): ChartDataInfo => {
  const isMulti =
    Array.isArray(chart.data) &&
    chart.data.length > 0 &&
    typeof chart.data[0] === 'object' &&
    'name' in chart.data[0];

  if (isMulti) {
    const seriesData = chart.data as ChartSeries[];
    return {
      isMulti: true,
      dataset: getMultiDataset(chart.labels, seriesData),
      measures: getMultiMeasures(seriesData),
      seriesData,
    };
  } else {
    return {
      isMulti: false,
      dataset: getSingleDataset(chart.labels, chart.data as number[]),
      measures: getSingleMeasures(),
    };
  }
};
