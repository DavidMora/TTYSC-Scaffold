'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  EPSILON,
  deltaFromPixels,
  shiftWindow,
  zoomInWindow,
  zoomOutWindow,
  snapWindowSpanToCount,
} from '@/lib/utils/zoomWindow';
import type { ViewWindow } from '@/lib/utils/zoomWindow';

export interface UseZoomableOptions {
  mode?: 'visual' | 'dataX';
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  onWindowChange?: (window: ViewWindow) => void;
  dataLength?: number;
  dataAxis?: 'x' | 'y';
}

export function useZoomable({
  mode = 'visual',
  minZoom = 1,
  maxZoom = 5,
  step = 0.4,
  onWindowChange,
  dataLength,
  dataAxis = 'x',
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
    windowAtStart?: ViewWindow;
  } | null>(null);
  const [viewWindow, setViewWindow] = useState<ViewWindow>({
    start: 0,
    end: 1,
  });
  const rafIdRef = useRef<number | null>(null);
  const pendingWindowRef = useRef<ViewWindow | null>(null);
  const panRafIdRef = useRef<number | null>(null);
  const pendingOffsetRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (panRafIdRef.current != null) {
        cancelAnimationFrame(panRafIdRef.current);
      }
      pendingWindowRef.current = null;
      pendingOffsetRef.current = null;
    };
  }, []);

  const span = viewWindow.end - viewWindow.start;
  const dataZoom = 1 / Math.max(span, EPSILON);

  const hasMultipleItems = (dataLength ?? 2) > 1;
  const visibleCount = useMemo(() => {
    if (!dataLength) return null;
    return Math.max(1, Math.round(span * dataLength));
  }, [span, dataLength]);
  const canZoomIn = useMemo(() => {
    if (!hasMultipleItems) return false;
    if (visibleCount !== null && visibleCount <= 2) return false;
    if (mode === 'visual') return zoom < maxZoom - EPSILON;
    let next = zoomInWindow(viewWindow, step, maxZoom);
    if (dataLength) next = snapWindowSpanToCount(next, dataLength);
    const changed =
      Math.abs(next.start - viewWindow.start) > EPSILON ||
      Math.abs(next.end - viewWindow.end) > EPSILON;
    return changed && dataZoom < maxZoom - EPSILON;
  }, [
    hasMultipleItems,
    visibleCount,
    mode,
    zoom,
    maxZoom,
    viewWindow,
    step,
    dataLength,
    dataZoom,
  ]);

  const canZoomOut = useMemo(() => {
    if (!hasMultipleItems) return false;
    if (mode === 'visual') return zoom > minZoom + EPSILON;
    let next = zoomOutWindow(viewWindow, step, minZoom);
    if (dataLength) next = snapWindowSpanToCount(next, dataLength);
    const changed =
      Math.abs(next.start - viewWindow.start) > EPSILON ||
      Math.abs(next.end - viewWindow.end) > EPSILON;
    return changed && dataZoom > minZoom + EPSILON;
  }, [
    hasMultipleItems,
    mode,
    zoom,
    minZoom,
    viewWindow,
    step,
    dataLength,
    dataZoom,
  ]);

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

  // Helpers to lower cognitive complexity of wheel handling
  const commitWindow = useCallback(
    (next: ViewWindow) => {
      setViewWindow(next);
      onWindowChange?.(next);
    },
    [onWindowChange]
  );

  const snapIfNeeded = useCallback(
    (win: ViewWindow) =>
      dataLength ? snapWindowSpanToCount(win, dataLength) : win,
    [dataLength]
  );

  const panWindow = useCallback(
    (pixelDelta: number, viewportSize: number, spanAtStart: number) => {
      const delta = -deltaFromPixels(pixelDelta, viewportSize, spanAtStart);
      let next = shiftWindow(viewWindow, delta);
      next = snapIfNeeded(next);
      commitWindow(next);
    },
    [viewWindow, snapIfNeeded, commitWindow]
  );

  const zoomWithCtrl = useCallback(
    (deltaY: number) => {
      if (deltaY < 0 && visibleCount !== null && visibleCount <= 2) return;
      let next =
        deltaY < 0
          ? zoomInWindow(viewWindow, step, maxZoom)
          : zoomOutWindow(viewWindow, step, minZoom);
      next = snapIfNeeded(next);
      commitWindow(next);
    },
    [
      viewWindow,
      step,
      maxZoom,
      minZoom,
      snapIfNeeded,
      commitWindow,
      visibleCount,
    ]
  );

  const shouldPanHorizontally = useCallback((e: React.WheelEvent) => {
    const hasHorizontalDelta = Math.abs(e.deltaX) > 0;
    return hasHorizontalDelta || e.shiftKey;
  }, []);

  const shouldPanVertically = useCallback((e: React.WheelEvent) => {
    const hasVerticalDelta = Math.abs(e.deltaY) > 0;
    return hasVerticalDelta || e.shiftKey;
  }, []);

  const pixelDeltaForX = useCallback((e: React.WheelEvent) => {
    const hasHorizontalDelta = Math.abs(e.deltaX) > 0;
    return hasHorizontalDelta ? e.deltaX : e.deltaY;
  }, []);

  const pixelDeltaForY = useCallback((e: React.WheelEvent) => {
    const hasVerticalDelta = Math.abs(e.deltaY) > 0;
    return hasVerticalDelta ? e.deltaY : e.deltaX;
  }, []);

  const handleZoomIn = useCallback(() => {
    if (mode === 'visual') {
      setZoom((z) => {
        const next = Math.min(maxZoom, z + step);
        const bounded = next <= 1 + EPSILON ? 1 : +next.toFixed(6);
        setOffset((prev) => clampOffsetToBounds(prev, bounded));
        return bounded;
      });
      return;
    }
    setViewWindow((w) => {
      let next = zoomInWindow(w, step, maxZoom);
      if (dataLength) {
        next = snapWindowSpanToCount(next, dataLength);
      }
      // Ensure a change happened; if not, force a tiny nudge inwards
      if (Math.abs(next.end - next.start - (w.end - w.start)) < EPSILON) {
        const center = (w.start + w.end) / 2;
        const tiny = Math.min(0.001, (w.end - w.start) * 0.01);
        const forced: ViewWindow = {
          start: Math.max(0, center - (w.end - w.start - tiny) / 2),
          end: Math.min(1, center + (w.end - w.start - tiny) / 2),
        };
        const snapped = dataLength
          ? snapWindowSpanToCount(forced, dataLength)
          : forced;
        onWindowChange?.(snapped);
        return snapped;
      }
      onWindowChange?.(next);
      return next;
    });
  }, [mode, maxZoom, step, onWindowChange, clampOffsetToBounds, dataLength]);

  const handleZoomOut = useCallback(() => {
    if (mode === 'visual') {
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
      let next = zoomOutWindow(w, step, minZoom);
      if (dataLength) {
        next = snapWindowSpanToCount(next, dataLength);
      }
      // Ensure a change happened; if not, force a tiny nudge outwards
      if (Math.abs(next.end - next.start - (w.end - w.start)) < EPSILON) {
        const span = Math.min(1, (w.end - w.start) * (1 + step * 0.5));
        const center = (w.start + w.end) / 2;
        const half = span / 2;
        const forced: ViewWindow = {
          start: Math.max(0, center - half),
          end: Math.min(1, center + half),
        };
        const snapped = dataLength
          ? snapWindowSpanToCount(forced, dataLength)
          : forced;
        onWindowChange?.(snapped);
        return snapped;
      }
      onWindowChange?.(next);
      return next;
    });
  }, [mode, minZoom, step, onWindowChange, clampOffsetToBounds, dataLength]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode === 'visual' && zoom <= 1) return;
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
        windowAtStart: mode === 'dataX' ? { ...viewWindow } : undefined,
      };
    },
    [mode, zoom, offset.x, offset.y, viewWindow]
  );

  const handleMouseMoveVisual = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const panStart = panStartRef.current;
      if (!panStart) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      const proposed = { x: panStart.ox + dx, y: panStart.oy + dy };
      pendingOffsetRef.current = clampOffsetToBounds(proposed, zoom);
      panRafIdRef.current ??= requestAnimationFrame(() => {
        panRafIdRef.current = null;
        if (pendingOffsetRef.current) {
          setOffset(pendingOffsetRef.current);
          pendingOffsetRef.current = null;
        }
      });
    },
    [clampOffsetToBounds, zoom]
  );

  const handleMouseMoveDataX = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hasMultipleItems) return;
      const panStart = panStartRef.current;
      if (!panStart) return;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const startWin = panStart.windowAtStart;
      if (!startWin) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      const rangeAtStart = startWin.end - startWin.start;
      if (rangeAtStart >= 1 - 1e-6) return;
      const pixelDelta = dataAxis === 'x' ? dx : dy;
      const viewportSize =
        dataAxis === 'x'
          ? viewport.clientWidth || 1
          : viewport.clientHeight || 1;
      const delta = -deltaFromPixels(pixelDelta, viewportSize, rangeAtStart);
      let next = shiftWindow(startWin, delta);
      if (dataLength) next = snapWindowSpanToCount(next, dataLength);
      scheduleWindowUpdate(next);
    },
    [hasMultipleItems, dataAxis, dataLength, scheduleWindowUpdate]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (mode === 'visual') return handleMouseMoveVisual(e);
      if (mode === 'dataX') return handleMouseMoveDataX(e);
    },
    [mode, handleMouseMoveVisual, handleMouseMoveDataX]
  );

  const endPan = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  const handleWheelVisual = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (zoom <= 1) return;
      e.preventDefault();
      const proposed = (prev: { x: number; y: number }) =>
        clampOffsetToBounds(
          { x: prev.x - e.deltaX, y: prev.y - e.deltaY },
          zoom
        );
      const next = proposed({ x: offset.x, y: offset.y });
      pendingOffsetRef.current = next;
      panRafIdRef.current ??= requestAnimationFrame(() => {
        panRafIdRef.current = null;
        if (pendingOffsetRef.current) {
          setOffset(pendingOffsetRef.current);
          pendingOffsetRef.current = null;
        }
      });
    },
    [zoom, clampOffsetToBounds, offset.x, offset.y]
  );

  const handleWheelDataX = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (!hasMultipleItems) return;
      const viewport = viewportRef.current;
      if (!viewport) return;
      const span = viewWindow.end - viewWindow.start;

      if (e.ctrlKey) {
        e.preventDefault();
        zoomWithCtrl(e.deltaY);
        return;
      }

      if (span >= 1 - 1e-6) return;
      if (dataAxis === 'x') {
        if (!shouldPanHorizontally(e)) return;
        const pixelDx = pixelDeltaForX(e);
        if (pixelDx === 0) return;
        e.preventDefault();
        panWindow(pixelDx, viewport.clientWidth || 1, span);
        return;
      }

      if (!shouldPanVertically(e)) return;
      const pixelDy = pixelDeltaForY(e);
      if (pixelDy === 0) return;
      e.preventDefault();
      panWindow(pixelDy, viewport.clientHeight || 1, span);
    },
    [
      hasMultipleItems,
      viewWindow,
      zoomWithCtrl,
      dataAxis,
      panWindow,
      shouldPanHorizontally,
      shouldPanVertically,
      pixelDeltaForX,
      pixelDeltaForY,
    ]
  );

  const onWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (mode === 'visual') return handleWheelVisual(e);
      if (mode === 'dataX') return handleWheelDataX(e);
    },
    [mode, handleWheelVisual, handleWheelDataX]
  );

  const zoomActive = useMemo(
    () =>
      mode === 'visual'
        ? zoom > 1
        : hasMultipleItems && viewWindow.end - viewWindow.start < 1 - EPSILON,
    [mode, zoom, viewWindow.end, viewWindow.start, hasMultipleItems]
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
