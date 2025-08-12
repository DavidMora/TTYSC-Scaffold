/** @jest-environment node */
import { AxiosAdapter } from "@/lib/api/http-client-adapters/axios-adapter";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to build async iterable over Buffers
function bufferStream(parts: string[]): AsyncIterable<Buffer> {
  let i = 0;
  const buffers = parts.map((p) => Buffer.from(p));
  const iterable: AsyncIterable<Buffer> = {
    [Symbol.asyncIterator]() {
      return {
        next: async () =>
          i < buffers.length
            ? { value: buffers[i++], done: false }
            : { value: undefined, done: true },
      } as AsyncIterator<Buffer>;
    },
  };
  return iterable;
}

interface MockAxiosInstance {
  get: jest.Mock;
}

describe("AxiosAdapter.stream", () => {
  let adapter: AxiosAdapter;
  let mockAxiosInstance: MockAxiosInstance;

  beforeEach(() => {
    mockAxiosInstance = { get: jest.fn() };
    (mockedAxios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
    adapter = new AxiosAdapter();
    // Ensure window is undefined (simulate Node environment) - jsdom sets it by default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });

  it("streams text chunks", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(["hello ", "world"]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream<string>("/text", { parser: "text" });
    const out: string[] = [];
    for await (const c of res) out.push(c as string);
    expect(out).toEqual(["hello ", "world"]);
  });

  it("parses JSON after buffering and aborts", async () => {
    const json = JSON.stringify({ a: 1 });
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([json.slice(0, 4), json.slice(4)]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream<Record<string, number>>("/json", {
      parser: "json",
    });
    const received: Record<string, number>[] = [];
    for await (const v of res) received.push(v as Record<string, number>);
    expect(received).toEqual([{ a: 1 }]);
  });

  it("parses NDJSON lines including final buffered line", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(['{"x":1}\n{"x":2}']),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream<{ x: number }>("/ndjson", {
      parser: "ndjson",
    });
    const xs: number[] = [];
    for await (const v of res) xs.push((v as { x: number }).x);
    expect(xs).toEqual([1, 2]);
  });

  it("parses SSE events including final buffered block", async () => {
    const evt1 = "id:1\ndata:hello\n\n";
    const evt2 = "id:2\n event:note\n data:world"; // space before fields & no trailing blank -> final flush
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream([evt1.slice(0, 5), evt1.slice(5), evt2]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream<Record<string, unknown>>("/sse", {
      parser: "sse",
    });
    const events: Record<string, unknown>[] = [];
    for await (const e of res) events.push(e as Record<string, unknown>);
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ id: "1", data: "hello" });
    expect(events[1]).toMatchObject({ id: "2" });
  });

  it("streams raw bytes", async () => {
    mockAxiosInstance.get.mockResolvedValue({
      data: bufferStream(["abc"]),
      status: 200,
      statusText: "OK",
      headers: {},
    });
    const res = await adapter.stream<Buffer>("/bytes", { parser: "bytes" });
    const chunks: Buffer[] = [];
    for await (const c of res) chunks.push(c as Buffer);
    expect(chunks[0]).toBeInstanceOf(Buffer);
  });

  it("throws in browser environment", async () => {
    // Simulate browser: define window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {};
    mockAxiosInstance.get.mockResolvedValue({});
    await expect(adapter.stream("/fail")).rejects.toThrow(
      /not supported in browser/
    );
    // cleanup
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;
  });
});
