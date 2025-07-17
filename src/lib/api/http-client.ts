import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
} from "@/lib/types/api/http-client";
import FetchAdapter from "@/lib/api/http-client-adapters/fetch-adapter";

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
}

// Default instance using FetchAdapter
const httpClient = new HttpClient();

// Alternative instance using AxiosAdapter (commented out)
// const httpClient = new HttpClient(new AxiosAdapter());

export default httpClient;
export { HttpClient };
export type { HttpClientAdapter, HttpClientConfig, HttpClientResponse };
