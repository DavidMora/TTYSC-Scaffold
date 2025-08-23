import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { apiResponse } from '@/lib/api/utils/response';

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
  if (!messageId) return apiResponse.error('Missing messageId', 400);

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
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
