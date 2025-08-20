import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function extractMessageId(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  const idx = parts.indexOf('messages');
  if (idx >= 0 && parts.length > idx + 1)
    return decodeURIComponent(parts[idx + 1]);
  return null;
}

// PUT /api/messages/:messageId/feedback -> upstream PUT /messages/:messageId/feedback
export async function PUT(req: NextRequest) {
  const messageId = extractMessageId(req);
  if (!messageId) return errorResponse('Missing messageId', 400);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = undefined;
  }
  try {
    const upstream = await backendRequest<{ data: unknown }, unknown>({
      method: 'PUT',
      path: `/messages/${messageId}/feedback`,
      body,
    });
    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown, status = 500) {
  let message: string;
  if (typeof e === 'string') message = e;
  else if (e instanceof Error) message = e.message;
  else message = 'Internal error';
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
