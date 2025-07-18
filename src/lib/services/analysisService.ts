import { httpClient } from "@/lib/api";
import { Analysis } from "@/lib/types/analysis";
import { API_CONFIG } from "@/lib/constants/config";
import { GET_ANALYSIS_BY_ID, CREATE_ANALYSIS, UPDATE_ANALYSIS } from "@/lib/constants/api/analysis";

export const getAnalysisById = async (id: string) => {
  return httpClient.get<Analysis>(`${API_CONFIG.BASE_URL}${GET_ANALYSIS_BY_ID(id)}`);
};

export const createAnalysis = async () => {
  const newAnalysis: Analysis = {
    id: `${Date.now()}`,
    name: "",
    code: `ANLS-${Date.now().toString().slice(-3).padStart(3, "0")}`,
  };

  const analysisResponse = await httpClient.post<Analysis>(
    `${API_CONFIG.BASE_URL}${CREATE_ANALYSIS}`,
    newAnalysis
  );

  return {
    ...analysisResponse,
    data: {
      analysis: analysisResponse.data,
    },
  };
};

export const renameAnalysis = async (id: string, data: { name: string }) => {
  const updateData = {
    name: data.name,
    updatedAt: new Date().toISOString(),
  };

  const response = await httpClient.patch<Analysis>(
    `${API_CONFIG.BASE_URL}${UPDATE_ANALYSIS(id)}`,
    updateData
  );

  return {
    ...response,
    data: {
      analysis: response.data,
    },
  };
};