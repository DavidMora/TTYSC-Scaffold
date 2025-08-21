import { apiClient } from '@/lib/api'; // Uses BFF base (FRONTEND_BASE_URL)
import { BFF_EXPORT_TABLE } from '@/lib/constants/api/bff-routes';
import { ExportTableParams } from '@/lib/types/export';

export async function getExportTable(payload: ExportTableParams) {
  return await apiClient.get<Blob>(
    BFF_EXPORT_TABLE(payload.tableId, payload.format),
    {
      headers: { Accept: payload.mimeType },
    }
  );
}
