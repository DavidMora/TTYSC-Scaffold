export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export const CHART_TYPE = {
  bar: 'bar',
  line: 'line',
  pie: 'pie',
  doughnut: 'doughnut',
  area: 'area',
  column: 'column',
  bullet: 'bullet',
  columnWithTrend: 'columnWithTrend',
  composed: 'composed',
  radar: 'radar',
} as const;

export type ChartType = (typeof CHART_TYPE)[keyof typeof CHART_TYPE];

export interface ChartData {
  type?: ChartType;
  labels: string[];
  data: number[] | ChartSeries[];
}

export interface AIChartData {
  headline?: string;
  timestamp: string;
  preamble?: string;
  content?: string;
  label?: string;
  chart: ChartData;
}

export interface ChartDimension {
  accessor: string;
  formatter: (v: string) => string;
}

export interface ChartMeasure {
  accessor: string;
  label: string;
  formatter: (v: number) => string;
  color?: string;
  axis: string;
}

export interface SingleDataPoint extends Record<string, unknown> {
  name: string;
  value: number;
}

export interface MultiDataPoint extends Record<string, unknown> {
  name: string;
  [key: string]: string | number;
}

// AIChart specific types
export interface BulletMeasure extends ChartMeasure {
  type: 'primary' | 'comparison' | 'additional';
}

export interface ChartMeasureWithType extends ChartMeasure {
  type: ChartType;
}

export interface ChartRendererProps {
  dataset: SingleDataPoint[] | MultiDataPoint[];
  dimensions: ChartDimension[];
  measures: ChartMeasure[] | BulletMeasure[] | ChartMeasureWithType[];
}

export interface ChartDataInfo {
  isMulti: boolean;
  dataset: SingleDataPoint[] | MultiDataPoint[];
  measures: ChartMeasure[];
  seriesData?: ChartSeries[];
}
