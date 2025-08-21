import {
  EPSILON,
  clampWindow,
  windowAroundCenter,
  computeTargetSpanIn,
  computeTargetSpanOut,
  zoomInWindow,
  zoomOutWindow,
  shiftWindow,
  deltaFromPixels,
  snapWindowSpanToCount,
  type ViewWindow,
} from '@/lib/utils/zoomWindow';

describe('zoomWindow utils', () => {
  describe('clampWindow', () => {
    it('clamps negative start to 0 and shifts end accordingly', () => {
      expect(clampWindow(-0.2, 0.5)).toEqual({ start: 0, end: 0.7 });
    });

    it('clamps end > 1 and shifts start accordingly', () => {
      expect(clampWindow(0.5, 1.3)).toEqual({ start: 0.2, end: 1 });
    });

    it('handles both bounds out of range', () => {
      expect(clampWindow(-0.1, 1.2)).toEqual({ start: 0, end: 1 });
    });
  });

  describe('windowAroundCenter', () => {
    it('creates a window clamped to bounds', () => {
      expect(windowAroundCenter(0.5, 0.4)).toEqual({ start: 0.3, end: 0.7 });
      expect(windowAroundCenter(0.05, 0.2)).toEqual({ start: 0, end: 0.2 });
      expect(windowAroundCenter(0.95, 0.3)).toEqual({ start: 0.8, end: 1 });
    });
  });

  describe('compute target spans', () => {
    it('computeTargetSpanIn respects maxZoom minimum span', () => {
      const minSpan = Math.max(0.01, 1 / 10);
      expect(computeTargetSpanIn(1, 0.5, 10)).toBeCloseTo(
        Math.max(minSpan, 0.5)
      );
    });

    it('computeTargetSpanOut respects minZoom maximum span', () => {
      const span = computeTargetSpanOut(0.2, 0.4, 2);
      expect(span).toBeLessThanOrEqual(1);
      expect(span).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe('zoom in/out', () => {
    const win: ViewWindow = { start: 0.2, end: 0.8 };

    it('zoomInWindow shrinks span around center', () => {
      const next = zoomInWindow(win, 0.4, 5);
      expect(next.end - next.start).toBeLessThan(win.end - win.start);
      expect((next.start + next.end) / 2).toBeCloseTo(
        (win.start + win.end) / 2
      );
    });

    it('zoomOutWindow expands span and snaps to full when near 1', () => {
      const almostFull: ViewWindow = { start: EPSILON, end: 1 - EPSILON };
      const next = zoomOutWindow(almostFull, 0.9, 1);
      expect(next).toEqual({ start: 0, end: 1 });
    });

    it('zoomOutWindow expands span without snapping when far from full', () => {
      const small: ViewWindow = { start: 0.2, end: 0.3 }; // span 0.1
      const next = zoomOutWindow(small, 0.1, 1); // mild expansion
      expect(next.end - next.start).toBeGreaterThan(small.end - small.start);
      expect(next).not.toEqual({ start: 0, end: 1 });
    });
  });

  describe('shift & delta', () => {
    it('shiftWindow moves the window and clamps bounds', () => {
      expect(shiftWindow({ start: 0.2, end: 0.4 }, 0.3)).toEqual({
        start: 0.5,
        end: 0.7,
      });
      expect(shiftWindow({ start: 0.9, end: 1.1 }, 0.2)).toEqual({
        start: 1 - 0.2,
        end: 1,
      });
    });

    it('deltaFromPixels converts pixels to domain delta and respects reverse flag', () => {
      const span = 0.5;
      const width = 200;
      expect(deltaFromPixels(100, width, span)).toBeCloseTo(0.25);
      expect(deltaFromPixels(100, width, span, true)).toBeCloseTo(-0.25);
      // zero width safely handled
      expect(deltaFromPixels(50, 0 as unknown as number, span)).toBeCloseTo(
        0.25
      );
    });
  });

  describe('snapWindowSpanToCount', () => {
    it('snaps the span to an integer count of items based on data length', () => {
      const win: ViewWindow = { start: 0.1, end: 0.6 }; // span 0.5
      const snapped = snapWindowSpanToCount(win, 7);
      const snappedSpan = snapped.end - snapped.start;
      // snappedSpan * length should be close to an integer
      const count = snappedSpan * 7;
      expect(Math.abs(Math.round(count) - count)).toBeLessThan(1e-6);
    });
  });
});
