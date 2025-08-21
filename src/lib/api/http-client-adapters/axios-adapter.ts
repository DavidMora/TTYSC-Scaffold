import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
} from '@/lib/types/api/http-client';
import axios, { AxiosInstance } from 'axios';

export class AxiosAdapter implements HttpClientAdapter {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: HttpClientConfig = {}) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: config.headers || { 'Content-Type': 'application/json' },
    });
  }

  async get<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: this.isStatusOk(response.status),
    };
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: this.isStatusOk(response.status),
    };
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: this.isStatusOk(response.status),
    };
  }

  async delete<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: this.isStatusOk(response.status),
    };
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: this.isStatusOk(response.status),
    };
  }

  private isStatusOk(status: number): boolean {
    return status >= 200 && status < 300;
  }

  private normalizeHeaders(
    headers: Record<string, unknown>
  ): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (value !== undefined && value !== null) {
        normalized[key] =
          typeof value === 'string' ? value : JSON.stringify(value);
      }
    }
    return normalized;
  }
}

export default AxiosAdapter;
