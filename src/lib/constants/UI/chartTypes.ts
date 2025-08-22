import { CHART_TYPE, ChartType } from '@/lib/types/charts';

export const CHART_TYPES: Record<string, ChartType> = {
  // UI5 component names
  bar: CHART_TYPE.bar,
  column: CHART_TYPE.column,
  line: CHART_TYPE.line,
  area: CHART_TYPE.area,
  pie: CHART_TYPE.pie,
  doughnut: CHART_TYPE.doughnut,
  bullet: CHART_TYPE.bullet,
  columnWithTrend: CHART_TYPE.columnWithTrend,
  composed: CHART_TYPE.composed,
  radar: CHART_TYPE.radar,
  // Backend component names
  BarChart: CHART_TYPE.bar,
  ColumnChart: CHART_TYPE.column,
  LineChart: CHART_TYPE.line,
  AreaChart: CHART_TYPE.area,
  PieChart: CHART_TYPE.pie,
  DonutChart: CHART_TYPE.doughnut,
  BulletChart: CHART_TYPE.bullet,
  ColumnChartWithTrend: CHART_TYPE.columnWithTrend,
  ComposedChart: CHART_TYPE.composed,
  RadarChart: CHART_TYPE.radar,
};
