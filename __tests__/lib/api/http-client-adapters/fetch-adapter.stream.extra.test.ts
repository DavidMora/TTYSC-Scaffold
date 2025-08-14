import { FetchAdapter } from '@/lib/api/http-client-adapters/fetch-adapter';

import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from 'util';
// Polyfill if needed
if (typeof TextEncoder === 'undefined') {
  // @ts-expect-error assigning polyfill in test env
  global.TextEncoder = NodeTextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  // @ts-expect-error assigning polyfill in test env
  global.TextDecoder = NodeTextDecoder;
}

// Helper to build a mock ReadableStream reader
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

const mockFetch = jest.fn();
// Assign fetch globally
(globalThis as unknown as { fetch: typeof fetch }).fetch =
  mockFetch as unknown as typeof fetch;

describe('FetchAdapter.stream extra coverage', () => {
  let adapter: FetchAdapter;
  beforeEach(() => {
    adapter = new FetchAdapter();
    jest.clearAllMocks();
  });

  it('emits leftover SSE event in handleDone with retry', async () => {
    const evt = 'id:7\nretry:1000\ndata:partial'; // no trailing blank line
    mockFetch.mockResolvedValue(
      buildResponse([evt], { 'content-type': 'text/event-stream' })
    );
    const stream = await adapter.stream('/sse-leftover', { parser: 'sse' });
    const events: Record<string, unknown>[] = [];
    for await (const e of stream) events.push(e as Record<string, unknown>);
    expect(events[0]).toMatchObject({ id: '7', retry: 1000, data: 'partial' });
  });

  it('skips empty NDJSON line', async () => {
    mockFetch.mockResolvedValue(buildResponse(['\n', '{"v":1}\n']));
    const stream = await adapter.stream('/ndjson-skip', { parser: 'ndjson' });
    const out: unknown[] = [];
    for await (const o of stream) out.push(o);
    expect(out).toEqual([{ v: 1 }]);
  });

  it('falls back to text for unknown parser', async () => {
    mockFetch.mockResolvedValue(buildResponse(['abc']));
    // @ts-expect-error forcing unknown parser for fallback branch
    const stream = await adapter.stream('/fallback', { parser: '???' });
    const out: string[] = [];
    for await (const c of stream) out.push(c as string);
    expect(out).toEqual(['abc']);
  });

  it('supports cancel method early termination', async () => {
    const json = JSON.stringify({ a: 1 });
    const resp = buildResponse([json.slice(0, 3), json.slice(3)]);
    mockFetch.mockResolvedValue(resp);
    const stream = await adapter.stream('/json', { parser: 'json' });
    expect(stream.ok).toBe(true); // meta coverage
    const it = stream[Symbol.asyncIterator]();
    const first = await it.next();
    stream.cancel();
    const reader = (
      resp as unknown as { body: { getReader: () => { read: jest.Mock } } }
    ).body.getReader();
    reader.read.mockResolvedValueOnce({ value: undefined, done: true });
    const second = await it.next();
    expect(first.done).toBe(false);
    expect(second.done).toBe(true);
  });

  it('errors when JSON buffer exceeds maxBufferSize', async () => {
    const big = '{"a":1234567890}';
    mockFetch.mockResolvedValue(buildResponse([big.slice(0, 5), big.slice(5)]));
    const stream = await adapter.stream('/json-big', {
      parser: 'json',
      maxBufferSize: 6, // will overflow on second chunk
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of stream) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/JSON buffer exceeded/);
  });

  it('errors when NDJSON buffer exceeds maxBufferSize', async () => {
    const line = '{"v":1}\n';
    mockFetch.mockResolvedValue(buildResponse([line]));
    const stream = await adapter.stream('/ndjson-big', {
      parser: 'ndjson',
      maxBufferSize: 5, // smaller than line length
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of stream) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/NDJSON buffer exceeded/);
  });

  it('times out JSON parsing when incomplete for too long', async () => {
    // Custom reader adding delay before second chunk
    const enc = new TextEncoder();
    const chunks = ['{"a":', '1}'];
    let i = 0;
    const reader = {
      read: jest.fn(async () => {
        if (i === 0) {
          return { value: enc.encode(chunks[i++]), done: false } as const;
        }
        // Delay to exceed timeout
        await new Promise((r) => setTimeout(r, 15));
        return { value: enc.encode(chunks[i++]), done: false } as const;
      }),
    };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      body: { getReader: () => reader },
    });
    const stream = await adapter.stream('/json-timeout', {
      parser: 'json',
      jsonParserTimeoutMs: 1, // very low timeout
    });
    let caught: Error | undefined;
    const start = Date.now();
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of stream) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    const elapsed = Date.now() - start;
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/JSON stream parse timeout/);
    expect(elapsed).toBeGreaterThanOrEqual(1);
  });

  it('throws on invalid NDJSON line parse error', async () => {
    mockFetch.mockResolvedValue(buildResponse(['{"a":1}\n{"b":}\n']));
    const stream = await adapter.stream('/ndjson-invalid-line', {
      parser: 'ndjson',
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of stream) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/Failed to parse NDJSON line/);
  });

  it('throws when SSE buffer exceeds maxBufferSize', async () => {
    mockFetch.mockResolvedValue(buildResponse(['data:0123456789\n\n']));
    const stream = await adapter.stream('/sse-big', {
      parser: 'sse',
      maxBufferSize: 5,
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of stream) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/SSE buffer exceeded/);
  });
});
