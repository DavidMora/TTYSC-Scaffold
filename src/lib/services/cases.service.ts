import { apiClient } from '@/lib/api';

import { CasesAnalysisResponse, CasesResponse } from '../types/analysisFilters';
import { CASE_ANALYSIS, CASES_BY_ANALYSIS } from '../constants/api/routes';

export const getCasesAnalysis = async () => {
  return apiClient.get<CasesAnalysisResponse>(CASE_ANALYSIS);
};

export const getCasesByAnalysis = async (analysisNameType: string) => {
  if (!analysisNameType) {
    throw new Error('Analysis name type is required');
  }

  return apiClient.get<CasesResponse>(CASES_BY_ANALYSIS(analysisNameType));
};
