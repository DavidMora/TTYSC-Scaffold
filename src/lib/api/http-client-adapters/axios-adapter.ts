import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
import axios, { AxiosInstance } from 'axios';
import { sseParser } from '@/lib/api/stream/parse-sse';

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

  async stream<TChunk = unknown>(
    url: string,
    config?: HttpStreamConfig
  ): Promise<HttpStreamResponse<TChunk>> {
    // Axios only supports streaming (response.data as a stream) in Node.js
    const isBrowser = typeof window !== 'undefined';
    if (isBrowser) {
      throw new Error(
        'Axios streaming not supported in browser; use FetchAdapter'
      );
    }

    const parser = config?.parser || 'text';
    const controller = new AbortController();
    const externalSignal = config?.signal;
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort();
      else externalSignal.addEventListener('abort', () => controller.abort());
    }

    const maxBufferSize = config?.maxBufferSize ?? 10 * 1024 * 1024; // 10MB default
    const ensureSize = (name: string, size: number) => {
      if (size > maxBufferSize) {
        controller.abort();
        throw new Error(
          `${name} buffer exceeded maximum size of ${maxBufferSize} bytes`
        );
      }
    };

    const headers = this.buildStreamHeaders(config, parser);
    const data = this.buildRequestData(config, headers);

    const response = await this.axiosInstance.request({
      url,
      method: (config?.method || 'GET').toUpperCase(),
      data,
      responseType: 'stream',
      signal: controller.signal,
      headers,
    });

    const nodeStream = response.data as unknown as NodeJS.ReadableStream;

    const statusMeta = {
      status: response.status,
      statusText: response.statusText,
      headers: this.normalizeHeaders(response.headers),
      ok: response.status >= 200 && response.status < 300,
    };

    const asyncIterable: AsyncIterable<TChunk> = {
      [Symbol.asyncIterator]: () =>
        this.createStreamIterator<TChunk>(
          nodeStream,
          parser,
          ensureSize,
          controller
        ),
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

  private buildStreamHeaders(
    config?: HttpStreamConfig,
    parser?: string
  ): Record<string, string> {
    const headers: Record<string, string> = { ...(config?.headers || {}) };
    if (!headers.Accept) {
      let accept = '*/*';
      if (parser === 'sse') accept = 'text/event-stream';
      else if (parser === 'json') accept = 'application/json';
      headers.Accept = accept;
    }
    return headers;
  }

  private buildRequestData(
    config?: HttpStreamConfig,
    headers?: Record<string, string>
  ): unknown {
    const method = (config?.method || 'GET').toUpperCase();
    if (config?.body === undefined || method === 'GET' || method === 'HEAD') {
      return undefined;
    }

    const ct = headers?.['Content-Type'] || headers?.['content-type'];
    const raw = config.body;
    if (raw instanceof Buffer || raw instanceof ArrayBuffer) return raw;
    if (typeof raw === 'string') return raw;
    if (ct?.includes('application/json')) {
      return JSON.stringify(raw);
    }

    // For other content types or when it's not specified,
    // return the raw object and let Axios handle serialization.
    return raw;
  }

  private createStreamIterator<TChunk>(
    nodeStream: NodeJS.ReadableStream,
    parser: string,
    ensureSize: (name: string, size: number) => void,
    controller: AbortController
  ): AsyncIterator<TChunk> {
    const reader = nodeStream[Symbol.asyncIterator]() as AsyncIterator<Buffer>;
    const buffers = { json: '', ndjson: '', sse: '' };
    let jsonParsed = false;
    const resultQueue: IteratorResult<TChunk>[] = [];

    const emitDone = (): IteratorResult<TChunk> => {
      if (parser === 'ndjson' && buffers.ndjson.trim()) {
        const line = buffers.ndjson.trim();
        buffers.ndjson = '';
        return { value: JSON.parse(line) as TChunk, done: false };
      }
      if (parser === 'sse' && buffers.sse) {
        const evt = sseParser.parseSSEBlock(buffers.sse) as unknown as TChunk;
        buffers.sse = '';
        return { value: evt, done: false };
      }
      return { value: undefined as unknown as TChunk, done: true };
    };

    const parseBytes = (
      chunk: Buffer
    ): IteratorResult<TChunk> | IteratorResult<TChunk>[] | undefined => {
      if (parser === 'bytes')
        return { value: chunk as unknown as TChunk, done: false };

      const txt = chunk.toString('utf8');
      if (parser === 'text')
        return { value: txt as unknown as TChunk, done: false };
      if (parser === 'json')
        return this.parseJsonChunk(txt, buffers, ensureSize, controller, () => {
          jsonParsed = true;
        });
      if (parser === 'ndjson')
        return this.parseNdjsonChunk(txt, buffers, ensureSize);
      if (parser === 'sse') return this.parseSseChunk(txt, buffers, ensureSize);

      return { value: txt as unknown as TChunk, done: false };
    };

    return {
      async next(): Promise<IteratorResult<TChunk>> {
        // Return queued results first
        if (resultQueue.length > 0) {
          return resultQueue.shift()!;
        }

        if (jsonParsed) {
          return { value: undefined as unknown as TChunk, done: true };
        }

        while (true) {
          const { value, done } = await reader.next();
          if (done) return emitDone();
          const parsed = parseBytes(value);
          if (parsed) {
            // If it's an array (from NDJSON), add all but first to queue
            if (Array.isArray(parsed)) {
              if (parsed.length === 0) continue;
              const [first, ...rest] = parsed;
              resultQueue.push(...rest);
              return first;
            }
            return parsed;
          }
        }
      },
    };
  }

  private parseJsonChunk<TChunk>(
    txt: string,
    buffers: { json: string; ndjson: string; sse: string },
    ensureSize: (name: string, size: number) => void,
    controller: AbortController,
    onParsed: () => void
  ): IteratorResult<TChunk> | undefined {
    ensureSize('JSON', buffers.json.length + txt.length);
    buffers.json += txt;
    try {
      const obj = JSON.parse(buffers.json) as TChunk;
      onParsed();
      controller.abort();
      return { value: obj, done: false };
    } catch {
      return undefined;
    }
  }

  private parseNdjsonChunk<TChunk>(
    txt: string,
    buffers: { json: string; ndjson: string; sse: string },
    ensureSize: (name: string, size: number) => void
  ): IteratorResult<TChunk>[] {
    ensureSize('NDJSON', buffers.ndjson.length + txt.length);
    buffers.ndjson += txt;
    const results: IteratorResult<TChunk>[] = [];
    const lines = buffers.ndjson.split('\n');
    buffers.ndjson = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        results.push({ value: JSON.parse(trimmed) as TChunk, done: false });
      }
    }
    return results;
  }

  private parseSseChunk<TChunk>(
    txt: string,
    buffers: { json: string; ndjson: string; sse: string },
    ensureSize: (name: string, size: number) => void
  ): IteratorResult<TChunk> | undefined {
    ensureSize('SSE', buffers.sse.length + txt.length);
    buffers.sse += txt;

    // Check for all possible SSE delimiters
    const nnIdx = buffers.sse.indexOf('\n\n');
    const rnrnIdx = buffers.sse.indexOf('\r\n\r\n');
    const rrIdx = buffers.sse.indexOf('\r\r');

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

    if (eventEndIdx !== -1) {
      const raw = buffers.sse.slice(0, eventEndIdx);
      buffers.sse = buffers.sse.slice(eventEndIdx + delimiterLength);
      const evt = sseParser.parseSSEBlock(raw) as unknown as TChunk;
      return { value: evt, done: false };
    }
    return undefined;
  }
}

export default AxiosAdapter;
