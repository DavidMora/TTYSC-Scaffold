export interface FilterKeyType {
  name: string;
  key: string;
}

export interface FilterState {
  analysis: string;
  organization: string;
  cmSiteName: string;
  sku: string;
  nvpn: string;
}

export interface CasesRequest {
  analysis: FilterKeyType[];
  organizations: FilterKeyType[];
  CM: FilterKeyType[];
  SKU: FilterKeyType[];
  NVPN: FilterKeyType[];
}

export interface CasesResponse {
  data: CasesRequest;
}

export interface CasesAnalysisResponse {
  data: {
    analysis: FilterKeyType[];
  };
}
