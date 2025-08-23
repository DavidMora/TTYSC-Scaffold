import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { apiResponse } from '@/lib/api/utils/response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/chat -> upstream POST /chat
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
      path: '/chat',
      body,
    });
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
