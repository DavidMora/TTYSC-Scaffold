import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/chats -> upstream GET /chats
export async function GET() {
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: '/chats',
    });
    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/chats -> upstream POST /chats
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = undefined;
  }
  try {
    const upstream = await backendRequest<{ data: unknown }, unknown>({
      method: 'POST',
      path: '/chats',
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
  const message = e instanceof Error ? e.message : 'Internal error';
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
