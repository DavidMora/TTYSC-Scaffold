import { ExportTableResponse } from "@/lib/types/export";
import { EXPORT_CONFIG } from "../constants/UI/export";

export function downloadFile(response: ExportTableResponse): void {
  try {
    if (
      EXPORT_CONFIG.maxFileSize != null &&
      response.blob.size > EXPORT_CONFIG.maxFileSize
    ) {
      throw new Error();
    }

    const url = window.URL.createObjectURL(response.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = response.filename;
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch {
    throw new Error("Download error");
  }
}
