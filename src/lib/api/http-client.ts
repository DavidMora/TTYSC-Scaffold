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

// Only create auth config if credentials exist
const authConfig =
  process.env.NEXT_PUBLIC_API_USERNAME && process.env.NEXT_PUBLIC_API_PASSWORD
    ? {
        username: process.env.NEXT_PUBLIC_API_USERNAME,
        password: process.env.NEXT_PUBLIC_API_PASSWORD,
      }
    : undefined;

// Main API client with Basic Authentication
const apiClient = new HttpClient(undefined, {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  auth: authConfig,
});

// Alternative instance using AxiosAdapter (commented out)
// const httpClient = new HttpClient(new AxiosAdapter());

export default httpClient;
export { HttpClient, apiClient };
export type { HttpClientAdapter, HttpClientConfig, HttpClientResponse };
