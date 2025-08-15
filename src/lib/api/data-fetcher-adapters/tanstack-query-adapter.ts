import { HttpClientResponse } from '@/lib/types/api/http-client';
import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
} from '@/lib/types/api/data-fetcher';
import { useQuery } from '@tanstack/react-query';

interface TanStackQueryResult<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
}

type UseQueryHook = <T>(options: {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  refetchInterval?: number;
  retry?: boolean | number;
  retryDelay?: number;
}) => TanStackQueryResult<T>;

/**
 * Normalizes a DataFetcherKey into a format that TanStack Query can use
 * TanStack Query expects an array as the queryKey
 */
function normalizeKeyForTanStackQuery(key: DataFetcherKey): readonly unknown[] {
  if (typeof key === 'string') {
    return [key];
  }
  return key;
}

export class TanStackQueryAdapter implements DataFetcherAdapter {
  private readonly useQuery: UseQueryHook;

  constructor() {
    this.useQuery = useQuery;
  }

  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Transform the fetcher to extract data from HttpClientResponse
    const queryFn = async () => {
      const response = await fetcher();
      return response.data;
    };

    // Normalize the key for TanStack Query
    const queryKey = normalizeKeyForTanStackQuery(key);

    // Calculate retry value
    let retry: boolean | number = false;
    if (typeof options.retry === 'number') {
      retry = options.retry;
    } else if (options.retry) {
      retry = 3;
    }

    const queryResult = this.useQuery({
      queryKey,
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
