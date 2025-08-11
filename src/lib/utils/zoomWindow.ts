export type ViewWindow = { start: number; end: number };

export const EPSILON = 1e-3;

export function clampWindow(start: number, end: number): ViewWindow {
  let s = start;
  let e = end;
  if (s < 0) {
    e -= s;
    s = 0;
  }
  if (e > 1) {
    s -= e - 1;
    e = 1;
  }
  return { start: Math.max(0, s), end: Math.min(1, e) };
}

export function windowAroundCenter(center: number, targetSpan: number): ViewWindow {
  const half = targetSpan / 2;
  return clampWindow(center - half, center + half);
}

export function computeTargetSpanIn(currentSpan: number, step: number, maxZoom: number): number {
  const minSpan = Math.max(0.01, 1 / maxZoom);
  const factor = 1 - step;
  return Math.max(minSpan, +(currentSpan * factor).toFixed(6));
}

export function computeTargetSpanOut(
  currentSpan: number,
  step: number,
  minZoom: number
): number {
  const maxSpan = Math.min(1, 1 / minZoom);
  const factorIn = Math.max(EPSILON, 1 - step);
  const factorOut = 1 / factorIn;
  return Math.min(1, Math.min(maxSpan, +(currentSpan * factorOut).toFixed(6)));
}

export function zoomInWindow(win: ViewWindow, step: number, maxZoom: number): ViewWindow {
  const span = win.end - win.start;
  const target = computeTargetSpanIn(span, step, maxZoom);
  const center = (win.start + win.end) / 2;
  return windowAroundCenter(center, target);
}

export function zoomOutWindow(
  win: ViewWindow,
  step: number,
  minZoom: number
): ViewWindow {
  const span = win.end - win.start;
  const target = computeTargetSpanOut(span, step, minZoom);
  const center = (win.start + win.end) / 2;
  const next = windowAroundCenter(center, target);
  if (next.end - next.start >= 1 - EPSILON) return { start: 0, end: 1 };
  return next;
}

export function shiftWindow(win: ViewWindow, delta: number): ViewWindow {
  return clampWindow(win.start + delta, win.end + delta);
}

export function deltaFromPixels(dx: number, viewportWidth: number, span: number, reverse = false): number {
  const sign = reverse ? -1 : 1;
  const width = viewportWidth || 1;
  return sign * (dx / width) * span;
}

export function stepNormFromPx(stepPx: number, viewportWidth: number, span: number): number {
  const width = viewportWidth || 1;
  return (stepPx / width) * span;
}

