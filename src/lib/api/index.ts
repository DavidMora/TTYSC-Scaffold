// Main exports
export {
  default as httpClient,
  HttpClient,
  apiClient,
} from '@/lib/api/http-client';
export { default as dataFetcher, DataFetcher } from '@/lib/api/data-fetcher';

// HTTP Client Adapters
export { default as FetchAdapter } from '@/lib/api/http-client-adapters/fetch-adapter';
export { default as AxiosAdapter } from '@/lib/api/http-client-adapters/axios-adapter';

// Data Fetcher Adapters
export { default as MockAdapter } from '@/lib/api/data-fetcher-adapters/mock-adapter';
export { default as SWRAdapter } from '@/lib/api/data-fetcher-adapters/swr-adapter';
export { default as TanStackQueryAdapter } from '@/lib/api/data-fetcher-adapters/tanstack-query-adapter';

// Types
export type {
  DataFetcherKey,
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from '@/lib/api/data-fetcher';
export type {
  HttpClientConfig,
  HttpClientResponse,
  HttpClientAdapter,
} from '@/lib/types/api/http-client';
