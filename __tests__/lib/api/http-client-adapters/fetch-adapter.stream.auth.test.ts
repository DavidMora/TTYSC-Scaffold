import FetchAdapter from '@/lib/api/http-client-adapters/fetch-adapter';
import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from 'util';

// Polyfill (JSDOM env) for streaming tests
if (typeof TextEncoder === 'undefined') {
  // @ts-expect-error Node's TextEncoder type doesn't match global TextEncoder
  global.TextEncoder = NodeTextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = NodeTextDecoder as unknown as typeof TextDecoder;
}

// Helper minimal streaming response
function buildResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'text/event-stream' }),
    body: {
      getReader: () => ({
        read: jest.fn(async () => ({ value: undefined, done: true })),
      }),
    },
  } as unknown as Response;
}

describe('FetchAdapter.stream auth & headers', () => {
  const originalFetch = global.fetch;
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue(buildResponse());
  });
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });
  it('adds X-Request-Id and Basic Authorization when config.auth provided', async () => {
    const adapter = new FetchAdapter({
      auth: { username: 'user', password: 'pass' },
    });
    await adapter.stream('/chat', { parser: 'text' });
    const call = (global.fetch as jest.Mock).mock.calls[0];
    const opts = call[1];
    expect(opts.headers['X-Request-Id']).toBeTruthy();
    expect(opts.headers.Authorization).toMatch(/^Basic /);
  });
});
