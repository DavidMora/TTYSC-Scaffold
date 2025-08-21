import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { errorResponse } from '@/lib/utils/error-response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/cases -> upstream GET /cases (supports ?analysisNameType=...)
export async function GET(req: NextRequest) {
  try {
    const analysisNameType = req.nextUrl.searchParams.get('analysisNameType');
    const path = analysisNameType
      ? `/cases?analysisNameType=${encodeURIComponent(analysisNameType)}`
      : '/cases';

    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path,
    });
    return new Response(JSON.stringify(upstream.data), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
