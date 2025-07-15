import { HttpClientResponse } from "../../types/api/http-client";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../data-fetcher";

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
  key: string,
  fetcher: () => Promise<T>,
  options?: unknown
) => SWRResponse<T>;

export class SWRAdapter implements DataFetcherAdapter {
  private readonly useSWR: SWRHook | null;

  constructor() {
    // This would be the actual implementation with SWR:
    // import useSWR from 'swr';
    // this.useSWR = useSWR;

    // For now, setting to null since SWR is not installed
    this.useSWR = null;
  }

  fetchData<T = unknown>(
    key: string,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Check if SWR is available
    if (!this.useSWR) {
      throw new Error(
        "SWRAdapter requires SWR to be installed. Run: yarn add swr"
      );
    }

    // Transform the fetcher to extract data from HttpClientResponse
    const swrFetcher = async () => {
      const response = await fetcher();
      return response.data;
    };

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
      key,
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
