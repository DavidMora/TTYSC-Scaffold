export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    perPage: number;
  };
}
