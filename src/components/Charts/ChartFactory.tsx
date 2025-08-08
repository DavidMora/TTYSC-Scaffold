import React from "react";
import {
  ChartDimension,
  ChartDataInfo,
  SingleDataPoint,
  MultiDataPoint,
} from "@/lib/types/charts";
import {
  BarChartRenderer,
  ColumnChartRenderer,
  LineChartRenderer,
  PieChartRenderer,
  DonutChartRenderer,
  BulletChartRenderer,
  ColumnWithTrendRenderer,
  ComposedChartRenderer,
  RadarChartRenderer,
  UnsupportedChartRenderer,
  MultiSeriesRequiredRenderer,
} from "@/components/Charts/renderers";

interface ChartFactoryProps {
  chartType: string;
  chartDataInfo: ChartDataInfo;
}

export const ChartFactory: React.FC<ChartFactoryProps> = ({
  chartType,
  chartDataInfo,
}) => {
  const { isMulti, dataset, measures, seriesData } = chartDataInfo;

  const dimensions: ChartDimension[] = [
    { accessor: "name", formatter: (v: string) => v },
  ];

  switch (chartType) {
    case "bar":
      return (
        <BarChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    case "column":
      return (
        <ColumnChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    case "line":
    case "area":
      return (
        <LineChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    case "pie":
      if (!isMulti) {
        return (
          <PieChartRenderer
            dataset={dataset as SingleDataPoint[]}
            dimension={dimensions[0]}
            measure={measures[0]}
          />
        );
      }
      return <MultiSeriesRequiredRenderer chartType="PieChart" />;

    case "doughnut":
      if (!isMulti) {
        return (
          <DonutChartRenderer
            dataset={dataset as SingleDataPoint[]}
            dimension={dimensions[0]}
            measure={measures[0]}
          />
        );
      }
      return <MultiSeriesRequiredRenderer chartType="DonutChart" />;

    case "bullet":
      if (isMulti && seriesData) {
        return (
          <BulletChartRenderer
            dataset={dataset as MultiDataPoint[]}
            dimensions={dimensions}
            seriesData={seriesData}
          />
        );
      }
      return <MultiSeriesRequiredRenderer chartType="BulletChart" />;

    case "columnWithTrend":
      if (isMulti && seriesData) {
        return (
          <ColumnWithTrendRenderer
            dataset={dataset as MultiDataPoint[]}
            dimensions={dimensions}
            seriesData={seriesData}
          />
        );
      }
      return <MultiSeriesRequiredRenderer chartType="ColumnChartWithTrend" />;

    case "composed":
      return (
        <ComposedChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    case "radar":
      return (
        <RadarChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    default:
      return (
        <UnsupportedChartRenderer chartType={chartType} isMulti={isMulti} />
      );
  }
};
