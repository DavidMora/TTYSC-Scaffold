export interface ExportFormat {
  id: string;
  name: string;
  icon: string;
  mimeType: string;
  fileExtension: string;
}

export interface ExportTableParams {
  tableId: string;
  format: string;
  mimeType: string;
}

export interface ExportTableResponse {
  blob: Blob;
  filename: string;
  contentType: string;
}

export interface ExportConfig {
  formats: ExportFormat[];
  defaultFormat: string;
  maxFileSize?: number;
}
