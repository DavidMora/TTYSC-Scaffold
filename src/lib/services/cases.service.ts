import { httpClient } from '@/lib/api';

import { CasesAnalysisResponse, CasesResponse } from '../types/analysisFilters';
import {
  BFF_CASE_ANALYSIS,
  BFF_CASES_BY_ANALYSIS,
} from '../constants/api/bff-routes';

export const getCasesAnalysis = async () => {
  return httpClient.get<CasesAnalysisResponse>(BFF_CASE_ANALYSIS);
};

export const getCasesByAnalysis = async (analysisNameType: string) => {
  if (!analysisNameType) {
    throw new Error('Analysis name type is required');
  }

  return httpClient.get<CasesResponse>(BFF_CASES_BY_ANALYSIS(analysisNameType));
};
