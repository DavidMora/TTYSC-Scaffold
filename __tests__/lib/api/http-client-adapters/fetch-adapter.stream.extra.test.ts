import FetchAdapter from "@/lib/api/http-client-adapters/fetch-adapter";
import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from "util";
// Polyfill if needed
if (typeof TextEncoder === "undefined") {
  // @ts-expect-error assigning polyfill in test env
  global.TextEncoder = NodeTextEncoder;
}
if (typeof TextDecoder === "undefined") {
  // @ts-expect-error assigning polyfill in test env
  global.TextDecoder = NodeTextDecoder;
}

// Helper to build a mock ReadableStream reader
function buildReader(chunks: (string | Uint8Array)[]) {
  const enc = new TextEncoder();
  const normalized = chunks.map((c) =>
    typeof c === "string" ? enc.encode(c) : c
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
    statusText: "OK",
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

describe("FetchAdapter.stream extra coverage", () => {
  let adapter: FetchAdapter;
  beforeEach(() => {
    adapter = new FetchAdapter();
    jest.clearAllMocks();
  });

  it("emits leftover SSE event in handleDone with retry", async () => {
    const evt = "id:7\nretry:1000\ndata:partial"; // no trailing blank line
    mockFetch.mockResolvedValue(
      buildResponse([evt], { "content-type": "text/event-stream" })
    );
    const stream = await adapter.stream("/sse-leftover", { parser: "sse" });
    const events: Record<string, unknown>[] = [];
    for await (const e of stream) events.push(e as Record<string, unknown>);
    expect(events[0]).toMatchObject({ id: "7", retry: 1000, data: "partial" });
  });

  it("skips empty NDJSON line", async () => {
    mockFetch.mockResolvedValue(buildResponse(["\n", '{"v":1}\n']));
    const stream = await adapter.stream("/ndjson-skip", { parser: "ndjson" });
    const out: unknown[] = [];
    for await (const o of stream) out.push(o);
    expect(out).toEqual([{ v: 1 }]);
  });

  it("falls back to text for unknown parser", async () => {
    mockFetch.mockResolvedValue(buildResponse(["abc"]));
    // @ts-expect-error forcing unknown parser for fallback branch
    const stream = await adapter.stream("/fallback", { parser: "???" });
    const out: string[] = [];
    for await (const c of stream) out.push(c as string);
    expect(out).toEqual(["abc"]);
  });

  it("supports cancel method early termination", async () => {
    const json = JSON.stringify({ a: 1 });
    const resp = buildResponse([json.slice(0, 3), json.slice(3)]);
    mockFetch.mockResolvedValue(resp);
    const stream = await adapter.stream("/json", { parser: "json" });
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
});
