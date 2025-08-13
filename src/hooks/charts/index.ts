import { dataFetcher } from "@/lib/api";
import { getChart } from "@/lib/services/charts.service";
import { BaseResponse } from "@/lib/types/http/responses";
import { AIChartData } from "@/lib/types/charts";

export const CHART_KEY = (chartId: string) => `chart-${chartId}`;

export type ChartFilters = {
  from?: string;
  to?: string;
  region?: string;
};

export const useChart = (chartId: string, filters?: ChartFilters) => {
  const keyParts = [CHART_KEY(chartId)];
  if (filters?.from || filters?.to || filters?.region) {
    keyParts.push(
      JSON.stringify({
        from: filters?.from,
        to: filters?.to,
        region: filters?.region,
      })
    );
  }
  const key = keyParts.join("|");

  return dataFetcher.fetchData<BaseResponse<AIChartData>>(
    key,
    async () => {
      return getChart(chartId, filters);
    },
    {
      revalidateOnFocus: false,
    }
  );
};
