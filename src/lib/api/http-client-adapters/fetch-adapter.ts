import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
} from "@/lib/types/api/http-client";

export class FetchAdapter implements HttpClientAdapter {
  private readonly defaultConfig: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.defaultConfig = {
      timeout: 30000,
      baseURL: config.baseURL,
      headers: {
        "Content-Type": "application/json",
        ...config.headers,
      },
      auth: config.auth,
    };
  }

  private async request<T>(
    url: string,
    options: RequestInit = {},
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const mergedConfig = { ...this.defaultConfig, ...config };
    const fullUrl = mergedConfig.baseURL
      ? new URL(url, mergedConfig.baseURL).toString()
      : url;

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      mergedConfig.timeout
    );

    try {
      // Merge headers properly
      const mergedHeaders = {
        ...this.defaultConfig.headers,
        ...config?.headers,
        ...(options.headers as Record<string, string>),
      };

      // Add Basic Authentication if configured
      const authConfig = config?.auth || this.defaultConfig.auth;
      if (authConfig) {
        const credentials = btoa(
          `${authConfig.username}:${authConfig.password}`
        );
        mergedHeaders.Authorization = `Basic ${credentials}`;
      }

      const response = await fetch(fullUrl, {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");

      const data = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      const responseHeaders: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  }

  async get<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { method: "GET" }, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(
      url,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(
      url,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async delete<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { method: "DELETE" }, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(
      url,
      {
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }
}

export default FetchAdapter;
