import { NextRequest } from 'next/server';
import { backendRequest } from '@/lib/api/backend-request';
import { apiResponse } from '@/lib/api/utils/response';

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
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
