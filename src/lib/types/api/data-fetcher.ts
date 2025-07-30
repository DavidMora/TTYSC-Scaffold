import { HttpClientResponse } from "./http-client";

export type DataFetcherKey = string | readonly unknown[];

export interface DataFetcherResponse<T = unknown> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating?: boolean;
  mutate?: (data?: T) => void;
}

export interface DataFetcherAdapter {
  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options?: DataFetcherOptions
  ): DataFetcherResponse<T>;
}

export interface DataFetcherOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  dedupingInterval?: number;
  enabled?: boolean;
  retry?: boolean | number;
  retryDelay?: number;
}
