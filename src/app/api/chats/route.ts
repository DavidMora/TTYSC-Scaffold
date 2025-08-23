import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { apiResponse } from '@/lib/api/utils/response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/chats -> upstream GET /chats
export async function GET() {
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: '/chats',
    });
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
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
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
