export interface PaginationParams {
  _page?: number | string;
  _limit?: number | string;
}

export interface SortParams {
  _sort?: string;
  _order?: "asc" | "desc";
}

export interface FullTextSearchParams {
  q?: string;
}

export interface RangeOperators {
  [key: `${string}_gte`]: number | string;
  [key: `${string}_lte`]: number | string;
  [key: `${string}_ne`]: number | string;
  [key: `${string}_like`]: string;
}

export interface BaseQueryParams extends PaginationParams, SortParams {
  [key: string]: string | number | undefined;
}
