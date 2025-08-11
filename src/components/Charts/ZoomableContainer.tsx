"use client";

import React from "react";
import ChartToolbar from "@/components/Charts/ChartToolbar";
import { useRouter } from "next/navigation";
import { FULL_SCREEN_CHART } from "@/lib/constants/routes/Dashboard";
import { Title } from "@ui5/webcomponents-react";
import TitleLevel from "@ui5/webcomponents/dist/types/TitleLevel.js";
import {
  ChartDimension,
  ChartMeasure,
  MultiDataPoint,
  SingleDataPoint,
  ChartSeries,
} from "@/lib/types/charts";
import { useZoomable } from "@/hooks/charts/useZoomable";
import {
  buildCsv,
  downloadChartAsPng,
  getCurrentSlice,
  sanitizeFilename,
  triggerFileDownload,
} from "@/lib/utils/chartExport";

interface ZoomableContainerProps {
  children: React.ReactNode;
  height?: number; // px
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  className?: string;
  mode?: "visual" | "dataX"; // visual = CSS scale/pan, dataX = update window [start,end]
  onWindowChange?: (window: { start: number; end: number }) => void;
  renderContent?: (viewWindow: {
    start: number;
    end: number;
  }) => React.ReactNode;
  title?: string;
  chartIdForFullscreen?: string;
  exportContext?: {
    dataset: SingleDataPoint[] | MultiDataPoint[];
    dimensions: ChartDimension[];
    measures: ChartMeasure[];
    isMulti?: boolean;
    seriesData?: ChartSeries[];
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
  chartIdForFullscreen,
}) => {
  const router = useRouter();

  const {
    viewportRef,
    viewWindow,
    isPanning,
    cursorStyle,
    transform,
    zoomActive,
    canZoomIn,
    canZoomOut,
    onMouseDown,
    onMouseMove,
    endPan,
    onWheel,
    handleZoomIn,
    handleZoomOut,
  } = useZoomable({ mode, minZoom, maxZoom, step, onWindowChange });

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
        showFullScreen={Boolean(chartIdForFullscreen)}
        showDownload
        leftContent={<Title level={TitleLevel.H2}>{title}</Title>}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        disableZoomIn={!canZoomIn}
        disableZoomOut={!canZoomOut}
        onFullScreenClick={() => {
          if (!chartIdForFullscreen) return;
          router.push(FULL_SCREEN_CHART(chartIdForFullscreen));
        }}
        onDownloadOption={(type) => {
          if (type === "png") {
            downloadChartAsPng(viewportRef.current, title);
          } else if (type === "csv") {
            if (exportContext) {
              const baseData = exportContext.dataset as (
                | SingleDataPoint
                | MultiDataPoint
              )[];
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

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        ref={viewportRef}
        aria-label="Zoomable chart area"
        role="application"
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
