import { HttpClient } from '@/lib/api/http-client';
import {
  HttpClientAdapter,
  HttpStreamResponse,
} from '@/lib/types/api/http-client';

describe('HttpClient.stream wrapper', () => {
  it('delegates to adapter.stream when available', async () => {
    const original = ['a', 'b', 'c'] as const;
    const expected = [...original];
    let index = 0;
    const streamImpl = async (): Promise<HttpStreamResponse<string>> => {
      const iterable: AsyncIterable<string> = {
        [Symbol.asyncIterator]: () => ({
          next: async () =>
            index < original.length
              ? { value: original[index++], done: false }
              : { value: undefined as unknown as string, done: true },
        }),
      };
      return Object.assign(iterable, {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {} as Record<string, string>,
        cancel: jest.fn(),
        raw: undefined,
      });
    };
    const streamMock = jest.fn(streamImpl);
    const mockAdapter: HttpClientAdapter = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      // Loosely cast to match generic signature; logic tested at runtime
      stream: streamMock as unknown as HttpClientAdapter['stream'],
    };
    const client = new HttpClient(mockAdapter);
    const res = await client.stream<string>('/test');
    const out: string[] = [];
    for await (const c of res) out.push(c);
    expect(out).toEqual(expected);
    expect(streamMock).toHaveBeenCalled();
  });

  it("throws when adapter doesn't implement stream", async () => {
    const client = new HttpClient({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
    } as HttpClientAdapter);
    await expect(client.stream('/nope')).rejects.toThrow(
      /Streaming not supported/
    );
  });
});
