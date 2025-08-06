import React from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  DonutChart,
  ColumnChart,
  BulletChart,
  ColumnChartWithTrend,
  ComposedChart,
  RadarChart,
} from "@ui5/webcomponents-react-charts";
import {
  ChartDimension,
  SingleDataPoint,
  MultiDataPoint,
  ChartRendererProps,
  ChartMeasure,
  ChartSeries,
} from "@/lib/types/charts";
import {
  getBulletMeasures,
  getColumnWithTrendMeasures,
  addChartType,
} from "@/lib/utils/chartUtils";

// Chart component mapping for basic charts
const CHART_COMPONENTS = {
  bar: BarChart,
  column: ColumnChart,
  line: LineChart,
  area: LineChart,
  radar: RadarChart,
} as const;

// Generic basic chart renderer factory
const createBasicChartRenderer = (chartType: keyof typeof CHART_COMPONENTS) => {
  const ChartComponent = CHART_COMPONENTS[chartType];
  const Renderer = ({ dataset, dimensions, measures }: ChartRendererProps) => (
    <ChartComponent
      dataset={dataset}
      dimensions={dimensions}
      measures={measures}
    />
  );
  Renderer.displayName = `${
    chartType.charAt(0).toUpperCase() + chartType.slice(1)
  }ChartRenderer`;
  return Renderer;
};

// Basic chart renderers using the factory
export const BarChartRenderer = createBasicChartRenderer("bar");
export const ColumnChartRenderer = createBasicChartRenderer("column");
export const LineChartRenderer = createBasicChartRenderer("line");
export const AreaChartRenderer = createBasicChartRenderer("area");
export const RadarChartRenderer = createBasicChartRenderer("radar");

// Single data point chart renderers (Pie/Donut)
export const PieChartRenderer: React.FC<{
  dataset: SingleDataPoint[];
  dimension: ChartDimension;
  measure: ChartMeasure;
}> = ({ dataset, dimension, measure }) => (
  <PieChart dataset={dataset} dimension={dimension} measure={measure} />
);

export const DonutChartRenderer: React.FC<{
  dataset: SingleDataPoint[];
  dimension: ChartDimension;
  measure: ChartMeasure;
}> = ({ dataset, dimension, measure }) => (
  <DonutChart dataset={dataset} dimension={dimension} measure={measure} />
);

// Specialized chart renderers
export const BulletChartRenderer: React.FC<{
  dataset: MultiDataPoint[];
  dimensions: ChartDimension[];
  seriesData: ChartSeries[];
}> = ({ dataset, dimensions, seriesData }) => {
  const bulletMeasures = getBulletMeasures(seriesData);
  return (
    <BulletChart
      dataset={dataset}
      dimensions={dimensions}
      measures={bulletMeasures}
    />
  );
};

export const ColumnWithTrendRenderer: React.FC<{
  dataset: MultiDataPoint[];
  dimensions: ChartDimension[];
  seriesData: ChartSeries[];
}> = ({ dataset, dimensions, seriesData }) => {
  const columnWithTrendMeasures = getColumnWithTrendMeasures(seriesData);
  return (
    <ColumnChartWithTrend
      dataset={dataset}
      dimensions={dimensions}
      measures={columnWithTrendMeasures}
    />
  );
};

export const ComposedChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => {
  const measuresWithType = addChartType(measures as ChartMeasure[], "bar");
  return (
    <ComposedChart
      dataset={dataset}
      dimensions={dimensions}
      measures={measuresWithType}
    />
  );
};

export const UnsupportedChartRenderer: React.FC<{
  chartType: string;
  isMulti: boolean;
}> = ({ chartType, isMulti }) => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    Chart type not supported{isMulti ? " for multiple series" : ""}: {chartType}
  </div>
);

export const MultiSeriesRequiredRenderer: React.FC<{
  chartType: string;
}> = ({ chartType }) => (
  <div style={{ padding: "20px", textAlign: "center" }}>
    {chartType} requires multiple data series
  </div>
);
