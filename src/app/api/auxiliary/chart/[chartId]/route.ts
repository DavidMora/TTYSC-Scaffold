import { errorResponse } from '@/lib/utils/error-response';
import { backendRequest } from '@/lib/api/backend-request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/auxiliary/chart/[chartId]?from=...&to=...&region=...
export async function GET(
  req: Request,
  { params }: { params: { chartId?: string } }
) {
  const chartId = params?.chartId;
  if (!chartId) return errorResponse('Missing chartId', 400);

  try {
    const url = new URL(req.url);
    const qp = new URLSearchParams();
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const region = url.searchParams.get('region');
    if (from) qp.set('from', from);
    if (to) qp.set('to', to);
    if (region) qp.set('region', region);
    const qs = qp.toString();
    const path = `/auxiliary/chart/${encodeURIComponent(chartId)}${qs ? '?' + qs : ''}`;

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
