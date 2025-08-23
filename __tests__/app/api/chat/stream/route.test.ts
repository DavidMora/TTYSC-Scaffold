/**
 * @jest-environment node
 */
import { POST, OPTIONS } from '@/app/api/chat/stream/route';
import { backendRequest } from '@/lib/api/backend-request';
import { NextRequest } from 'next/server';
import { ReadableStream } from 'stream/web';

jest.mock('@/lib/api/backend-request');

const mockedBackendRequest = jest.mocked(backendRequest);

// Helper to create a mock stream
function createMockStream(
  chunks: (string | Error)[]
): AsyncIterable<Uint8Array> {
  const encoder = new TextEncoder();
  return {
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) {
        if (chunk instanceof Error) {
          throw chunk;
        }
        yield encoder.encode(chunk);
      }
    },
  };
}

// Helper to read a stream to completion
async function streamToString(
  stream: ReadableStream<Uint8Array> | null
): Promise<string> {
  if (!stream) {
    return '';
  }
  const reader = stream.getReader();
  let result = '';
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value);
  }
  return result;
}

describe('POST /api/chat/stream', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should proxy the stream from the backend', async () => {
    const mockStream = createMockStream([
      'data: chunk1\n\n',
      'data: chunk2\n\n',
    ]);
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      cancel: jest.fn(),
      [Symbol.asyncIterator]: mockStream[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
      body: JSON.stringify({ message: 'stream this' }),
    });

    const response = await POST(req);
    const responseText = await streamToString(response.body as any);

    expect(response.status).toBe(200);
    expect(responseText).toBe('data: chunk1\n\ndata: chunk2\n\n');
    expect(mockedBackendRequest).toHaveBeenCalledWith({
      method: 'POST',
      path: '/chat/stream',
      body: { message: 'stream this' },
      stream: true,
      parser: 'bytes',
      timeout: -1,
    });
  });

  it('should handle upstream errors gracefully', async () => {
    const errorMessage = 'Upstream failed';
    mockedBackendRequest.mockRejectedValue(new Error(errorMessage));

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
    });

    const response = await POST(req);
    const responseText = await streamToString(response.body as any);

    expect(response.status).toBe(502);
    expect(responseText).toContain(`event: error`);
    expect(responseText).toContain(`"message":"${errorMessage}"`);
  });

  it('should handle errors during stream consumption', async () => {
    const streamError = new Error('Stream consumption error');
    const mockStream = createMockStream(['data: chunk1\n\n', streamError]);
    const cancelMock = jest.fn();

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      cancel: cancelMock,
      [Symbol.asyncIterator]: mockStream[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
    });

    const response = await POST(req);
    const responseText = await streamToString(response.body as any);

    expect(responseText).toContain('data: chunk1\n\n');
    expect(responseText).toContain(`event: error`);
    expect(responseText).toContain(`"message":"${streamError.message}"`);
  });

  it('should handle request body parsing errors', async () => {
    const mockStream = createMockStream(['data: ok\n\n']);
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      cancel: jest.fn(),
      [Symbol.asyncIterator]: mockStream[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
      body: 'invalid json',
    });

    await POST(req);

    expect(mockedBackendRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        body: undefined,
      })
    );
  });

  it('should call upstream.cancel when the client cancels', async () => {
    const cancelMock = jest.fn();

    // Create a stream that never resolves to simulate it being open
    const mockStreamThatStaysOpen = {
      async *[Symbol.asyncIterator]() {
        await new Promise(() => {}); // Never resolves
      },
    };

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      cancel: cancelMock,
      [Symbol.asyncIterator]: mockStreamThatStaysOpen[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
    });

    const response = await POST(req);
    const reader = response.body?.getReader();
    await reader?.cancel();

    expect(cancelMock).toHaveBeenCalled();
  });

  it('should handle upstream cancel throwing an error', async () => {
    const cancelMock = jest.fn().mockImplementation(() => {
      throw new Error('Cancel failed');
    });
    const mockStreamThatStaysOpen = {
      async *[Symbol.asyncIterator]() {
        await new Promise(() => {}); // Never resolves
      },
    };

    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      cancel: cancelMock,
      [Symbol.asyncIterator]: mockStreamThatStaysOpen[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
    });

    const response = await POST(req);
    const reader = response.body?.getReader();
    // The cancel call should not throw, as the error is caught inside
    await expect(reader?.cancel()).resolves.toBeUndefined();
    expect(cancelMock).toHaveBeenCalled();
  });

  it('should do nothing on cancel if upstream does not support it', async () => {
    const mockStream = createMockStream([]);
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {},
      ok: true,
      // no cancel method
      [Symbol.asyncIterator]: mockStream[Symbol.asyncIterator],
    };
    mockedBackendRequest.mockResolvedValue(mockResponse as any);

    const req = new NextRequest('http://localhost/api/chat/stream', {
      method: 'POST',
    });

    const response = await POST(req);
    const reader = response.body?.getReader();
    await expect(reader?.cancel()).resolves.toBeUndefined();
  });
});

describe('OPTIONS /api/chat/stream', () => {
  it('should return a 204 No Content response with correct headers', () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
      'POST, OPTIONS'
    );
  });
});
