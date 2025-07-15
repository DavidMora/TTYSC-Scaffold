import { HttpClientResponse } from "../../types/api/http-client";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../data-fetcher";

/**
 * MockAdapter provides a simple implementation of DataFetcherAdapter
 * for testing and development purposes when other adapters are not available.
 */
export class MockAdapter implements DataFetcherAdapter {
  fetchData<T = unknown>(
    key: string,
    fetcher: () => Promise<HttpClientResponse<T>>,
    _options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Simple mock implementation that returns loading state
    // This is not a real data fetching solution but allows tests to run
    // Note: key, fetcher, and _options are unused in this mock implementation
    return {
      data: undefined,
      error: undefined,
      isLoading: true,
      isValidating: false,
      mutate: () => {},
    };
  }
}

export default MockAdapter;
