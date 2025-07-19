import { dataFetcher } from "@/lib/api";
import { getCasesAnalysis, getCasesByAnalysis } from "@/lib/services/casesService";

export const CASES_ANALYSIS_KEY = "cases_analysis";
export const CASES_KEY = "cases";

export const useCasesAnalysis = () => {
  return dataFetcher.fetchData(CASES_ANALYSIS_KEY, () => getCasesAnalysis());
};

export const useCasesByAnalysis = (analysisNameType: string) => {
  const cacheKey = `${CASES_KEY}_${analysisNameType}`;
  return dataFetcher.fetchData(cacheKey, () => getCasesByAnalysis(analysisNameType));
};