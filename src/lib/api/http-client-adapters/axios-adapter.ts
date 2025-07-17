import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
} from "@/lib/types/api/http-client";
import axios from "axios";

interface AxiosInstance {
  get<T = unknown>(
    url: string,
    config?: unknown
  ): Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }>;
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: unknown
  ): Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }>;
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: unknown
  ): Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }>;
  delete<T = unknown>(
    url: string,
    config?: unknown
  ): Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }>;
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: unknown
  ): Promise<{
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  }>;
}

export class AxiosAdapter implements HttpClientAdapter {
  private readonly axiosInstance: AxiosInstance;

  constructor(config: HttpClientConfig = {}) {
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: config.headers || { "Content-Type": "application/json" },
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
      headers: response.headers,
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
      headers: response.headers,
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
      headers: response.headers,
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
      headers: response.headers,
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
      headers: response.headers,
    };
  }
}

export default AxiosAdapter;
