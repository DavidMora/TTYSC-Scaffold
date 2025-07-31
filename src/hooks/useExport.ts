import { downloadFile } from "@/lib/utils/exportFile";
import { getExportTable } from "@/lib/services/export.service";
import { ExportFormat } from "@/lib/types/export";
import { useState } from "react";

export const useExportTable = (tableId: string) => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToFormat = async (formatConfig: ExportFormat) => {
    setIsExporting(true);
    setError(null);

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

    setIsExporting(false);
  };

  return {
    exportToFormat,
    isExporting,
    error,
  };
};
