export const GET_CASES_ANALYSIS = "/cases/analysis";
export const GET_CASES = "/cases";
export const GET_CASES_BY_ANALYSIS = (analysisNameType: string) =>
  `/cases?analysisNameType=${analysisNameType}`;
