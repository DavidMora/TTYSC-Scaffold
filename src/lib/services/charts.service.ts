import { apiClient } from "@/lib/api";
import { AUXILIARY_CHART } from "../constants/api/routes";
import { AIChartData } from "@/lib/types/charts";
import { BaseResponse } from "@/lib/types/http/responses";

export const getChart = async (chartId: string) => {
  return apiClient.get<BaseResponse<AIChartData>>(AUXILIARY_CHART(chartId));
};
