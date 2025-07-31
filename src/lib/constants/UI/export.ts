import { ExportConfig } from "@/lib/types/export";

export const EXPORT_CONFIG: ExportConfig = Object.freeze({
  formats: [
    {
      id: "csv",
      name: "CSV",
      icon: "add-document",
      mimeType: "text/csv",
      fileExtension: ".csv",
    },
    {
      id: "excel",
      name: "Excel",
      icon: "excel-attachment",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      fileExtension: ".xlsx",
    },
  ],
  defaultFormat: "csv",
  maxFileSize: 50 * 1024 * 1024, // 50MB
});
