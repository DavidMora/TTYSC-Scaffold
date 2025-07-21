import { httpClient } from "@/lib/api";
import { BASE_URL } from "@/lib/constants/config";
import {
  GET_CASES_ANALYSIS,
  GET_CASES_BY_ANALYSIS,
} from "@/lib/constants/api/cases";
import { CasesAnalysisResponse, CasesResponse } from "../types/analysisFilters";

export const getCasesAnalysis = async () => {
  return httpClient.get<CasesAnalysisResponse>(
    `${BASE_URL}${GET_CASES_ANALYSIS}`
  );
};

export const getCasesByAnalysis = async (analysisNameType: string) => {
  return httpClient.get<CasesResponse>(
    `${BASE_URL}${GET_CASES_BY_ANALYSIS(analysisNameType)}`
  );
};
