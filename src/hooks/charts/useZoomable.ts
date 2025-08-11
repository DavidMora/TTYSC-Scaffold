"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  EPSILON,
  deltaFromPixels,
  shiftWindow,
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

  const clampOffsetToBounds = useCallback(
    (proposed: { x: number; y: number }, currentZoom: number) => {
      const viewport = viewportRef.current;
      if (!viewport) return proposed;
      const viewportWidth = viewport.clientWidth || 0;
      const viewportHeight = viewport.clientHeight || 0;
      const scaledWidth = viewportWidth * currentZoom;
      const scaledHeight = viewportHeight * currentZoom;
      const minX = Math.min(0, viewportWidth - scaledWidth);
      const minY = Math.min(0, viewportHeight - scaledHeight);
      const clampedX = Math.min(0, Math.max(minX, proposed.x));
      const clampedY = Math.min(0, Math.max(minY, proposed.y));
      return { x: clampedX, y: clampedY };
    },
    []
  );

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
      setZoom((z) => {
        const next = Math.min(maxZoom, z + step);
        const bounded = next <= 1 + EPSILON ? 1 : +next.toFixed(6);
        setOffset((prev) => clampOffsetToBounds(prev, bounded));
        return bounded;
      });
      return;
    }
    setViewWindow((w) => {
      const next = zoomInWindow(w, step, maxZoom);
      // Ensure a change happened; if not, force a tiny nudge inwards
      if (Math.abs(next.end - next.start - (w.end - w.start)) < EPSILON) {
        const center = (w.start + w.end) / 2;
        const tiny = Math.min(0.001, (w.end - w.start) * 0.01);
        const forced: ViewWindow = {
          start: Math.max(0, center - (w.end - w.start - tiny) / 2),
          end: Math.min(1, center + (w.end - w.start - tiny) / 2),
        };
        onWindowChange?.(forced);
        return forced;
      }
      onWindowChange?.(next);
      return next;
    });
  }, [mode, maxZoom, step, onWindowChange, clampOffsetToBounds]);

  const handleZoomOut = useCallback(() => {
    if (mode === "visual") {
      setZoom((z) => {
        const next = Math.max(minZoom, z - step);
        const bounded = +next.toFixed(6);
        if (bounded <= 1 + EPSILON) {
          setOffset({ x: 0, y: 0 });
          return 1;
        }
        setOffset((prev) => clampOffsetToBounds(prev, bounded));
        return bounded;
      });
      return;
    }
    setViewWindow((w) => {
      const next = zoomOutWindow(w, step, minZoom);
      // Ensure a change happened; if not, force a tiny nudge outwards
      if (Math.abs(next.end - next.start - (w.end - w.start)) < EPSILON) {
        const span = Math.min(1, (w.end - w.start) * (1 + step * 0.5));
        const center = (w.start + w.end) / 2;
        const half = span / 2;
        const forced: ViewWindow = {
          start: Math.max(0, center - half),
          end: Math.min(1, center + half),
        };
        onWindowChange?.(forced);
        return forced;
      }
      onWindowChange?.(next);
      return next;
    });
  }, [mode, minZoom, step, onWindowChange, clampOffsetToBounds]);

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
        const proposed = {
          x: panStartRef.current.ox + dx,
          y: panStartRef.current.oy + dy,
        };
        setOffset(clampOffsetToBounds(proposed, zoom));
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
    [
      isPanning,
      mode,
      viewWindow,
      scheduleWindowUpdate,
      clampOffsetToBounds,
      zoom,
    ]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (mode !== "visual") return;
      if (zoom <= 1) return;
      e.preventDefault();
      setOffset((prev) =>
        clampOffsetToBounds(
          { x: prev.x - e.deltaX, y: prev.y - e.deltaY },
          zoom
        )
      );
    },
    [mode, zoom, clampOffsetToBounds]
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
  } as const;
}
