import { HttpClientResponse } from "@/lib/types/api/http-client";
import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
} from "@/lib/types/api/data-fetcher";
import useSWR from "swr";

// Note: This adapter requires SWR to be installed
// yarn add swr

interface SWRResponse<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  mutate: (data?: T) => void;
}

type SWRHook = <T>(
  key: string | readonly unknown[] | null,
  fetcher: () => Promise<T>,
  options?: unknown
) => SWRResponse<T>;

/**
 * Normalizes a DataFetcherKey into a format that SWR can use
 * SWR accepts string, array, or null as keys
 */
function normalizeKeyForSWR(key: DataFetcherKey): string | readonly unknown[] {
  return key; // SWR natively supports both string and array keys
}

export class SWRAdapter implements DataFetcherAdapter {
  private readonly useSWR: SWRHook;

  constructor(swrHook?: SWRHook) {
    // Allow injection of SWR hook for testing purposes
    this.useSWR = swrHook || useSWR;
  }

  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Transform the fetcher to extract data from HttpClientResponse
    const swrFetcher = async () => {
      const response = await fetcher();
      return response.data;
    };

    // Normalize the key for SWR
    const normalizedKey = normalizeKeyForSWR(key);

    // Calculate retry count
    let errorRetryCount = 0;
    if (typeof options.retry === "number") {
      errorRetryCount = options.retry;
    } else if (options.retry) {
      errorRetryCount = 3;
    }

    // Transform options to SWR format
    const swrOptions = {
      revalidateOnFocus: options.revalidateOnFocus,
      revalidateOnReconnect: options.revalidateOnReconnect,
      refreshInterval: options.refreshInterval,
      dedupingInterval: options.dedupingInterval,
      isPaused: () => options.enabled === false,
      errorRetryCount,
      errorRetryInterval: options.retryDelay,
    };

    const { data, error, isLoading, isValidating, mutate } = this.useSWR(
      normalizedKey,
      swrFetcher,
      swrOptions
    );

    return {
      data,
      error,
      isLoading,
      isValidating,
      mutate,
    };
  }
}

export default SWRAdapter;
