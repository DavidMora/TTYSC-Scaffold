export interface FilterState {
  analysis: string;
  organization: string;
  cmSiteName: string;
  sku: string;
  nvpn: string;
}

export type FilterKey = keyof FilterState;

export interface FilterOptions {
  analysis: string[];
  organization: string[];
  cmSiteName: string[];
  sku: string[];
  nvpn: string[];
}

export interface FilterConfig {
  key: FilterKey;
  label: string;
}

export interface FilterData {
  [analysis: string]: {
    [organization: string]: {
      [site: string]: {
        [sku: string]: string[];
      };
    };
  };
} 