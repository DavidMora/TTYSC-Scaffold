import FetchAdapter from '@/lib/api/http-client-adapters/fetch-adapter';
import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from 'util';
// Polyfill TextEncoder/TextDecoder if not present (older Node test envs) without using any
interface GlobalTextEncoding {
  TextEncoder?: typeof NodeTextEncoder;
  TextDecoder?: typeof NodeTextDecoder;
}
const gTE = globalThis as GlobalTextEncoding;
gTE.TextEncoder ??= NodeTextEncoder;
gTE.TextDecoder ??= NodeTextDecoder;

// Helper to build a mock ReadableStream reader
function buildReader(chunks: (string | Uint8Array)[]) {
  const enc = new TextEncoder();
  const normalized = chunks.map((c) =>
    typeof c === 'string' ? enc.encode(c) : c
  );
  let i = 0;
  return {
    read: jest.fn(async () => {
      if (i < normalized.length) {
        return { value: normalized[i++], done: false } as const;
      }
      return { value: undefined, done: true } as const;
    }),
  };
}

// Minimal fetch Response mock with streaming body
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

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('FetchAdapter.stream', () => {
  let adapter: FetchAdapter;

  beforeEach(() => {
    adapter = new FetchAdapter();
    jest.clearAllMocks();
  });

  it('streams text chunks by default', async () => {
    mockFetch.mockResolvedValue(
      buildResponse(['hello ', 'world']) // two chunks
    );
    const stream = await adapter.stream<string>('/text');
    const received: string[] = [];
    for await (const chunk of stream) received.push(chunk);
    expect(received).toEqual(['hello ', 'world']);
    expect(stream.ok).toBe(true);
  });

  it('streams raw bytes when parser=bytes', async () => {
    const u8a = new Uint8Array([1, 2, 3]);
    mockFetch.mockResolvedValue(buildResponse([u8a]));
    const stream = await adapter.stream<Uint8Array>('/bytes', {
      parser: 'bytes',
    });
    const chunks: Uint8Array[] = [];
    for await (const c of stream) chunks.push(c);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBeInstanceOf(Uint8Array);
    expect(Array.from(chunks[0])).toEqual([1, 2, 3]);
  });

  it('buffers and parses single JSON object then aborts', async () => {
    const json = JSON.stringify({ a: 1 });
    mockFetch.mockResolvedValue(
      buildResponse([json.slice(0, 5), json.slice(5)])
    );
    const stream = await adapter.stream<{ a: number }>('/json', {
      parser: 'json',
    });
    const out: { a: number }[] = [];
    for await (const obj of stream) out.push(obj);
    expect(out).toEqual([{ a: 1 }]);
  });

  it('parses NDJSON lines including final buffered line on done', async () => {
    mockFetch.mockResolvedValue(
      buildResponse(['{"x":1}\n{"x":2}']) // second line lacks trailing \n to test handleDone
    );
    const stream = await adapter.stream<{ x: number }>('/ndjson', {
      parser: 'ndjson',
    });
    const values: number[] = [];
    for await (const obj of stream) values.push((obj as { x: number }).x);
    // We expect both lines (the second emitted in handleDone path)
    expect(values).toEqual([1, 2]);
  });

  it('parses SSE events across chunks and leftover final event', async () => {
    const evt1 = 'id:1\nevent:message\ndata:hello\n\n'; // complete event ending with blank line
    const evt2 = 'id:2\ndata:world'; // missing final blank line -> handleDone
    mockFetch.mockResolvedValue(
      buildResponse([evt1.slice(0, 10), evt1.slice(10), evt2])
    );
    const stream = await adapter.stream('/sse', { parser: 'sse' });
    const events: Array<Record<string, unknown>> = [];
    for await (const e of stream) events.push(e as Record<string, unknown>);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      id: '1',
      event: 'message',
      data: 'hello',
    });
    expect(events[1]).toMatchObject({ id: '2', data: 'world' });
  });

  it('honors external abort signal', async () => {
    // One chunk then abort before second
    const reader = buildReader(['part1', 'part2']);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      body: { getReader: () => reader },
    });
    const external = new AbortController();
    const stream = await adapter.stream<string>('/abort', {
      signal: external.signal,
    });
    const collected: string[] = [];
    const iterator = stream[Symbol.asyncIterator]();
    const first = await iterator.next();
    collected.push(first.value as string);
    external.abort();
    // Simulate reader returning done after abort (no more chunks)
    (reader.read as jest.Mock).mockResolvedValueOnce({
      value: undefined,
      done: true,
    });
    const second = await iterator.next();
    expect(second.done).toBe(true);
    expect(collected).toEqual(['part1']);
  });

  it('sets appropriate Accept header for parsers', async () => {
    mockFetch.mockResolvedValue(
      buildResponse(['{}'], { 'content-type': 'application/json' })
    );
    await adapter.stream('/json', { parser: 'json' });
    expect(mockFetch.mock.calls[0][1].headers.Accept).toBe('application/json');

    mockFetch.mockResolvedValue(
      buildResponse(['id:1\n\n'], { 'content-type': 'text/event-stream' })
    );
    await adapter.stream('/sse', { parser: 'sse' });
    expect(mockFetch.mock.calls[1][1].headers.Accept).toBe('text/event-stream');
  });

  it('throws when response has no body', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      body: null,
    });
    await expect(adapter.stream('/nobody')).rejects.toThrow(
      /ReadableStream not supported/
    );
  });
});
