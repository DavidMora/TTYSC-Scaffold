import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
import { v6 as uuidv6 } from 'uuid';
import { parseSSEBlock } from '@/lib/api/stream/parse-sse';

export class FetchAdapter implements HttpClientAdapter {
  private readonly defaultConfig: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.defaultConfig = {
      timeout: 30000,
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
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
      const mergedHeaders: Record<string, string> = {
        ...this.defaultConfig.headers,
        ...config?.headers,
        ...(options.headers as Record<string, string>),
      };

      // Add request ID if not already provided
      if (!mergedHeaders['X-Request-Id']) {
        mergedHeaders['X-Request-Id'] = uuidv6();
      }

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

      const contentType = response.headers.get('content-type');

      let data: T;
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (
        contentType?.includes(
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ) ||
        contentType?.includes('application/vnd.ms-excel') ||
        contentType?.includes('text/csv')
      ) {
        data = (await response.blob()) as T;
      } else {
        data = (await response.text()) as T;
      }

      const responseHeaders: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        ok: response.ok,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { method: 'GET' }, config);
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'POST',
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
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  async delete<T = unknown>(
    url: string,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(url, { method: 'DELETE' }, config);
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: HttpClientConfig
  ): Promise<HttpClientResponse<T>> {
    return this.request<T>(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    );
  }

  private buildStreamRequestBody(
    body: unknown,
    method: string,
    headers: Record<string, string>
  ): BodyInit | undefined {
    if (body === undefined || method === 'GET' || method === 'HEAD') {
      return undefined;
    }

    const contentType = headers['Content-Type'] || headers['content-type'];

    if (body instanceof FormData || body instanceof Blob) {
      return body;
    }

    if (typeof body === 'string') {
      return body;
    }

    if (body instanceof Uint8Array) {
      return body as unknown as BodyInit;
    }

    if (body instanceof ArrayBuffer) {
      return body;
    }

    if (typeof body === 'object') {
      const isJsonLike = contentType?.includes('application/json');
      if (isJsonLike || !contentType) {
        try {
          return JSON.stringify(body);
        } catch {
          return undefined;
        }
      }
    }

    return undefined;
  }

  private setupStreamHeaders(
    config: HttpStreamConfig,
    headers: Record<string, string>
  ): void {
    // Ensure request id consistency with non-stream requests
    if (!headers['X-Request-Id']) {
      headers['X-Request-Id'] = uuidv6();
    }

    // Basic auth
    const authConfig = config.auth || this.defaultConfig.auth;
    if (authConfig && !headers.Authorization) {
      const credentials = btoa(`${authConfig.username}:${authConfig.password}`);
      headers.Authorization = `Basic ${credentials}`;
    }

    // Set appropriate Accept header
    if (!headers.Accept) {
      let accept = '*/*';
      if (config.parser === 'sse') accept = 'text/event-stream';
      else if (config.parser === 'json') accept = 'application/json';
      headers.Accept = accept;
    }
  }

  private createEmptyStream<TChunk>(
    controller: AbortController,
    response: Response,
    statusMeta: {
      status: number;
      statusText: string;
      headers: Record<string, string>;
      ok: boolean;
    }
  ): HttpStreamResponse<TChunk> {
    const empty: AsyncIterable<TChunk> = {
      [Symbol.asyncIterator]: () => ({
        next: async () => ({
          value: undefined as unknown as TChunk,
          done: true,
        }),
      }),
    };

    return Object.assign(empty, {
      cancel: () => controller.abort(),
      raw: response,
      ...statusMeta,
    }) as HttpStreamResponse<TChunk>;
  }

