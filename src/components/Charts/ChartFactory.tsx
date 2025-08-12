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
  title?: string;
  chartIdForFullscreen?: string;
  height?: number;
  onDateRangeChange?: (from: string, to: string) => void;
  onRegionChange?: (region: string) => void;
  dateRange?: string;
  region?: string;
}

export const ChartFactory: React.FC<ChartFactoryProps> = ({
  chartType,
  chartDataInfo,
  title,
  chartIdForFullscreen,
  height = 400,
  onDateRangeChange,
  onRegionChange,
  dateRange,
  region,
}) => {
  const { isMulti, dataset, measures, seriesData } = chartDataInfo;

  const dimensions: ChartDimension[] = [
    { accessor: "name", formatter: (v: string) => v },
  ];

  const wrapVisual = (node: React.ReactNode) => (
    <ZoomableContainer
      height={height}
      mode="visual"
      title={title}
      chartIdForFullscreen={chartIdForFullscreen}
      dataLength={(dataset as (SingleDataPoint | MultiDataPoint)[]).length}
      exportContext={{ dataset, dimensions, measures, isMulti, seriesData }}
      onDateRangeChange={onDateRangeChange}
      onRegionChange={onRegionChange}
      dateRange={dateRange}
      region={region}
    >
      {node}
    </ZoomableContainer>
  );

  const wrapDataX = (
    datasetArray: SingleDataPoint[] | MultiDataPoint[],
    render: (sliced: SingleDataPoint[] | MultiDataPoint[]) => React.ReactNode
  ) => {
    return (
      <ZoomableContainer
        height={height}
        mode="dataX"
        title={title}
        chartIdForFullscreen={chartIdForFullscreen}
        dataLength={datasetArray.length}
        exportContext={{
          dataset: datasetArray,
          dimensions,
          measures,
          isMulti,
          seriesData,
        }}
        onDateRangeChange={onDateRangeChange}
        onRegionChange={onRegionChange}
        dateRange={dateRange}
        region={region}
        renderContent={({ start, end }) => {
          const len = datasetArray.length;
          if (len === 0) return render([]);
          const span = end - start;
          const desiredCount = Math.max(1, Math.round(span * len));
          const centerIndex = ((start + end) / 2) * len;
          let from = Math.round(centerIndex - desiredCount / 2);
          from = Math.max(0, Math.min(len - desiredCount, from));
          const to = Math.min(len, from + desiredCount);
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
      return wrapDataX(dataset, (sliced) => (
        <BarChartRenderer
          dataset={sliced}
          dimensions={dimensions}
          measures={measures}
        />
      ));

    case "column":
      return wrapDataX(dataset, (sliced) => (
        <ColumnChartRenderer
          dataset={sliced}
          dimensions={dimensions}
          measures={measures}
        />
      ));

    case "line":
    case "area":
      return wrapDataX(dataset, (sliced) => (
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
        return wrapDataX(dataset, (sliced) => (
          <BulletChartRenderer
            dataset={sliced as MultiDataPoint[]}
            dimensions={dimensions}
            seriesData={seriesData}
          />
        ));
      }
      return <MultiSeriesRequiredRenderer chartType="BulletChart" />;

    case "columnWithTrend":
      if (isMulti && seriesData) {
        return wrapDataX(dataset, (sliced) => (
          <ColumnWithTrendRenderer
            dataset={sliced as MultiDataPoint[]}
            dimensions={dimensions}
            seriesData={seriesData}
          />
        ));
      }
      return <MultiSeriesRequiredRenderer chartType="ColumnChartWithTrend" />;

    case "composed":
      return wrapDataX(dataset, (sliced) => (
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
