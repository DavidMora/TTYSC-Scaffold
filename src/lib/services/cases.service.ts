import { httpClient } from "@/lib/api";

import { CasesAnalysisResponse, CasesResponse } from "../types/analysisFilters";
import { CASE_ANALYSIS, CASES_BY_ANALYSIS } from "../constants/api/routes";

export const getCasesAnalysis = async () => {
  return httpClient.get<CasesAnalysisResponse>(CASE_ANALYSIS);
};

export const getCasesByAnalysis = async (analysisNameType: string) => {
  return httpClient.get<CasesResponse>(CASES_BY_ANALYSIS(analysisNameType));
};
