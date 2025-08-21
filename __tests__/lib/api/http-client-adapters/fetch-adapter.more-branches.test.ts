import { FetchAdapter } from '@/lib/api/http-client-adapters/fetch-adapter';

// Shared fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

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

describe('FetchAdapter additional branches', () => {
  let adapter: FetchAdapter;
  beforeEach(() => {
    adapter = new FetchAdapter();
    jest.clearAllMocks();
  });

  it('extracts content-type from plain object headers (capitalized key)', async () => {
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' } as Record<string, string>,
      json: jest.fn().mockResolvedValue({ foo: 'bar' }),
      text: jest.fn(),
      blob: jest.fn(),
    };
    mockFetch.mockResolvedValue(response);

    const result = await adapter.get('/object-ct');
    expect(result.data).toEqual({ foo: 'bar' });
  });

  it('parses SSE events split by \r\n\r\n delimiter', async () => {
    const sse = 'id:1\ndata:a\r\n\r\n' + 'id:2\ndata:b\r\n\r\n';
    mockFetch.mockResolvedValue(
      buildResponse([sse], { 'content-type': 'text/event-stream' })
    );
    const stream = await adapter.stream('/sse-rnrn', { parser: 'sse' });
    const events: Array<Record<string, unknown>> = [];
    for await (const e of stream) events.push(e as Record<string, unknown>);
    expect(events.map((e) => e.data)).toEqual(['a', 'b']);
  });

  it('returns empty stream iterable when response has no body', async () => {
    const response = {
      ok: true,
      status: 204,
      statusText: 'No Content',
      headers: new Headers(),
      body: undefined,
    } as unknown as Response;
    mockFetch.mockResolvedValue(response);

    const stream = await adapter.stream('/no-body');
    const iterator = stream[Symbol.asyncIterator]();
    const first = await iterator.next();
    expect(first.done).toBe(true);
    type Cancellable = { cancel: () => void };
    const maybe = stream as unknown as Partial<Cancellable>;
    expect(typeof maybe.cancel).toBe('function');
  });
});
