import httpClient from '@/lib/api/http-client';
import { resolveBackend } from './backend-resolver';
import { buildAuthHeaders } from './backend-auth';
import {
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';

export type BackendRequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface BaseOptions<TBody> {
  method: BackendRequestMethod;
  path: string; // path WITHOUT baseURL (leading slash)
  body?: TBody;
  headers?: Record<string, string>;
  timeout?: number;
}

interface StreamOptions<TBody> extends BaseOptions<TBody> {
  stream: true;
  parser?: HttpStreamConfig['parser'];
  signal?: AbortSignal;
}

interface NonStreamOptions<TBody> extends BaseOptions<TBody> {
  stream?: false;
}

export async function backendRequest<T = unknown, TBody = unknown>(
  options: StreamOptions<TBody>
): Promise<HttpStreamResponse<T>>;
export async function backendRequest<T = unknown, TBody = unknown>(
  options: NonStreamOptions<TBody>
): Promise<HttpClientResponse<T>>;
export async function backendRequest<T = unknown, TBody = unknown>(
  options: StreamOptions<TBody> | NonStreamOptions<TBody>
): Promise<HttpClientResponse<T> | HttpStreamResponse<T>> {
  const { path, method, body, headers = {}, timeout } = options;
  const backend = resolveBackend(path);
  const { headers: authHeaders } = await buildAuthHeaders({ backend });

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...headers,
  };

  const baseConfig = {
    baseURL: backend.baseURL,
    timeout,
    headers: finalHeaders,
  } as const;

  if ('stream' in options && options.stream) {
    return httpClient.stream<T>(path, {
      ...baseConfig,
      method,
      body,
      parser: options.parser || 'text',
      signal: options.signal,
    });
  }

  switch (method) {
    case 'GET':
      return httpClient.get<T>(path, baseConfig);
    case 'POST':
      return httpClient.post<T>(path, body, baseConfig);
    case 'PUT':
      return httpClient.put<T>(path, body, baseConfig);
    case 'PATCH':
      return httpClient.patch<T>(path, body, baseConfig);
    case 'DELETE':
      return httpClient.delete<T>(path, baseConfig);
    default:
      throw new Error(`Unsupported method ${method}`);
  }
}
