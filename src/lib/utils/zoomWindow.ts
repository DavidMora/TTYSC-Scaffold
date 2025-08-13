export type ViewWindow = { start: number; end: number };

export const EPSILON = 1e-3;

function roundTo(value: number, decimals = 9): number {
  return Number(value.toFixed(decimals));
}

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
  const clampedStart = Math.max(0, s);
  const clampedEnd = Math.min(1, e);
  return { start: roundTo(clampedStart), end: roundTo(clampedEnd) };
}

export function windowAroundCenter(
  center: number,
  targetSpan: number
): ViewWindow {
  if (targetSpan >= 1 - EPSILON) return { start: 0, end: 1 };
  const half = targetSpan / 2;
  const startRaw = center - half;
  const start = Math.max(0, startRaw);
  const end = Math.min(1, start + targetSpan);
  return { start: roundTo(start), end: roundTo(end) };
}

export function computeTargetSpanIn(
  currentSpan: number,
  step: number,
  maxZoom: number
): number {
  const minSpan = Math.max(0.01, 1 / maxZoom);
  const factor = 1 - step;
  return Math.max(minSpan, currentSpan * factor);
}

export function computeTargetSpanOut(
  currentSpan: number,
  step: number,
  minZoom: number
): number {
  const maxSpan = Math.min(1, 1 / minZoom);
  const factorIn = Math.max(EPSILON, 1 - step);
  const factorOut = 1 / factorIn;
  return Math.min(1, Math.min(maxSpan, currentSpan * factorOut));
}

export function zoomInWindow(
  win: ViewWindow,
  step: number,
  maxZoom: number
): ViewWindow {
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

export function deltaFromPixels(
  dx: number,
  viewportWidth: number,
  span: number,
  reverse = false
): number {
  const sign = reverse ? -1 : 1;
  const width = viewportWidth > 0 ? viewportWidth : 100; // sensible fallback for tests
  return sign * (dx / width) * span;
}

export function snapWindowSpanToCount(
  win: ViewWindow,
  dataLength: number
): ViewWindow {
  const length = Math.max(1, Math.floor(dataLength));
  const center = (win.start + win.end) / 2;
  const currentSpan = Math.max(EPSILON, win.end - win.start);
  const desiredCount = Math.max(1, Math.round(currentSpan * length));
  const snappedSpan = desiredCount / length;
  return windowAroundCenter(center, snappedSpan);
}
