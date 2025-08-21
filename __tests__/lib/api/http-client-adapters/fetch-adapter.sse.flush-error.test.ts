// Mock only in this file: force parseSSEBlock to throw during flush
jest.mock('@/lib/api/stream/parse-sse', () => ({
  parseSSEBlock: () => {
    throw new Error('parse failure');
  },
}));

import { FetchAdapter } from '@/lib/api/http-client-adapters/fetch-adapter';
import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from 'util';

// Polyfill if needed (Node < 20 in some envs)
if (typeof TextEncoder === 'undefined') global.TextEncoder = NodeTextEncoder;
if (typeof TextDecoder === 'undefined')
  global.TextDecoder = NodeTextDecoder as unknown as typeof TextDecoder;

const mockFetch = jest.fn();
global.fetch = mockFetch;

function buildReader(chunks: (string | Uint8Array)[]) {
  const enc = new TextEncoder();
  const normalized = chunks.map((c) =>
    typeof c === 'string' ? enc.encode(c) : c
  );
  let i = 0;
  return {
    read: jest.fn(async () => {
      if (i < normalized.length)
        return { value: normalized[i++], done: false } as const;
      return { value: undefined, done: true } as const;
    }),
  };
}

function buildResponse(
  chunks: (string | Uint8Array)[],
  headers: Record<string, string> = {}
) {
  const reader = buildReader(chunks);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(headers),
    body: { getReader: () => reader },
  } as unknown as Response & {
    body: { getReader: () => ReturnType<typeof buildReader> };
  };
}

describe('FetchAdapter stream flush SSE error path', () => {
  it('swallows parse error from flushSSEBuffer and completes cleanly', async () => {
    const adapter = new FetchAdapter();
    // Single incomplete SSE block so it stays buffered and is flushed on finally
    mockFetch.mockResolvedValue(
      buildResponse(['data:partial'], { 'content-type': 'text/event-stream' })
    );
    const stream = await adapter.stream('/sse-flush-error', { parser: 'sse' });
    const out: unknown[] = [];
    for await (const c of stream) out.push(c);
    expect(out).toEqual([]);
  });
});
