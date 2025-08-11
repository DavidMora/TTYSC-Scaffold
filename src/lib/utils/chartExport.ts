import {
  ChartDimension,
  ChartMeasure,
  MultiDataPoint,
  SingleDataPoint,
} from "@/lib/types/charts";

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_.]+/gi, "_").slice(0, 120);
}

export function triggerFileDownload(
  data: string | Blob,
  filename: string,
  mime?: string
) {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: mime || "application/octet-stream" })
      : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadChartAsPng(
  container: HTMLElement | null,
  title?: string
) {
  const svg = findFirstSvg(container);
  if (!svg) return;
  serializeSvgToPng(svg, title || "chart");
}

export function getCurrentSlice<T>(
  data: T[],
  viewWindow: { start: number; end: number }
): T[] {
  const len = data.length;
  const from = Math.floor(viewWindow.start * len);
  const to = Math.ceil(viewWindow.end * len);
  const safeFrom = Math.max(0, Math.min(from, len - 1));
  const safeTo = Math.max(safeFrom + 1, Math.min(to, len));
  return data.slice(safeFrom, safeTo);
}

export function buildCsv(
  dataset: Array<SingleDataPoint | MultiDataPoint>,
  dimensions: ChartDimension[],
  measures: ChartMeasure[]
): string {
  const dimCols = dimensions.map((d) => d.accessor);
  const measureCols = measures.map((m) => m.accessor);
  const headers = [...dimCols, ...measures.map((m) => m.label)];
  const cols = [...dimCols, ...measureCols];
  const rows = dataset.map((row) =>
    cols
      .map((col) => toCsvString((row as Record<string, unknown>)[col]))
      .map((value) => escapeCsvField(value))
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function toCsvString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return "";
}

function escapeCsvField(raw: string): string {
  const value = raw.replace(/\r?\n/g, "\\n");
  const needsQuote = /[",\n]/.test(value);
  const doubledQuotes = value.replace(/"/g, '""');
  return needsQuote ? `"${doubledQuotes}"` : doubledQuotes;
}

function serializeSvgToPng(svg: SVGSVGElement, filenameBase: string) {
  const rect = svg.getBoundingClientRect();
  const width = Math.ceil(
    rect.width || Number(svg.getAttribute("width")) || 800
  );
  const height = Math.ceil(
    rect.height || Number(svg.getAttribute("height")) || 400
  );

  const cloned = svg.cloneNode(true) as SVGSVGElement;
  cloned.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  cloned.setAttribute("width", String(width));
  cloned.setAttribute("height", String(height));
  const svgData = new XMLSerializer().serializeToString(cloned);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    if (canvas && typeof canvas === "object") {
      canvas.width = width;
      canvas.height = height;
    }
    const hasGetContext = canvas && typeof canvas.getContext === "function";
    const hasToBlob = canvas && typeof canvas.toBlob === "function";

    if (!hasGetContext || !hasToBlob) {
      triggerFileDownload(
        svgBlob,
        sanitizeFilename(filenameBase) + ".svg",
        "image/svg+xml;charset=utf-8"
      );
      URL.revokeObjectURL(url);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob: Blob | null) => {
      if (blob) {
        triggerFileDownload(
          blob,
          sanitizeFilename(filenameBase) + ".png",
          "image/png"
        );
      }
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function findFirstSvg(root: HTMLElement | null): SVGSVGElement | null {
  return (root?.querySelector("svg") as SVGSVGElement) || null;
}
