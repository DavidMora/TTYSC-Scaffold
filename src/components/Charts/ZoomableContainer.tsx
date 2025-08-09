"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import ChartToolbar from "@/components/Charts/ChartToolbar";
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import {
  ChartDimension,
  ChartMeasure,
  MultiDataPoint,
  SingleDataPoint,
} from "@/lib/types/charts";

type ViewWindow = { start: number; end: number };

interface ZoomableContainerProps {
  children: React.ReactNode;
  height?: number; // px
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  className?: string;
  mode?: "visual" | "dataX"; // visual = CSS scale/pan, dataX = update window [start,end]
  onWindowChange?: (window: ViewWindow) => void;
  renderContent?: (viewWindow: ViewWindow) => React.ReactNode;
  title?: string;
  exportContext?: {
    dataset: SingleDataPoint[] | MultiDataPoint[];
    dimensions: ChartDimension[];
    measures: ChartMeasure[];
  };
}

export const ZoomableContainer: React.FC<Readonly<ZoomableContainerProps>> = ({
  children,
  height = 400,
  minZoom = 1,
  maxZoom = 5,
  step = 0.4,
  className,
  mode = "visual",
  onWindowChange,
  renderContent,
  title,
  exportContext,
}) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);
  const [viewWindow, setViewWindow] = useState<ViewWindow>({
    start: 0,
    end: 1,
  });
  const rafIdRef = useRef<number | null>(null);
  const pendingWindowRef = useRef<ViewWindow | null>(null);

  const epsilon = 1e-3;
  const span = viewWindow.end - viewWindow.start;
  const dataZoom = 1 / Math.max(span, epsilon);
  const canZoomIn =
    mode === "visual" ? zoom < maxZoom - epsilon : dataZoom < maxZoom - epsilon;
  const canZoomOut =
    mode === "visual" ? zoom > minZoom + epsilon : dataZoom > minZoom + epsilon;

  const handleZoomIn = useCallback(() => {
    if (mode === "visual") {
      setZoom((z) => Math.min(maxZoom, +(z + step).toFixed(3)));
      return;
    }
    // dataX mode: shrink window around center
    setViewWindow((w) => {
      const currentSpan = w.end - w.start;
      const minSpan = Math.max(0.01, 1 / maxZoom); // avoid too tiny spans
      const factor = 1 - step; // 60% shrink per click when step=0.4
      const target = Math.max(minSpan, +(currentSpan * factor).toFixed(6));
      const center = (w.start + w.end) / 2;
      let newStart = center - target / 2;
      let newEnd = center + target / 2;
      if (newStart < 0) {
        newEnd -= newStart;
        newStart = 0;
      }
      if (newEnd > 1) {
        newStart -= newEnd - 1;
        newEnd = 1;
      }
      const next = { start: Math.max(0, newStart), end: Math.min(1, newEnd) };
      onWindowChange?.(next);
      return next;
    });
  }, [mode, maxZoom, step, onWindowChange]);

  const handleZoomOut = useCallback(() => {
    if (mode === "visual") {
      setZoom((z) => {
        const next = Math.max(minZoom, +(z - step).toFixed(3));
        if (next === 1) setOffset({ x: 0, y: 0 });
        return next;
      });
      return;
    }
    // dataX mode: expand window around center
    setViewWindow((w) => {
      const currentSpan = w.end - w.start;
      const maxSpan = Math.min(1, 1 / minZoom); // min zoom => largest span (<= 1)
      const factorIn = Math.max(epsilon, 1 - step); // zoom-in factor (<1)
      const factorOut = 1 / factorIn; // exact inverse for one-click symmetry
      const target = Math.min(
        1,
        Math.min(maxSpan, +(currentSpan * factorOut).toFixed(6))
      );
      const center = (w.start + w.end) / 2;
      let newStart = center - target / 2;
      let newEnd = center + target / 2;
      if (newStart < 0) {
        newEnd -= newStart;
        newStart = 0;
      }
      if (newEnd > 1) {
        newStart -= newEnd - 1;
        newEnd = 1;
      }
      const next = { start: Math.max(0, newStart), end: Math.min(1, newEnd) };
      if (next.end - next.start >= 1 - epsilon) {
        // fully zoomed out
        onWindowChange?.({ start: 0, end: 1 });
        return { start: 0, end: 1 };
      }
      onWindowChange?.(next);
      return next;
    });
  }, [mode, minZoom, step, onWindowChange]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode === "visual" && zoom <= 1) return;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
      };
    },
    [mode, zoom, offset.x, offset.y]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning || !panStartRef.current) return;
      if (mode === "visual") {
        const dx = e.clientX - panStartRef.current.x;
        const dy = e.clientY - panStartRef.current.y;
        setOffset({
          x: panStartRef.current.ox + dx,
          y: panStartRef.current.oy + dy,
        });
        return;
      }
      if (mode === "dataX") {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const dx = e.clientX - panStartRef.current.x;
        const width = viewport.clientWidth || 1;
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return; // no pan when full view
        const delta = -(dx / width) * range; // negative to follow drag direction
        let newStart = viewWindow.start + delta;
        let newEnd = viewWindow.end + delta;
        if (newStart < 0) {
          newEnd -= newStart;
          newStart = 0;
        }
        if (newEnd > 1) {
          newStart -= newEnd - 1;
          newEnd = 1;
        }
        const next = { start: Math.max(0, newStart), end: Math.min(1, newEnd) };
        // Throttle updates to next animation frame for smoother feel
        pendingWindowRef.current = next;
        rafIdRef.current ??= requestAnimationFrame(() => {
          rafIdRef.current = null;
          const win = pendingWindowRef.current;
          if (win) {
            pendingWindowRef.current = null;
            setViewWindow(win);
            onWindowChange?.(win);
          }
        });
      }
    },
    [isPanning, mode, viewWindow.end, viewWindow.start, onWindowChange]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (mode === "visual") {
        if (zoom <= 1) return; // Let page scroll when not zoomed
        e.preventDefault();
        setOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        return;
      }
      if (mode === "dataX") {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return; // no pan
        e.preventDefault();
        const width = viewport.clientWidth || 1;
        const delta = (e.deltaX / width) * range;
        let newStart = viewWindow.start + delta;
        let newEnd = viewWindow.end + delta;
        if (newStart < 0) {
          newEnd -= newStart;
          newStart = 0;
        }
        if (newEnd > 1) {
          newStart -= newEnd - 1;
          newEnd = 1;
        }
        const next = { start: Math.max(0, newStart), end: Math.min(1, newEnd) };
        pendingWindowRef.current = next;
        rafIdRef.current ??= requestAnimationFrame(() => {
          rafIdRef.current = null;
          const win = pendingWindowRef.current;
          if (win) {
            pendingWindowRef.current = null;
            setViewWindow(win);
            onWindowChange?.(win);
          }
        });
      }
    },
    [mode, zoom, viewWindow.end, viewWindow.start, onWindowChange]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (mode === "visual" && zoom <= 1) return;
      const stepPx = 20;
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (mode === "visual") {
        setOffset((prev) => {
          switch (e.key) {
            case "ArrowLeft":
              return { x: prev.x + stepPx, y: prev.y };
            case "ArrowRight":
              return { x: prev.x - stepPx, y: prev.y };
            case "ArrowUp":
              return { x: prev.x, y: prev.y + stepPx };
            case "ArrowDown":
              return { x: prev.x, y: prev.y - stepPx };
            case "Home":
              return { x: 0, y: 0 };
            case "End":
              return prev; // no-op
            default:
              return prev;
          }
        });
        return;
      }
      if (mode === "dataX") {
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return;
        const stepNorm =
          (stepPx / (viewportRef.current?.clientWidth || 1)) * range;
        let newStart = viewWindow.start;
        let newEnd = viewWindow.end;
        if (e.key === "ArrowLeft") {
          newStart = Math.max(0, newStart - stepNorm);
          newEnd = Math.max(newStart, newEnd - stepNorm);
        } else if (e.key === "ArrowRight") {
          newStart = Math.min(1, newStart + stepNorm);
          newEnd = Math.min(1, newEnd + stepNorm);
        } else if (e.key === "Home") {
          newStart = 0;
          newEnd = range;
        } else if (e.key === "End") {
          newEnd = 1;
          newStart = 1 - range;
        }
        const next = { start: newStart, end: newEnd };
        setViewWindow(next);
        onWindowChange?.(next);
      }
    },
    [mode, zoom, viewWindow.end, viewWindow.start, onWindowChange]
  );

  const cursorStyle = useMemo(() => {
    const zoomActive =
      mode === "visual"
        ? zoom > 1
        : viewWindow.end - viewWindow.start < 1 - epsilon;
    return zoomActive ? ("move" as const) : ("default" as const);
  }, [mode, zoom, viewWindow.end, viewWindow.start]);

  const transform = useMemo(
    () => `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    [offset.x, offset.y, zoom]
  );

  const zoomActive =
    mode === "visual"
      ? zoom > 1
      : viewWindow.end - viewWindow.start < 1 - epsilon;
  const containerClass = [
    "zoomable-container",
    zoomActive ? "zoom-active" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div style={{ width: "100%" }}>
      <ChartToolbar
        showZoom
        showFullScreen
        showDownload
        leftContent={<Title level={TitleLevel.H2}>{title}</Title>}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        disableZoomIn={!canZoomIn}
        disableZoomOut={!canZoomOut}
        onDownloadOption={(type) => {
          if (type === "png") {
            downloadChartAsPng(viewportRef.current, title);
          } else if (type === "csv") {
            if (exportContext) {
              const baseData = exportContext.dataset as (SingleDataPoint | MultiDataPoint)[];
              const slice = getCurrentSlice(baseData, viewWindow);
              const csv = buildCsv(
                slice,
                exportContext.dimensions,
                exportContext.measures
              );
              triggerFileDownload(
                csv,
                sanitizeFilename(title || "chart") + ".csv",
                "text/csv;charset=utf-8"
              );
            }
          }
        }}
      />
      <div
        ref={viewportRef}
        aria-label="Zoomable chart area"
        role="application"
        tabIndex={0}
        onKeyDown={onKeyDown}
        style={{
          position: "relative",
          width: "100%",
          height,
          overflow: "hidden",
          background: "#fff",
          borderRadius: "0 0 10px 10px",
          userSelect: isPanning ? "none" : undefined,
          cursor: cursorStyle,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onWheel={onWheel}
      >
        {mode === "visual" ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              transform,
              transformOrigin: "0 0",
              willChange: "transform",
              transition: "transform 60ms ease-out",
              cursor: cursorStyle,
            }}
          >
            <div style={{ width: "100%", height: "100%" }}>{children}</div>
          </div>
        ) : (
          <div
            className={containerClass}
            style={{ position: "absolute", inset: 0, cursor: cursorStyle }}
          >
            {renderContent ? renderContent(viewWindow) : children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoomableContainer;

// --------------------------
// Export helpers (PNG & CSV)
// --------------------------

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9\-_.]+/gi, "_").slice(0, 120);
}

function triggerFileDownload(data: string | Blob, filename: string, mime?: string) {
  const blob = typeof data === "string" ? new Blob([data], { type: mime || "application/octet-stream" }) : data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function serializeSvgToPng(svg: SVGSVGElement, filenameBase: string) {
  const rect = svg.getBoundingClientRect();
  const width = Math.ceil(rect.width || Number(svg.getAttribute("width")) || 800);
  const height = Math.ceil(rect.height || Number(svg.getAttribute("height")) || 400);

  // Clone and inline background to white for better legibility
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
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Fill background white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        triggerFileDownload(blob, sanitizeFilename(filenameBase) + ".png", "image/png");
      }
      URL.revokeObjectURL(url);
    }, "image/png");
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function findFirstSvg(root: HTMLElement | null): SVGSVGElement | null {
  if (!root) return null;
  const svg = root.querySelector("svg");
  return (svg as SVGSVGElement) || null;
}

function downloadChartAsPng(container: HTMLElement | null, title?: string) {
  const svg = findFirstSvg(container);
  if (svg) {
    serializeSvgToPng(svg, title || "chart");
  }
}

function getCurrentSlice<T>(data: T[], viewWindow: ViewWindow): T[] {
  const len = data.length;
  const from = Math.floor(viewWindow.start * len);
  const to = Math.ceil(viewWindow.end * len);
  const safeFrom = Math.max(0, Math.min(from, len - 1));
  const safeTo = Math.max(safeFrom + 1, Math.min(to, len));
  return data.slice(safeFrom, safeTo);
}

function buildCsv(
  dataset: Array<SingleDataPoint | MultiDataPoint>,
  dimensions: ChartDimension[],
  measures: ChartMeasure[]
): string {
  const dimCols = dimensions.map((d) => d.accessor);
  const measureCols = measures.map((m) => m.accessor);
  const headers = [...dimCols, ...measures.map((m) => m.label)];
  const rows = dataset.map((row) => {
    const dimVals = dimCols.map((c) => String((row as Record<string, unknown>)[c] ?? ""));
    const measVals = measureCols.map((c) => String((row as Record<string, unknown>)[c] ?? ""));
    const needsQuote = /[",\n]/;
    return [...dimVals, ...measVals]
      .map((v) => (needsQuote.test(v) ? `"${v.replace(/"/g, '""')}"` : v))
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
