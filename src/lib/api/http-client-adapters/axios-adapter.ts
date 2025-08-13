import {
  HttpClientAdapter,
  HttpClientConfig,
  HttpClientResponse,
  HttpStreamConfig,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';
import axios, { AxiosInstance } from 'axios';
import { parseSSEBlock } from '@/lib/api/stream/parse-sse';

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

    // Derive headers incl. Accept similar to FetchAdapter for consistency
    const headers: Record<string, string> = { ...(config?.headers || {}) };
    if (!headers.Accept) {
      let accept = '*/*';
      if (parser === 'sse') accept = 'text/event-stream';
      else if (parser === 'json') accept = 'application/json';
      headers.Accept = accept;
    }

    const response = await this.axiosInstance.get(url, {
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

    // We'll convert Node.js stream into async iterator
    const asyncIterable: AsyncIterable<TChunk> = {
      [Symbol.asyncIterator]: () => {
        const reader = nodeStream[
          Symbol.asyncIterator
        ]() as AsyncIterator<Buffer>;
        let jsonBuf = '';
        let ndjsonBuf = '';
        let sseBuf = '';

        const emitDone = (): IteratorResult<TChunk> => {
          if (parser === 'ndjson' && ndjsonBuf.trim()) {
            const line = ndjsonBuf.trim();
            ndjsonBuf = '';
            return { value: JSON.parse(line) as TChunk, done: false };
          }
          if (parser === 'sse' && sseBuf) {
            const evt = parseSSEBlock(sseBuf) as unknown as TChunk;
            sseBuf = '';
            return { value: evt, done: false };
          }
          return { value: undefined as unknown as TChunk, done: true };
        };

        const parseChunk = (
          chunk: Buffer
        ): IteratorResult<TChunk> | undefined => {
          if (parser === 'bytes')
            return { value: chunk as unknown as TChunk, done: false };
          const txt = chunk.toString('utf8');
          if (parser === 'text')
            return { value: txt as unknown as TChunk, done: false };
          if (parser === 'json') {
            ensureSize('JSON', jsonBuf.length + txt.length);
            jsonBuf += txt;
            try {
              const obj = JSON.parse(jsonBuf) as TChunk;
              jsonBuf = '';
              controller.abort();
              return { value: obj, done: false };
            } catch {
              return undefined; // need more
            }
          }
          if (parser === 'ndjson') {
            ensureSize('NDJSON', ndjsonBuf.length + txt.length);
            ndjsonBuf += txt;
            const newline = ndjsonBuf.indexOf('\n');
            if (newline !== -1) {
              const line = ndjsonBuf.slice(0, newline).trim();
              ndjsonBuf = ndjsonBuf.slice(newline + 1);
              if (!line) return undefined;
              return { value: JSON.parse(line) as TChunk, done: false };
            }
            return undefined;
          }
          if (parser === 'sse') {
            ensureSize('SSE', sseBuf.length + txt.length);
            sseBuf += txt;
            const eventEnd = sseBuf.indexOf('\n\n');
            if (eventEnd !== -1) {
              const raw = sseBuf.slice(0, eventEnd);
              sseBuf = sseBuf.slice(eventEnd + 2);
              const evt = parseSSEBlock(raw) as unknown as TChunk;
              return { value: evt, done: false };
            }
            return undefined;
          }
          return { value: txt as unknown as TChunk, done: false };
        };

        return {
          async next(): Promise<IteratorResult<TChunk>> {
            while (true) {
              const { value, done } = await reader.next();
              if (done) return emitDone();
              const parsed = parseChunk(value);
              if (parsed) return parsed;
              // continue loop to read more without recursion
            }
          },
        };
      },
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

export default AxiosAdapter;
