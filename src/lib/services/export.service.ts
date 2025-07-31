import { apiClient } from "@/lib/api";
import { EXPORT_TABLE } from "@/lib/constants/api/routes";
import { ExportTableParams } from "@/lib/types/export";

export async function getExportTable(payload: ExportTableParams) {
  return await apiClient.get<Blob>(
    EXPORT_TABLE(payload.tableId, payload.format),
    {
      headers: { Accept: payload.mimeType },
    }
  );
}
