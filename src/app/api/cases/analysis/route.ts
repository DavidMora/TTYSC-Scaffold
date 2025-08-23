import { backendRequest } from '@/lib/api/backend-request';
import { apiResponse } from '@/lib/api/utils/response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/cases/analysis -> upstream GET /cases/analysis
export async function GET() {
  try {
    const upstream = await backendRequest<{ data: unknown }>({
      method: 'GET',
      path: '/cases/analysis',
    });
    return apiResponse.upstream(upstream);
  } catch (e) {
    return apiResponse.error(e);
  }
}
