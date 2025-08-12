import { apiClient } from "@/lib/api";
import { AUXILIARY_CHART } from "../constants/api/routes";
import { AIChartData } from "@/lib/types/charts";
import { BaseResponse } from "@/lib/types/http/responses";

export type ChartFilters = { from?: string; to?: string; region?: string };

export const getChart = async (chartId: string, filters?: ChartFilters) => {
  let url = AUXILIARY_CHART(chartId);
  if (filters) {
    const params = new URLSearchParams();
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.region) params.set("region", filters.region);
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return apiClient.get<BaseResponse<AIChartData>>(url);
};
