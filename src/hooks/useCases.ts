import { dataFetcher } from "@/lib/api";
import {
  getCasesAnalysis,
  getCasesByAnalysis,
} from "@/lib/services/cases.service";

export const useCasesAnalysis = () => {
  return dataFetcher.fetchData("cases_analysis", () => getCasesAnalysis());
};

export const useCasesByAnalysis = (analysisNameType: string) => {
  return dataFetcher.fetchData(`cases_${analysisNameType}`, () =>
    getCasesByAnalysis(analysisNameType)
  );
};
