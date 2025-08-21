export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: {
    username: string;
    password: string;
  };
}

// Parsing strategies for streamed responses
export type HttpStreamParser =
  | 'text' // raw decoded text chunks
  | 'json' // single JSON object (will buffer until complete)
  | 'ndjson' // newline-delimited JSON, yields object per line
  | 'sse' // text/event-stream (Server Sent Events)
  | 'bytes'; // yields Uint8Array chunks

export interface HttpStreamConfig extends HttpClientConfig {
  /** Optional HTTP method for the streaming request. Default: GET */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Optional request body (for POST/PUT/PATCH). Will be JSON.stringified when an object and Content-Type is application/json (default). */
  body?: unknown;
  parser?: HttpStreamParser;
  // Optional AbortSignal to externally cancel the stream
  signal?: AbortSignal;
  // Maximum accumulated buffer size in bytes for buffered parsers (json, ndjson, sse). Default 10MB.
  maxBufferSize?: number;
  // Maximum time (ms) to wait for a complete JSON object when parser="json" before timing out. Default 15000ms.
  jsonParserTimeoutMs?: number;
}

export interface HttpSSEEvent<TData = string> {
  id?: string;
  event?: string;
  retry?: number;
  data: TData; // Raw data string or already parsed (if parser="json")
}

export interface HttpStreamBaseMeta {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
}

// Generic streaming response wrapper. AsyncIterable yields depends on parser.
export interface HttpStreamResponse<TChunk = unknown>
  extends HttpStreamBaseMeta,
    AsyncIterable<TChunk> {
  // Cancel underlying stream (AbortController.abort())
  cancel: () => void;
  // Access to low-level underlying response object if available (fetch Response, axios response, etc.)
  raw?: unknown;
}

export interface HttpClientResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  ok: boolean;
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
  // Streaming endpoint (e.g., SSE, NDJSON, chunked text). Default parser is "text".
  stream?<TChunk = unknown>(
    url: string,
    config?: HttpStreamConfig
  ): Promise<HttpStreamResponse<TChunk>>;
}
