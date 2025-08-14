import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
  MutationAdapter,
  MutationOptions,
  MutationResponse,
} from '@/lib/types/api/data-fetcher';
import { HttpClientResponse } from '../types/api/http-client';
import SWRAdapter from './data-fetcher-adapters/swr-adapter';
import SWRMutationAdapter from './data-fetcher-adapters/swr-mutation-adapter';

class DataFetcher {
  private readonly adapter: DataFetcherAdapter;
  private readonly mutationAdapter: MutationAdapter;

  constructor(adapter?: DataFetcherAdapter, mutationAdapter?: MutationAdapter) {
    this.adapter = adapter || new SWRAdapter();
    this.mutationAdapter = mutationAdapter || new SWRMutationAdapter();
  }

  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options?: DataFetcherOptions
  ): DataFetcherResponse<T> {
    return this.adapter.fetchData(key, fetcher, options);
  }

  mutateData<TData = unknown, TVariables = unknown>(
    mutationKey: unknown[],
    mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    options?: MutationOptions<TData, TVariables>
  ): MutationResponse<TData, TVariables> {
    return this.mutationAdapter.mutateData(mutationKey, mutationFn, options);
  }
}

// Default instance using SWR adapters
const dataFetcher = new DataFetcher(new SWRAdapter(), new SWRMutationAdapter());

export default dataFetcher;
export { DataFetcher };
export type {
  DataFetcherAdapter,
  DataFetcherResponse,
  DataFetcherOptions,
  DataFetcherKey,
  MutationAdapter,
  MutationResponse,
  MutationOptions,
};
