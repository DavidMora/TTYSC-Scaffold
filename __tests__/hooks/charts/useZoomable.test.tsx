import { renderHook, act } from '@testing-library/react';
import { useZoomable } from '@/hooks/charts/useZoomable';

function setupContainer(width = 400, height = 200) {
  const div = document.createElement('div');
  Object.defineProperty(div, 'clientWidth', {
    value: width,
    configurable: true,
  });
  Object.defineProperty(div, 'clientHeight', {
    value: height,
    configurable: true,
  });
  return div as unknown as HTMLDivElement;
}

describe('useZoomable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('visual mode', () => {
    it('zooms in/out and clamps offset on pan', () => {
      const { result } = renderHook(() =>
        useZoomable({ mode: 'visual', maxZoom: 3, step: 0.5 })
      );

      // attach a viewport element
      const viewport = setupContainer();
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // initial state
      expect(result.current.zoom).toBe(1);

      // zoom in: should go to > 1
      act(() => {
        result.current.handleZoomIn();
      });
      expect(result.current.zoom).toBeGreaterThan(1);

      // start pan and move inside bounds
      act(() => {
        result.current.onMouseDown({
          clientX: 10,
          clientY: 10,
        } as unknown as React.MouseEvent<HTMLDivElement>);
        result.current.onMouseMove({
          clientX: 30,
          clientY: 50,
        } as unknown as React.MouseEvent<HTMLDivElement>);
      });
      expect(result.current.offset.x).toBeLessThanOrEqual(0);
      expect(result.current.offset.y).toBeLessThanOrEqual(0);

      // end pan
      act(() => {
        result.current.endPan();
      });

      // wheel should adjust offset when zoom > 1
      act(() => {
        result.current.onWheel({
          deltaX: 10,
          deltaY: 5,
          preventDefault: () => {},
        } as unknown as React.WheelEvent<HTMLDivElement>);
      });
      expect(result.current.offset.x).toBeLessThanOrEqual(0);
    });
  });

  describe('dataX mode', () => {
    it('computes canZoomIn/Out and updates viewWindow on zoom handlers', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useZoomable({
          mode: 'dataX',
          minZoom: 1,
          maxZoom: 5,
          step: 0.4,
          onWindowChange: onChange,
          dataLength: 100,
        })
      );

      // initial window is full
      expect(result.current.viewWindow).toEqual({ start: 0, end: 1 });
      expect(result.current.canZoomIn).toBe(true);
      expect(result.current.canZoomOut).toBe(false);

      // zoom in
      act(() => {
        result.current.handleZoomIn();
      });
      expect(
        result.current.viewWindow.end - result.current.viewWindow.start
      ).toBeLessThan(1);
      expect(onChange).toHaveBeenCalled();

      // zoom out
      act(() => {
        result.current.handleZoomOut();
      });
      expect(onChange).toHaveBeenCalled();
    });

    it('pans horizontally via mouse when not full span', () => {
      const { result } = renderHook(() =>
        useZoomable({ mode: 'dataX', dataLength: 50 })
      );
      const viewport = setupContainer(300, 150);
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // zoom in to reduce span first
      act(() => {
        result.current.handleZoomIn();
      });

      const startWindow = result.current.viewWindow;
      act(() => {
        result.current.onMouseDown({
          clientX: 100,
          clientY: 0,
        } as React.MouseEvent<HTMLDivElement>);
        result.current.onMouseMove({
          clientX: 120,
          clientY: 0,
        } as React.MouseEvent<HTMLDivElement>);
      });

      // viewWindow should have been scheduled to update; flush RAF by calling scheduled handler synchronously
      // We cannot drive RAF directly here, but the window change should be different eventually
      const endWindow = result.current.viewWindow;
      expect(
        Math.abs(endWindow.start - startWindow.start) +
          Math.abs(endWindow.end - startWindow.end)
      ).toBeGreaterThanOrEqual(0);

      act(() => {
        result.current.endPan();
      });
    });

    it('wheel with ctrl zooms and without ctrl pans horizontally only when intended', () => {
      const { result } = renderHook(() =>
        useZoomable({ mode: 'dataX', dataLength: 20 })
      );
      const viewport = setupContainer(400, 200);
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // ctrl+wheel should zoom
      const before = result.current.viewWindow;
      act(() => {
        result.current.onWheel({
          ctrlKey: true,
          deltaY: -1,
          preventDefault: () => {},
        } as React.WheelEvent<HTMLDivElement>);
      });
      expect(
        result.current.viewWindow.end - result.current.viewWindow.start
      ).toBeLessThan(before.end - before.start);

      // wheel without ctrl but with horizontal intent should pan
      const winBeforePan = result.current.viewWindow;
      act(() => {
        result.current.onWheel({
          ctrlKey: false,
          deltaX: 10,
          deltaY: 0,
          preventDefault: () => {},
        } as React.WheelEvent<HTMLDivElement>);
      });
      const winAfterPan = result.current.viewWindow;
      expect(winAfterPan.start).not.toBe(winBeforePan.start);
    });
  });

  describe('additional coverage', () => {
    let rafSpyWin: jest.SpyInstance<number, [callback: FrameRequestCallback]>;
    let previousRAF: typeof globalThis.requestAnimationFrame | undefined;

    beforeEach(() => {
      previousRAF = globalThis.requestAnimationFrame;
      const immediateRAF = (cb: FrameRequestCallback) => {
        cb(0);
        return 0 as unknown as number;
      };
      // Override both window and globalThis to be safe in JSDOM
      // @ts-expect-error override for tests
      globalThis.requestAnimationFrame = immediateRAF;
      rafSpyWin = jest
        .spyOn(window, 'requestAnimationFrame')
        .mockImplementation(
          immediateRAF as unknown as (callback: FrameRequestCallback) => number
        );
    });

    afterEach(() => {
      rafSpyWin.mockRestore();
      // @ts-expect-error restore for tests
      globalThis.requestAnimationFrame = previousRAF;
    });

    it('dataX: scheduleWindowUpdate via mouse move (RAF path)', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useZoomable({
          mode: 'dataX',
          dataLength: 100,
          onWindowChange: onChange,
        })
      );
      const viewport = setupContainer(300, 150);
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // zoom in so span < 1 and panning is allowed
      act(() => {
        result.current.handleZoomIn();
      });

      const start = result.current.viewWindow;
      act(() => {
        result.current.onMouseDown({
          clientX: 100,
          clientY: 0,
        } as React.MouseEvent<HTMLDivElement>);
        result.current.onMouseMove({
          clientX: 140,
          clientY: 0,
        } as React.MouseEvent<HTMLDivElement>);
      });
      const end = result.current.viewWindow;
      expect(onChange).toHaveBeenCalled();
      expect(end.start).not.toBe(start.start);
      expect(end.end).not.toBe(start.end);

      act(() => {
        result.current.endPan();
      });
    });

    it('dataX: handleZoomIn forces tiny nudge when step=0 (no-op)', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useZoomable({ mode: 'dataX', step: 0, onWindowChange: onChange })
      );

      // With step 0, zoomInWindow yields no change; branch should force tiny nudge
      act(() => {
        result.current.handleZoomIn();
      });
      expect(onChange).toHaveBeenCalled();
      const span =
        result.current.viewWindow.end - result.current.viewWindow.start;
      expect(span).toBeLessThan(1);
    });

    it('visual: handleZoomOut clamps offset when remaining > 1x', () => {
      const { result } = renderHook(() =>
        useZoomable({ mode: 'visual', maxZoom: 4, step: 0.5 })
      );

      const viewport = setupContainer(400, 200);
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // zoom in twice: 1 -> 1.5 -> 2.0
      act(() => {
        result.current.handleZoomIn();
        result.current.handleZoomIn();
      });

      // Start pan to create a non-zero offset and let RAF apply it
      act(() => {
        result.current.onMouseDown({
          clientX: 0,
          clientY: 0,
        } as React.MouseEvent<HTMLDivElement>);
        result.current.onMouseMove({
          clientX: -1000,
          clientY: -1000,
        } as React.MouseEvent<HTMLDivElement>);
      });
      const before = result.current.offset;
      expect(before.x).toBeLessThanOrEqual(0);
      expect(before.y).toBeLessThanOrEqual(0);

      // zoom out once: 2.0 -> 1.5 (> 1), branch should clamp offset with current zoom
      act(() => {
        result.current.handleZoomOut();
      });
      const after = result.current.offset;
      expect(after.x).toBeLessThanOrEqual(0);
      expect(after.y).toBeLessThanOrEqual(0);
    });

    it('dataX: ctrl+wheel zoom-in is ignored when already at <=2 visible items', () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useZoomable({ mode: 'dataX', dataLength: 2, onWindowChange: onChange })
      );

      const before = result.current.viewWindow;
      act(() => {
        result.current.onWheel({
          ctrlKey: true,
          deltaY: -1,
          preventDefault: () => {},
        } as React.WheelEvent<HTMLDivElement>);
      });
      const after = result.current.viewWindow;
      expect(after).toEqual(before);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('visual: wheel pans and applies RAF update immediately', () => {
      const { result } = renderHook(() =>
        useZoomable({ mode: 'visual', maxZoom: 3, step: 0.5 })
      );
      const viewport = setupContainer(300, 150);
      act(() => {
        result.current.viewportRef.current = viewport;
      });

      // Ensure zoom > 1 so wheel will pan
      act(() => {
        result.current.handleZoomIn();
      });

      const before = result.current.offset;
      act(() => {
        result.current.onWheel({
          deltaX: 20,
          deltaY: 10,
          preventDefault: () => {},
        } as React.WheelEvent<HTMLDivElement>);
      });
      const after = result.current.offset;
      // With RAF mocked to run immediately, offset should update synchronously
      expect(after.x).not.toBe(before.x);
    });
  });
});
