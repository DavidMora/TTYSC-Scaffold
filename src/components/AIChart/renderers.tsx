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
} from "@/lib/types/charts";
import {
  getBulletMeasures,
  getColumnWithTrendMeasures,
  addChartType,
} from "@/lib/utils/chartUtils";

// Basic chart renderers
export const BarChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => (
  <BarChart dataset={dataset} dimensions={dimensions} measures={measures} />
);

export const ColumnChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => (
  <ColumnChart dataset={dataset} dimensions={dimensions} measures={measures} />
);

export const LineChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => (
  <LineChart dataset={dataset} dimensions={dimensions} measures={measures} />
);

export const AreaChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => (
  <LineChart dataset={dataset} dimensions={dimensions} measures={measures} />
);

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

export const RadarChartRenderer: React.FC<ChartRendererProps> = ({
  dataset,
  dimensions,
  measures,
}) => (
  <RadarChart dataset={dataset} dimensions={dimensions} measures={measures} />
);

// Specialized chart renderers
export const BulletChartRenderer: React.FC<{
  dataset: MultiDataPoint[];
  dimensions: ChartDimension[];
  seriesData: import("@/lib/types/charts").ChartSeries[];
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
  seriesData: import("@/lib/types/charts").ChartSeries[];
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
