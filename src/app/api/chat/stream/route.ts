import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';

// Evitar cache y asegurar ejecución en cada request
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Proxy streaming (SSE) -> re-enviar POST /api/chat/stream al backend
 * http://localhost:5000/chat/stream and return the same stream to the browser.
 * stream hacia el navegador.
 */
export async function POST(request: NextRequest) {
  let body: unknown = undefined;
  try {
    body = await request.json();
  } catch {
    // si no hay body válido seguimos sin él
  }

  // Preparar petición upstream como stream de bytes usando backendRequest
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
          // chunk es Uint8Array (raw) -> re-enviar directamente
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
      // Cancelar también upstream
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
