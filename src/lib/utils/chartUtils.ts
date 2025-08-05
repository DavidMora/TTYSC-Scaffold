import {
  ChartSeries,
  ChartMeasure,
  SingleDataPoint,
  MultiDataPoint,
  BulletMeasure,
  ChartMeasureWithType,
  ChartDataInfo,
} from "@/lib/types/charts";

export const getSingleMeasures = (): ChartMeasure[] => [
  {
    accessor: "value",
    label: "VaLUE",
    formatter: (v: number) => v.toString(),
    axis: "y",
  },
];

export const getMultiMeasures = (seriesData: ChartSeries[]): ChartMeasure[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: "y",
  }));

export const getBulletMeasures = (seriesData: ChartSeries[]): BulletMeasure[] =>
  seriesData.map((series, i) => {
    if (i === 0) {
      return {
        accessor: `series${i}`,
        label: series.name,
        formatter: (v: number) => v.toString(),
        color: series.color,
        axis: "y",
        type: "primary",
      };
    } else if (i === 1) {
      return {
        accessor: `series${i}`,
        label: series.name,
        formatter: (v: number) => v.toString(),
        color: series.color,
        axis: "y",
        type: "comparison",
      };
    } else {
      return {
        accessor: `series${i}`,
        label: series.name,
        formatter: (v: number) => v.toString(),
        color: series.color,
        axis: "y",
        type: "additional",
      };
    }
  });

export const getColumnWithTrendMeasures = (
  seriesData: ChartSeries[]
): ChartMeasureWithType[] =>
  seriesData.map((series, i) => ({
    accessor: `series${i}`,
    label: series.name,
    formatter: (v: number) => v.toString(),
    color: series.color,
    axis: "y",
    type: i === 0 ? "column" : "line",
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
  labels.map((label, idx) => {
    const dp: MultiDataPoint = { name: label };
    seriesData.forEach((s, i) => {
      dp[`series${i}`] = s.data[idx];
    });
    return dp;
  });

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
    typeof chart.data[0] === "object" &&
    "name" in chart.data[0];

  let dataset: SingleDataPoint[] | MultiDataPoint[], measures: ChartMeasure[];
  let seriesData: ChartSeries[] | undefined;

  if (isMulti) {
    seriesData = chart.data as ChartSeries[];
    dataset = getMultiDataset(chart.labels, seriesData);
    measures = getMultiMeasures(seriesData);
  } else {
    dataset = getSingleDataset(chart.labels, chart.data as number[]);
    measures = getSingleMeasures();
  }

  return {
    isMulti,
    dataset,
    measures,
    seriesData,
  };
};
