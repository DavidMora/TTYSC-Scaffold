import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper
function extractId(req: NextRequest): string | null {
  const parts = req.nextUrl.pathname.split('/');
  const idx = parts.indexOf('chats');
  if (idx >= 0 && parts.length > idx + 1)
    return decodeURIComponent(parts[idx + 1]);
  return null;
}

export async function GET(req: NextRequest) {
  const id = extractId(req);
  if (!id) return errorResponse('Missing id', 400);
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: `/chats/${id}`,
    });
    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(req: NextRequest) {
  const id = extractId(req);
  if (!id) return errorResponse('Missing id', 400);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = undefined;
  }
  try {
    const upstream = await backendRequest<{ data: unknown }, unknown>({
      method: 'PATCH',
      path: `/chats/${id}`,
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

export async function DELETE(req: NextRequest) {
  const id = extractId(req);
  if (!id) return errorResponse('Missing id', 400);
  try {
    const upstream = await backendRequest<unknown>({
      method: 'DELETE',
      path: `/chats/${id}`,
    });
    return new Response(null, { status: upstream.status });
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
