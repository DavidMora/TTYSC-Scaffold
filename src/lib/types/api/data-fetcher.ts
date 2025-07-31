import { HttpClientResponse } from "./http-client";

export type DataFetcherKey = string | readonly unknown[];

// Query interfaces (existing)
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

// Mutation interfaces (new)
export interface MutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables
  ) => void;
  invalidateQueries?: DataFetcherKey[];
}

export interface MutationResponse<TData = unknown, TVariables = unknown> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  isIdle: boolean;
  reset: () => void;
}

export interface MutationAdapter {
  mutateData<TData = unknown, TVariables = unknown>(
    mutationKey: unknown[],
    mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    options?: MutationOptions<TData, TVariables>
  ): MutationResponse<TData, TVariables>;
}