  private createStreamParser<TChunk>(
    parser: string,
    maxBufferSize: number,
    jsonParserTimeoutMs: number,
    controller: AbortController
  ) {
    let sseBuffer = '';
    let ndjsonBuffer = '';
    let ndjsonLineNumber = 0;
    let jsonBuffer = '';
    let jsonStartTime: number | null = null;
    let jsonTimeoutTriggered = false;

    const ensureSize = (name: string, size: number) => {
      if (size > maxBufferSize) {
        controller.abort();
        throw new Error(
          `${name} buffer exceeded maximum size of ${maxBufferSize} bytes`
        );
      }
    };

    return {
      processChunk: function* (
        chunkStr: string
      ): Generator<TChunk, void, unknown> {
        switch (parser) {
          case 'text':
            yield chunkStr as unknown as TChunk;
            break;
          case 'json':
            yield* this.handleJSON(chunkStr);
            break;
          case 'ndjson':
            yield* this.handleNDJSON(chunkStr);
            break;
          case 'sse':
            yield* this.handleSSE(chunkStr);
            break;
          default:
            yield chunkStr as unknown as TChunk;
        }
      },

      handleJSON: function* (chunkStr: string) {
        ensureSize('JSON', jsonBuffer.length + chunkStr.length);
        jsonBuffer += chunkStr;
        jsonStartTime ??= Date.now();

        if (jsonStartTime && Date.now() - jsonStartTime > jsonParserTimeoutMs) {
          jsonTimeoutTriggered = true;
          controller.abort();
          throw new Error(
            `JSON parser timeout after ${jsonParserTimeoutMs}ms (buffer length=${jsonBuffer.length})`
          );
        }

        try {
          const obj = JSON.parse(jsonBuffer) as TChunk;
          jsonBuffer = '';
          controller.abort();
          yield obj;
        } catch {
          // waiting for full JSON
        }
      },

      handleNDJSON: function* (chunkStr: string) {
        ensureSize('NDJSON', ndjsonBuffer.length + chunkStr.length);
        ndjsonBuffer += chunkStr;
        let newlineIndex = ndjsonBuffer.indexOf('\n');

        while (newlineIndex !== -1) {
          const line = ndjsonBuffer.slice(0, newlineIndex).trim();
          ndjsonBuffer = ndjsonBuffer.slice(newlineIndex + 1);

          if (line) {
            ndjsonLineNumber += 1;
            try {
              yield JSON.parse(line) as TChunk;
            } catch (e) {
              const snippet =
                line.length > 200 ? line.slice(0, 200) + '…' : line;
              throw new Error(
                `Failed to parse NDJSON line ${ndjsonLineNumber}: ${
                  e instanceof Error ? e.message : String(e)
                } | content: ${snippet}`
              );
            }
          }
          newlineIndex = ndjsonBuffer.indexOf('\n');
        }
      },

      handleSSE: function* (chunkStr: string) {
        ensureSize('SSE', sseBuffer.length + chunkStr.length);
        sseBuffer += chunkStr;

        while (true) {
          // Check for all possible SSE delimiters
          const nnIdx = sseBuffer.indexOf('\n\n');
          const rnrnIdx = sseBuffer.indexOf('\r\n\r\n');
          const rrIdx = sseBuffer.indexOf('\r\r');

          let eventEndIdx = -1;
          let delimiterLength = 0;

          // Find the earliest delimiter
          if (nnIdx !== -1) {
            eventEndIdx = nnIdx;
            delimiterLength = 2;
          }
          if (rnrnIdx !== -1 && (eventEndIdx === -1 || rnrnIdx < eventEndIdx)) {
            eventEndIdx = rnrnIdx;
            delimiterLength = 4;
          }
          if (rrIdx !== -1 && (eventEndIdx === -1 || rrIdx < eventEndIdx)) {
            eventEndIdx = rrIdx;
            delimiterLength = 2;
          }

          if (eventEndIdx === -1) break;

          const rawEvent = sseBuffer.slice(0, eventEndIdx);
          sseBuffer = sseBuffer.slice(eventEndIdx + delimiterLength);
          const evt = parseSSEBlock(rawEvent) as unknown as TChunk;
          yield evt;
        }
      },

      flushBuffers: function* () {
        if (parser === 'ndjson') {
          yield* this.flushNDJSONBuffer();
        } else if (parser === 'sse' && sseBuffer.length) {
          yield* this.flushSSEBuffer();
        }
      },

      flushNDJSONBuffer: function* () {
        const trimmed = ndjsonBuffer.trim();
        if (!trimmed) return;

        try {
          yield JSON.parse(trimmed) as TChunk;
        } catch (e) {
          this.throwFlushError('NDJSON', trimmed, e);
        }
      },

      flushSSEBuffer: function* () {
        try {
          const evt = parseSSEBlock(sseBuffer) as unknown as TChunk;
          yield evt;
        } catch (e) {
          this.throwFlushError('SSE', sseBuffer, e);
        }
      },

      throwFlushError: function (
        type: string,
        content: string,
        error: unknown
      ) {
        const snippet =
          content.slice(0, 200) + (content.length > 200 ? '…' : '');
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to parse leftover ${type} ${type === 'NDJSON' ? 'on stream end' : 'block on stream end'}: ${errorMessage} | content: ${snippet}`
        );
      },

      cleanup: () => {
        if (jsonTimeoutTriggered) {
          jsonBuffer = '';
        }
      },
    };
  }

  async stream<TChunk = unknown>(
    url: string,
    config?: HttpStreamConfig
  ): Promise<HttpStreamResponse<TChunk>> {
    const mergedConfig: HttpStreamConfig = { ...this.defaultConfig, ...config };
    const fullUrl = mergedConfig.baseURL
      ? new URL(url, mergedConfig.baseURL).toString()
      : url;

    const controller = new AbortController();
    const externalSignal = mergedConfig.signal;
    let abortListener: (() => void) | undefined;

    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else {
        abortListener = () => controller.abort();
        externalSignal.addEventListener('abort', abortListener);
      }
    }

    const headers: Record<string, string> = {
      ...this.defaultConfig.headers,
      ...mergedConfig.headers,
    } as Record<string, string>;

    this.setupStreamHeaders(mergedConfig, headers);

    const method = (mergedConfig.method || 'GET').toUpperCase();
    const body = this.buildStreamRequestBody(
      mergedConfig.body,
      method,
      headers
    );

    const timeoutMs = mergedConfig.timeout ?? this.defaultConfig.timeout;
    const timeoutId = timeoutMs
      ? setTimeout(() => controller.abort(), timeoutMs)
      : undefined;

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method,
        headers,
        body,
        signal: controller.signal,
      });
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId);
      throw e;
    }

    let safeHeaders: Record<string, string> = {};
    try {
      const rh = (response as unknown as { headers?: unknown }).headers as
        | Headers
        | undefined;
      if (rh && typeof rh.entries === 'function') {
        safeHeaders = Object.fromEntries(rh.entries());
      }
    } catch {
      // ignore and keep empty headers map
    }

    const statusMeta = {
      status: response.status,
      statusText: response.statusText,
      headers: safeHeaders,
      ok: response.ok,
    };

    if (!response.body) {
      return this.createEmptyStream<TChunk>(controller, response, statusMeta);
    }

    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    const parser = mergedConfig.parser || 'text';
    const jsonParserTimeoutMs = mergedConfig.jsonParserTimeoutMs ?? 15000;
    const maxBufferSize = mergedConfig.maxBufferSize ?? 10 * 1024 * 1024;

    const streamParser = this.createStreamParser<TChunk>(
      parser,
      maxBufferSize,
      jsonParserTimeoutMs,
      controller
    );

    async function* chunkGenerator(): AsyncGenerator<TChunk, void, unknown> {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          if (parser === 'bytes') {
            yield value as unknown as TChunk;
          } else {
            const str = textDecoder.decode(value, { stream: true });
            yield* streamParser.processChunk(str);
          }
        }
      } catch (err) {
        controller.abort();
        throw err;
      } finally {
        try {
          yield* streamParser.flushBuffers();
        } catch {
          // ignore flush errors
        }

        streamParser.cleanup();

        try {
          reader.releaseLock();
        } catch {
          // ignore
        }

        if (externalSignal && abortListener) {
          externalSignal.removeEventListener('abort', abortListener);
        }

        if (timeoutId) clearTimeout(timeoutId);
      }
    }

    const asyncIterable: AsyncIterable<TChunk> = {
      [Symbol.asyncIterator]: () => chunkGenerator(),
    };

    return Object.assign(asyncIterable, {
      cancel: () => controller.abort(),
      raw: response,
      ...statusMeta,
    }) as HttpStreamResponse<TChunk>;
  }
}

export default FetchAdapter;
