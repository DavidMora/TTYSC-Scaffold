export interface FilterField {
  key: FilterKey;
  label: string;
}

export interface FilterValue {
  key: string | null;
  name: string;
}

export interface FilterState {
  analysis: FilterValue;
  organizations: FilterValue;
  CM: FilterValue;
  SKU: FilterValue;
  NVPN: FilterValue;
}

export interface FilterOptions {
  analysis: FilterValue[];
  organizations: FilterValue[];
  CM: FilterValue[];
  SKU: FilterValue[];
  NVPN: FilterValue[];
}

export type FilterKey = keyof FilterState;

export interface CasesResponse {
  data: FilterOptions;
}

export interface CasesAnalysisResponse {
  data: {
    analysis: FilterValue[];
  };
}
