import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../types/api/data-fetcher";
import { HttpClientResponse } from "../types/api/http-client";
import MockAdapter from "./data-fetcher-adapters/mock-adapter";

class DataFetcher {
  private readonly adapter: DataFetcherAdapter;

  constructor(adapter?: DataFetcherAdapter) {
    this.adapter = adapter || new MockAdapter();
  }

  fetchData<T = unknown>(
    key: string,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options?: DataFetcherOptions
  ): DataFetcherResponse<T> {
    return this.adapter.fetchData(key, fetcher, options);
  }
}

// Default instance using MockAdapter
const dataFetcher = new DataFetcher();

export default dataFetcher;
export { DataFetcher };
export type { DataFetcherAdapter, DataFetcherResponse, DataFetcherOptions };
