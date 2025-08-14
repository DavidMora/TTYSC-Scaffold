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
    // Keep a reference so we can remove it later
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

    // Always request streaming where relevant
    if (!headers.Accept) {
      let accept = '*/*';
      if (mergedConfig.parser === 'sse') accept = 'text/event-stream';
      else if (mergedConfig.parser === 'json') accept = 'application/json';
      headers.Accept = accept;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    const statusMeta = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      ok: response.ok,
    };

    if (!response.body) {
      throw new Error('ReadableStream not supported in this environment');
    }

    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    const parser = mergedConfig.parser || 'text';
    const jsonParserTimeoutMs = mergedConfig.jsonParserTimeoutMs ?? 15000;
    const maxBufferSize = mergedConfig.maxBufferSize ?? 10 * 1024 * 1024; // 10MB default
    const ensureSize = (name: string, size: number) => {
      if (size > maxBufferSize) {
        controller.abort();
        throw new Error(
          `${name} buffer exceeded maximum size of ${maxBufferSize} bytes`
        );
      }
    };

    // SSE specific buffering
    let sseBuffer = '';
    let ndjsonBuffer = '';
    let ndjsonLineNumber = 0; // for diagnostic errors
    let jsonBuffer = '';

    const flushLeftoverNDJSON = function* () {
      const trimmed = ndjsonBuffer.trim();
      if (!trimmed) return;
      ndjsonBuffer = '';
      try {
        yield JSON.parse(trimmed) as TChunk;
      } catch (e) {
        const snippet =
          trimmed.slice(0, 200) + (trimmed.length > 200 ? '…' : '');
        throw new Error(
          `Failed to parse leftover NDJSON on stream end: ${
            e instanceof Error ? e.message : String(e)
          } | content: ${snippet}`
        );
      }
    };

    const flushLeftoverSSE = function* () {
      if (!sseBuffer.length) return;
      const raw = sseBuffer;
      sseBuffer = '';
      try {
        const evt = parseSSEBlock(raw) as unknown as TChunk;
        yield evt;
      } catch (e) {
        const snippet = raw.slice(0, 200) + (raw.length > 200 ? '…' : '');
        throw new Error(
          `Failed to parse leftover SSE block on stream end: ${
            e instanceof Error ? e.message : String(e)
          } | content: ${snippet}`
        );
      }
    };

    const handleDone = async function* (): AsyncGenerator<
      TChunk,
      void,
      unknown
    > {
      if (parser === 'ndjson') {
        for (const v of flushLeftoverNDJSON()) yield v;
        return;
      }
      if (parser === 'sse') {
        for (const v of flushLeftoverSSE()) yield v;
      }
    };

    const processBytes = function* (
      value: Uint8Array
    ): Generator<TChunk, void, unknown> {
      if (parser === 'bytes') {
        yield value as unknown as TChunk;
      }
    };

    const handleText = function* (chunkStr: string) {
      yield chunkStr as unknown as TChunk;
    };

    let jsonStartTime: number | null = null;
    let jsonTimeoutTriggered = false;
    const handleJSON = function* (chunkStr: string) {
      ensureSize('JSON', jsonBuffer.length + chunkStr.length);
      jsonBuffer += chunkStr;
      jsonStartTime ??= Date.now();
      // Timeout check
      if (jsonStartTime && Date.now() - jsonStartTime > jsonParserTimeoutMs) {
        jsonTimeoutTriggered = true;
        controller.abort();
        throw new Error(
          `JSON stream parse timeout after ${jsonParserTimeoutMs}ms (buffer length=${jsonBuffer.length})`
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
    };

    const handleNDJSON = function* (chunkStr: string) {
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
            const snippet = line.length > 200 ? line.slice(0, 200) + '…' : line;
            throw new Error(
              `Failed to parse NDJSON line ${ndjsonLineNumber}: ${
                e instanceof Error ? e.message : String(e)
              } | content: ${snippet}`
            );
          }
        }
        newlineIndex = ndjsonBuffer.indexOf('\n');
      }
    };

    const handleSSE = function* (chunkStr: string) {
      ensureSize('SSE', sseBuffer.length + chunkStr.length);
      sseBuffer += chunkStr;
      let eventEndIdx = sseBuffer.indexOf('\n\n');
      while (eventEndIdx !== -1) {
        const rawEvent = sseBuffer.slice(0, eventEndIdx);
        sseBuffer = sseBuffer.slice(eventEndIdx + 2);
        const evt = parseSSEBlock(rawEvent) as unknown as TChunk;
        yield evt;
        eventEndIdx = sseBuffer.indexOf('\n\n');
      }
    };

    const processTextParsers = function* (
      chunkStr: string
    ): Generator<TChunk, void, unknown> {
      switch (parser) {
        case 'text':
          return yield* handleText(chunkStr);
        case 'json':
          return yield* handleJSON(chunkStr);
        case 'ndjson':
          return yield* handleNDJSON(chunkStr);
        case 'sse':
          return yield* handleSSE(chunkStr);
        default:
          return yield* handleText(chunkStr); // fallback
      }
    };

    async function* chunkGenerator(): AsyncGenerator<TChunk, void, unknown> {
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;
          // Decide which parser to use and yield any resulting chunks
          const iterable: Iterable<TChunk> = ((): Iterable<TChunk> => {
            if (parser === 'bytes')
              return processBytes(value) as unknown as Iterable<TChunk>;
            const str = textDecoder.decode(value, { stream: true });
            return processTextParsers(str) as unknown as Iterable<TChunk>;
          })();
          for (const v of iterable) yield v;
        }
      } catch (err) {
        controller.abort();
        throw err;
      } finally {
        try {
          for await (const v of handleDone()) yield v;
        } catch {
          // ignore flush errors
        }
        // Clear JSON state to help GC if timeout triggered
        if (jsonTimeoutTriggered) {
          jsonBuffer = '';
        }
        try {
          reader.releaseLock();
        } catch {
          // ignore
        }
        if (externalSignal && abortListener) {
          externalSignal.removeEventListener('abort', abortListener);
        }
      }
    }

    const asyncIterable: AsyncIterable<TChunk> = {
      [Symbol.asyncIterator]: () => chunkGenerator(),
    };

    const streamResponse: HttpStreamResponse<TChunk> = Object.assign(
      asyncIterable,
      {
        cancel: () => controller.abort(),
        raw: response,
        ...statusMeta,
      }
    );

    return streamResponse;
  }
}

export default FetchAdapter;
