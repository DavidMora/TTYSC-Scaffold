import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
} from "@/lib/types/api/data-fetcher";
import { HttpClientResponse } from "../types/api/http-client";
import MockAdapter from "./data-fetcher-adapters/mock-adapter";
import SWRAdapter from "./data-fetcher-adapters/swr-adapter";

class DataFetcher {
  private readonly adapter: DataFetcherAdapter;

  constructor(adapter?: DataFetcherAdapter) {
    this.adapter = adapter || new MockAdapter();
  }

  fetchData<T = unknown>(
    key: DataFetcherKey,
    fetcher: () => Promise<HttpClientResponse<T>>,
    options?: DataFetcherOptions
  ): DataFetcherResponse<T> {
    return this.adapter.fetchData(key, fetcher, options);
  }
}

// Default instance using SWRAdapter
const dataFetcher = new DataFetcher(new SWRAdapter());

export default dataFetcher;
export { DataFetcher };
export type {
  DataFetcherAdapter,
  DataFetcherResponse,
  DataFetcherOptions,
  DataFetcherKey,
};
