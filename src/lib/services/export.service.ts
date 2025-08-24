import { httpClient } from '@/lib/api';
import { BFF_EXPORT_TABLE } from '@/lib/constants/api/bff-routes';
import { ExportTableParams } from '@/lib/types/export';

export async function getExportTable(payload: ExportTableParams) {
  return await httpClient.get<Blob>(
    BFF_EXPORT_TABLE(payload.tableId, payload.format),
    {
      headers: { Accept: payload.mimeType },
    }
  );
}
