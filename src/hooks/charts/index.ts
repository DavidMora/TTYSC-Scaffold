import { dataFetcher } from "@/lib/api";
import { getChart } from "@/lib/services/charts.service";

export const CHART_KEY = (chartId: string) => `chart-${chartId}`;

export const useChart = (chartId: string) => {
  return dataFetcher.fetchData(CHART_KEY(chartId), () => getChart(chartId), {
    revalidateOnFocus: false,
  });
};
