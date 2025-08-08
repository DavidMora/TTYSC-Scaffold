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
import ZoomableContainer from "@/components/Charts/ZoomableContainer";

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

  const wrapVisual = (node: React.ReactNode) => (
    <ZoomableContainer height={400} mode="visual">{node}</ZoomableContainer>
  );

  const wrapDataX = (
    datasetArray: SingleDataPoint[] | MultiDataPoint[],
    render: (sliced: SingleDataPoint[] | MultiDataPoint[]) => React.ReactNode
  ) => {
    return (
      <ZoomableContainer
        height={400}
        mode="dataX"
        renderContent={({ start, end }) => {
          const len = datasetArray.length;
          const from = Math.floor(start * len);
          let to = Math.ceil(end * len);
          if (to <= from) to = from + 1;
          if (to > len) to = len;
          const sliced = datasetArray.slice(from, to);
          return render(sliced);
        }}
      >
        {null}
      </ZoomableContainer>
    );
  };

  switch (chartType) {
    case "bar":
      return wrapVisual(
        <BarChartRenderer
          dataset={dataset}
          dimensions={dimensions}
          measures={measures}
        />
      );

    case "column":
      return wrapDataX(dataset as SingleDataPoint[] | MultiDataPoint[], (sliced) => (
        <ColumnChartRenderer
          dataset={sliced}
          dimensions={dimensions}
          measures={measures}
        />
      ));

    case "line":
    case "area":
      return wrapDataX(dataset as SingleDataPoint[] | MultiDataPoint[], (sliced) => (
        <LineChartRenderer
          dataset={sliced}
          dimensions={dimensions}
          measures={measures}
        />
      ));

    case "pie":
      if (!isMulti) {
        return wrapVisual(
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
        return wrapVisual(
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
        return wrapVisual(
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
        return wrapVisual(
          <ColumnWithTrendRenderer
            dataset={dataset as MultiDataPoint[]}
            dimensions={dimensions}
            seriesData={seriesData}
          />
        );
      }
      return <MultiSeriesRequiredRenderer chartType="ColumnChartWithTrend" />;

    case "composed":
      return wrapDataX(dataset as SingleDataPoint[] | MultiDataPoint[], (sliced) => (
        <ComposedChartRenderer
          dataset={sliced}
          dimensions={dimensions}
          measures={measures}
        />
      ));

    case "radar":
      return wrapVisual(
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
