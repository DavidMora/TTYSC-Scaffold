import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
import FetchAdapter from '@/lib/api/http-client-adapters/fetch-adapter';

class HttpClient {
  private readonly adapter: HttpClientAdapter;

  constructor(adapter?: HttpClientAdapter, config?: HttpClientConfig) {
    this.adapter = adapter || new FetchAdapter(config);
  }

  async get<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.adapter.get<T>(url, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.adapter.post<T>(url, data, config);
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.adapter.put<T>(url, data, config);
  }

  async delete<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.adapter.delete<T>(url, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.adapter.patch<T>(url, data, config);
  }

  async stream<TChunk = unknown>(
    url: string,
    config?: HttpStreamConfig
  ): Promise<HttpStreamResponse<TChunk>> {
    /**
     * Stream data from an endpoint using the underlying adapter implementation.
     * Supported parsers (see HttpStreamParser):
     *  - text (default): yields decoded text chunks
     *  - json: buffers until a single JSON value can be parsed, then aborts
     *  - ndjson: emits each JSON object per newline (skips empty lines)
     *  - sse: parses Server-Sent Event blocks (id, event, data, retry)
     *  - bytes: yields raw Uint8Array / Buffer chunks
     * Provide an AbortSignal in config.signal to cancel externally or call response.cancel().
     */
    if (!this.adapter.stream) {
      throw new Error('Streaming not supported by current adapter');
    }
    return this.adapter.stream<TChunk>(url, config);
  }
}

// Default instance using FetchAdapter
const httpClient = new HttpClient();

// Only create auth config if credentials exist
const authConfig =
  process.env.NEXT_PUBLIC_API_USERNAME && process.env.NEXT_PUBLIC_API_PASSWORD
    ? {
        username: process.env.NEXT_PUBLIC_API_USERNAME,
        password: process.env.NEXT_PUBLIC_API_PASSWORD,
      }
    : undefined;

// Main API client with Basic Authentication (direct backend access - prefer BFF endpoints in UI code)
const apiClient = new HttpClient(undefined, {
  // Base URL points to frontend origin (BFF layer). In the browser a relative
  // request would work without this, but on the server (SSR / route handlers)
  // having an absolute URL avoids ambiguity.
  baseURL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  auth: authConfig,
});

// Alternative instance using AxiosAdapter (commented out)
// const httpClient = new HttpClient(new AxiosAdapter());

export default httpClient;
export { HttpClient, apiClient };
export type {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
};
