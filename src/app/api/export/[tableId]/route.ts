import { errorResponse } from '@/lib/utils/error-response';
import { backendRequest } from '@/lib/api/backend-request';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/export/[tableId]?format=csv|excel -> upstream /export/[tableId]?format=...
export async function GET(
  _req: Request,
  { params }: { params: { tableId?: string } }
) {
  const tableId = params?.tableId;
  if (!tableId) return errorResponse('Missing tableId', 400);

  try {
    const url = new URL(_req.url);
    const format = url.searchParams.get('format') || 'csv';

    const upstream = await backendRequest<Blob>({
      method: 'GET',
      path: `/export/${encodeURIComponent(tableId)}?format=${encodeURIComponent(
        format
      )}`,
      // Accept header is propagated via backendRequest headers if needed by backend
      headers: { Accept: _req.headers.get('accept') || '*/*' },
    });

    // Forward content headers for file download
    const contentType =
      upstream.headers['content-type'] || 'application/octet-stream';
    const disposition = upstream.headers['content-disposition'];

    return new Response(upstream.data as unknown as BodyInit, {
      status: upstream.status,
      headers: {
        'Content-Type': contentType,
        ...(disposition ? { 'Content-Disposition': disposition } : {}),
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
