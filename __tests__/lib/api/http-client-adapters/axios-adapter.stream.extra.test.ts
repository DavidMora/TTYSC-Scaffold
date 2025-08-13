/** @jest-environment node */
import { AxiosAdapter } from "@/lib/api/http-client-adapters/axios-adapter";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to build async iterable over Buffers
function bufferStream(parts: (string | Buffer)[]): AsyncIterable<Buffer> {
  let i = 0;
  const buffers = parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p)));
  return {
    [Symbol.asyncIterator]() {
      return {
        next: async () =>
          i < buffers.length
            ? { value: buffers[i++], done: false }
            : { value: undefined, done: true },
      } as AsyncIterator<Buffer>;
    },
  };
}

interface MockAxiosInstance {
  get: jest.Mock;
}

describe("AxiosAdapter.stream extra coverage", () => {
  let adapter: AxiosAdapter;
  let mockAxiosInstance: MockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = { get: jest.fn() };
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    adapter = new AxiosAdapter();
    // ensure node env
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  it("honors already-aborted external signal", async () => {
    const controller = new AbortController();
    controller.abort();
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(['{"a":1}']),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/json", {
      parser: "json",
      signal: controller.signal,
    });
    const items: unknown[] = [];
    for await (const c of res) items.push(c);
    // Should still parse json
    expect(items).toEqual([{ a: 1 }]);
  });

  it("handles empty NDJSON line skipped", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(["\n", '{"x":1}\n']),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/ndjson", { parser: "ndjson" });
    const out: unknown[] = [];
    for await (const v of res) out.push(v);
    expect(out).toEqual([{ x: 1 }]);
  });

  it("parses SSE retry field", async () => {
    const block = "id:9\nevent:update\nretry:5000\ndata:done\n\n";
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([block]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/sse", { parser: "sse" });
    const events: Record<string, unknown>[] = [];
    for await (const e of res) events.push(e as Record<string, unknown>);
    expect(events[0]).toMatchObject({
      id: "9",
      event: "update",
      retry: 5000,
      data: "done",
    });
  });

  it("supports cancel method", async () => {
    // Long json that would require two chunks
    const json = JSON.stringify({ big: true, n: 1 });
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([json.slice(0, 3), json.slice(3)]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/json", { parser: "json" });
    const iterator = res[Symbol.asyncIterator]();
    const first = await iterator.next();
    // Not yet parseable; will recurse until done, so we cancel to stop early
    res.cancel();
    // After cancel, simulate stream end
    const second = await iterator.next();
    expect(first.done).toBe(false); // might still be buffering
    // cancellation leads to eventual done (value could be undefined)
    expect(second.done).toBe(true);
  });

  it("fallback parser returns text when unknown parser provided", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(["abc"]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    // @ts-expect-error testing fallback path
    const res = await adapter.stream("/fallback", { parser: "unknown" });
    const out: string[] = [];
    for await (const c of res) out.push(c as string);
    expect(out).toEqual(["abc"]);
  });

  it("throws when NDJSON buffer exceeds maxBufferSize", async () => {
    const line = '{"a":1}\n';
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([line]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/ndjson-big", {
      parser: "ndjson",
      maxBufferSize: 5,
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of res) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/NDJSON buffer exceeded/);
  });

  it("throws when SSE buffer exceeds maxBufferSize", async () => {
    const evt = "data:0123456789\n\n";
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([evt]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/sse-big", {
      parser: "sse",
      maxBufferSize: 5,
    });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __chunk of res) {
        // consume
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    expect(String(caught)).toMatch(/SSE buffer exceeded/);
  });

  it("throws on invalid NDJSON line", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(['{"a":1}\n{"b":}\n']),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/ndjson-invalid", { parser: "ndjson" });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __c of res) {
        /* consume */
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
  });

  it("throws on leftover invalid NDJSON", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(['{"a":1}\n{"b":']),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream("/ndjson-leftover", { parser: "ndjson" });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __c of res) {
        /* consume */
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
  });

  it("throws on leftover SSE parse error (mocked)", async () => {
    jest.resetModules();
    jest.doMock("@/lib/api/stream/parse-sse", () => ({
      parseSSEBlock: () => {
        throw new Error("boom");
      },
    }));
    const { AxiosAdapter: LocalAxios } = await import(
      "@/lib/api/http-client-adapters/axios-adapter"
    );
    // new instance after mock
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    const local = new LocalAxios();
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(["data:only"]), // leftover no blank line
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await local.stream("/sse-leftover-error", { parser: "sse" });
    let caught: Error | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const __c of res) {
        /* consume */
      }
    } catch (e) {
      caught = e as Error;
    }
    expect(caught).toBeDefined();
    jest.dontMock("@/lib/api/stream/parse-sse");
  });
});
