import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { errorResponse } from '@/lib/utils/error-response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function forwardSettings(method: 'GET' | 'PATCH', req?: NextRequest) {
  let body: unknown;
  if (req) {
    try {
      body = await req.json();
    } catch {
      body = undefined;
    }
  }
  try {
    const upstream = await backendRequest<{ data: unknown }, unknown>({
      method,
      path: '/settings',
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

// GET /api/settings -> upstream GET /settings
export async function GET() {
  return forwardSettings('GET');
}

// PATCH /api/settings -> upstream PATCH /settings
export async function PATCH(req: NextRequest) {
  return forwardSettings('PATCH', req);
}

