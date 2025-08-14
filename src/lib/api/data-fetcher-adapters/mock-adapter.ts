import { HttpClientResponse } from '@/lib/types/api/http-client';
import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
} from '@/lib/types/api/data-fetcher';

/**
 * MockAdapter provides a simple implementation of DataFetcherAdapter
 * for testing and development purposes when other adapters are not available.
 */
export class MockAdapter implements DataFetcherAdapter {
  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options: DataFetcherOptions = {}
  ): DataFetcherResponse<T> {
    // Simple mock implementation that returns loading state
    // This is not a real data fetching solution but allows tests to run
    // Parameters are intentionally unused but kept for interface compliance
    console.debug(
      'MockAdapter.fetchData called with key:',
      key,
      'options:',
      options
    );

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
