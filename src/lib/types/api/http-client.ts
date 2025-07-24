export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: {
    username: string;
    password: string;
  };
}

export interface HttpClientResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface HttpClientAdapter {
  get<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
  delete<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>>;
}
