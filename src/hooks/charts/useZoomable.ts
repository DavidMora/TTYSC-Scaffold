"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  EPSILON,
  deltaFromPixels,
  shiftWindow,
  stepNormFromPx,
  zoomInWindow,
  zoomOutWindow,
} from "@/lib/utils/zoomWindow";
import type { ViewWindow } from "@/lib/utils/zoomWindow";

export interface UseZoomableOptions {
  mode?: "visual" | "dataX";
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onWindowChange?: (window: ViewWindow) => void;
}

export function useZoomable({
  mode = "visual",
  minZoom = 1,
  maxZoom = 5,
  step = 0.4,
  onWindowChange,
}: UseZoomableOptions = {}) {
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

  const span = viewWindow.end - viewWindow.start;
  const dataZoom = 1 / Math.max(span, EPSILON);

  const canZoomIn =
    mode === "visual" ? zoom < maxZoom - EPSILON : dataZoom < maxZoom - EPSILON;
  const canZoomOut =
    mode === "visual" ? zoom > minZoom + EPSILON : dataZoom > minZoom + EPSILON;

  const scheduleWindowUpdate = useCallback(
    (next: ViewWindow) => {
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
    },
    [onWindowChange]
  );

  const handleZoomIn = useCallback(() => {
    if (mode === "visual") {
      setZoom((z) => Math.min(maxZoom, +(z + step).toFixed(3)));
      return;
    }
    setViewWindow((w) => {
      const next = zoomInWindow(w, step, maxZoom);
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
    setViewWindow((w) => {
      const next = zoomOutWindow(w, step, minZoom);
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
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return;
        const delta = -deltaFromPixels(dx, viewport.clientWidth || 1, range);
        const next = shiftWindow(viewWindow, delta);
        scheduleWindowUpdate(next);
      }
    },
    [isPanning, mode, viewWindow, scheduleWindowUpdate]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (mode === "visual") {
        if (zoom <= 1) return;
        e.preventDefault();
        setOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        return;
      }
      if (mode === "dataX") {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return;
        e.preventDefault();
        const delta = deltaFromPixels(e.deltaX, viewport.clientWidth || 1, range);
        const next = shiftWindow(viewWindow, delta);
        scheduleWindowUpdate(next);
      }
    },
    [mode, zoom, viewWindow, scheduleWindowUpdate]
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
              return prev;
            default:
              return prev;
          }
        });
        return;
      }
      if (mode === "dataX") {
        const range = viewWindow.end - viewWindow.start;
        if (range >= 1 - 1e-6) return;
        const stepNorm = stepNormFromPx(
          stepPx,
          viewportRef.current?.clientWidth || 1,
          range
        );
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
        const next = { start: newStart, end: newEnd } as ViewWindow;
        setViewWindow(next);
        onWindowChange?.(next);
      }
    },
    [mode, zoom, viewWindow.end, viewWindow.start, onWindowChange]
  );

  const zoomActive = useMemo(
    () =>
      mode === "visual"
        ? zoom > 1
        : viewWindow.end - viewWindow.start < 1 - EPSILON,
    [mode, zoom, viewWindow.end, viewWindow.start]
  );

  const cursorStyle = useMemo(
    () => (zoomActive ? ("move" as const) : ("default" as const)),
    [zoomActive]
  );

  const transform = useMemo(
    () => `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
    [offset.x, offset.y, zoom]
  );

  // zoomActive computed above

  return {
    // state
    viewportRef,
    zoom,
    offset,
    isPanning,
    viewWindow,
    // derived
    cursorStyle,
    transform,
    zoomActive,
    canZoomIn,
    canZoomOut,
    // handlers
    handleZoomIn,
    handleZoomOut,
    onMouseDown,
    onMouseMove,
    endPan,
    onWheel,
    onKeyDown,
  } as const;
}
