import { downloadFile } from "@/lib/utils/exportFile";
import { getExportTable } from "@/lib/services/export.service";
import { ExportFormat } from "@/lib/types/export";

export const useExportTable = (tableId: number) => {
  const exportToFormat = async (formatConfig: ExportFormat) => {
    const response = await getExportTable({
      tableId,
      format: formatConfig.id,
      mimeType: formatConfig.mimeType,
    });

    if (!response.data) {
      throw new Error("Error getting export table");
    }

    const now = new Date();
    const timeString = now.toLocaleDateString();
    const filename = `table_${tableId}_${timeString}`;

    downloadFile({
      blob: response.data,
      filename: `${filename}${formatConfig.fileExtension}`,
      contentType: response.headers["content-type"] || formatConfig.mimeType,
    });
  };

  return {
    exportToFormat,
  };
};
