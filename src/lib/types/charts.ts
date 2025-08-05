export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartData {
  type: "bar" | "line" | "pie" | "doughnut" | "area" | "column" | "bullet" | "columnWithTrend" | "composed" | "radar";
  labels: string[];
  data: number[] | ChartSeries[];
}

export interface AIChartData {
  headline: string;
  timestamp: string;
  preamble?: string;
  content?: string;
  chart: ChartData;
}

export interface AIChartResponse {
  success: boolean;
  data: AIChartData;
}

// New interfaces for chart components
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
