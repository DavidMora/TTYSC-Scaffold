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
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import {
  AIChartData,
  ChartSeries,
  ChartDimension,
  ChartMeasure,
  SingleDataPoint,
  MultiDataPoint,
} from "@/lib/types/charts";

interface AIChartProps {
  data: AIChartData;
  className?: string;
  style?: React.CSSProperties;
}

// Type definitions for specialized chart measures
interface BulletMeasure extends ChartMeasure {
  type: "primary" | "comparison" | "additional";
}

interface ChartMeasureWithType extends ChartMeasure {
  type: string;
}

const getSingleMeasures = (): ChartMeasure[] => [
  {
    accessor: "value",
    label: "VaLUE",
    formatter: (v: number) => v.toString(),
    axis: "y",
  },
];

const getMultiMeasures = (seriesData: ChartSeries[]): ChartMeasure[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: "y",
  }));

const getBulletMeasures = (seriesData: ChartSeries[]): BulletMeasure[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: "y",
    type: i === 0 ? "primary" : i === 1 ? "comparison" : "additional",
  }));

const getColumnWithTrendMeasures = (seriesData: ChartSeries[]): ChartMeasureWithType[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: "y",
    type: i === 0 ? "column" : "line",
  }));

const addChartType = (measures: ChartMeasure[], chartType: string): ChartMeasureWithType[] =>
  measures.map(measure => ({
    ...measure,
    type: chartType,
  }));

const getMultiDataset = (
  labels: string[],
  seriesData: ChartSeries[]
): MultiDataPoint[] =>
  labels.map((label, idx) => {
    const dp: MultiDataPoint = { name: label };
    seriesData.forEach((s, i) => {
      dp[`series${i}`] = s.data[idx];
    });
    return dp;
  });

const getSingleDataset = (
  labels: string[],
  data: number[]
): SingleDataPoint[] =>
  data.map((value, idx) => ({ name: labels[idx], value }));

export function AIChart({ data, className, style }: Readonly<AIChartProps>) {
  const { headline, preamble, content, chart } = data;
  const isMulti =
    Array.isArray(chart.data) &&
    chart.data.length > 0 &&
    typeof chart.data[0] === "object" &&
    "name" in chart.data[0];

  const dimensions: ChartDimension[] = [
    { accessor: "name", formatter: (v: string) => v },
  ];

  let dataset: SingleDataPoint[] | MultiDataPoint[], measures: ChartMeasure[];
  if (isMulti) {
    const seriesData = chart.data as ChartSeries[];
    dataset = getMultiDataset(chart.labels, seriesData);
    measures = getMultiMeasures(seriesData);
  } else {
    dataset = getSingleDataset(chart.labels, chart.data as number[]);
    measures = getSingleMeasures();
  }

  // Render chart based on type
  let chartElement = null;
  switch (chart.type) {
    case "bar":
      chartElement = (
        <BarChart
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );
      break;
    case "column":
      chartElement = (
        <ColumnChart
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );
      break;
    case "line":
    case "area":
      chartElement = (
        <LineChart
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );
      break;
    case "pie":
      chartElement = !isMulti ? (
        <PieChart
          dataset={dataset}
          dimension={dimensions[0]}
          measure={measures[0]}
        />
      ) : null;
      break;
    case "doughnut":
      chartElement = !isMulti ? (
        <DonutChart
          dataset={dataset}
          dimension={dimensions[0]}
          measure={measures[0]}
        />
      ) : null;
      break;
    case "bullet":
      if (isMulti) {
        const seriesData = chart.data as ChartSeries[];
        const bulletDataset = getMultiDataset(chart.labels, seriesData);
        const bulletMeasures = getBulletMeasures(seriesData);
        chartElement = (
          <BulletChart
            dataset={bulletDataset}
            dimensions={dimensions}
            measures={bulletMeasures}
          />
        );
      } else {
        chartElement = (
          <div style={{ padding: "20px", textAlign: "center" }}>
            BulletChart requires multiple data series
          </div>
        );
      }
      break;
    case "columnWithTrend":
      if (isMulti) {
        const seriesData = chart.data as ChartSeries[];
        const columnWithTrendDataset = getMultiDataset(chart.labels, seriesData);
        const columnWithTrendMeasures = getColumnWithTrendMeasures(seriesData);
        chartElement = (
          <ColumnChartWithTrend
            dataset={columnWithTrendDataset}
            dimensions={dimensions}
            measures={columnWithTrendMeasures}
          />
        );
      } else {
        chartElement = (
          <div style={{ padding: "20px", textAlign: "center" }}>
            ColumnChartWithTrend requires multiple data series
          </div>
        );
      }
      break;
    case "composed":
      chartElement = (
        <ComposedChart
          dataset={dataset}
          dimensions={dimensions}
          measures={addChartType(measures, "bar")}
        />
      );
      break;
    case "radar":
      chartElement = (
        <RadarChart
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );
      break;
    default:
      chartElement = (
        <div style={{ padding: "20px", textAlign: "center" }}>
          Chart type not supported{isMulti ? " for multiple series" : ""}:{" "}
          {chart.type}
        </div>
      );
  }

  return (
    <div className={className} style={style}>
      <Title level={TitleLevel.H2} style={{ marginBottom: 16 }}>
        {headline}
      </Title>
      {preamble && (
        <p
          style={{
            marginBottom: 12,
            color: "var(--sapTextColor)",
            fontSize: 14,
            lineHeight: "1.4",
          }}
        >
          {preamble}
        </p>
      )}
      {content && (
        <p
          style={{
            color: "var(--sapTextColor)",
            fontSize: 14,
            lineHeight: "1.4",
          }}
        >
          {content}
        </p>
      )}
      <div
        style={{
          borderRadius: 8,
          padding: 16,
          background: "#fff",
          width: "100%",
          height: 400,
          marginBottom: 16,
          marginTop: 16,
        }}
      >
        {chartElement || (
          <div style={{ padding: "20px", textAlign: "center" }}>
            Chart type not supported: {chart.type}
          </div>
        )}
      </div>
    </div>
  );
}
