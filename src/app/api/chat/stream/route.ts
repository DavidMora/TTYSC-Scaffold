import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';

// Avoid cache and ensure execution on every request
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Proxy streaming (SSE) -> forwards POST /api/chat/stream to the backend
 * http://localhost:5000/chat/stream and returns the exact same
 * stream to the browser.
 */
export async function POST(request: NextRequest) {
  let body: unknown = undefined;
  try {
    body = await request.json();
  } catch {
    // if there is no valid body, we continue without it
  }

  // Prepare upstream request as a byte stream using backendRequest
  let upstream;
  try {
    upstream = await backendRequest<Uint8Array, unknown>({
      method: 'POST',
      path: '/chat/stream',
      body,
      stream: true,
      parser: 'bytes',
    });
  } catch (error) {
    console.log(error);

    const msg = error instanceof Error ? error.message : 'Upstream error';
    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`
            )
          );
          controller.close();
        },
      }),
      {
        status: 502,
        headers: sseHeaders(),
      }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of upstream) {
          // chunk is Uint8Array (raw) -> forward directly
          controller.enqueue(chunk);
        }
      } catch (err) {
        const encoder = new TextEncoder();
        controller.enqueue(
          encoder.encode(
            `event: error\ndata: ${JSON.stringify({
              message: err instanceof Error ? err.message : String(err),
            })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      // Also cancel upstream
      try {
        upstream.cancel();
      } catch {
        /* noop */
      }
    },
  });

  return new Response(stream, {
    status: upstream.status,
    headers: sseHeaders(),
  });
}

function sseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Content-Encoding': 'none',
    'Access-Control-Allow-Origin': '*',
  };
}

// Preflight
export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
