import { HttpClientResponse } from "../../types/api/http-client";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../data-fetcher";

// Note: This adapter requires @tanstack/react-query to be installed
// yarn add @tanstack/react-query

interface TanStackQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

type UseQueryHook = <T>(options: {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  retry?: boolean | number;
  retryDelay?: number;
}) => TanStackQueryResult<T>;

export class TanStackQueryAdapter implements DataFetcherAdapter {
  private readonly useQuery: UseQueryHook;

  constructor() {
    // This would be the actual implementation with TanStack Query:
    // import { useQuery } from '@tanstack/react-query';
    // this.useQuery = useQuery;

    // For now, throwing an error since TanStack Query is not installed
    throw new Error(
      "TanStackQueryAdapter requires @tanstack/react-query to be installed. Run: yarn add @tanstack/react-query"
    );
  }

  fetchData<T = unknown>(
    key: string,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Transform the fetcher to extract data from HttpClientResponse
    const queryFn = async () => {
      const response = await fetcher();
      return response.data;
    };

    // Calculate retry value
    let retry: boolean | number = false;
    if (typeof options.retry === "number") {
      retry = options.retry;
    } else if (options.retry) {
      retry = 3;
    }

    const queryResult = this.useQuery({
      queryKey: [key],
      queryFn,
      enabled: options.enabled !== false,
      refetchInterval: options.refreshInterval,
      retry,
      retryDelay: options.retryDelay,
    });

    return {
      data: queryResult.data,
      error: queryResult.error || undefined,
      isLoading: queryResult.isLoading,
      isValidating: queryResult.isFetching,
      mutate: () => queryResult.refetch(),
    };
  }
}

export default TanStackQueryAdapter;
