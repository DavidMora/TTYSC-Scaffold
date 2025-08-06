import React from "react";
import { render, screen, act, renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  RawDataModalProvider,
  useRawDataModal,
} from "@/contexts/RawDataModalContext";

const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

describe("RawDataModalContext", () => {
  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe("RawDataModalProvider", () => {
    it("should render children correctly", () => {
      render(
        <RawDataModalProvider>
          <div data-testid="test-child">Test Child</div>
        </RawDataModalProvider>
      );

      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });

    it("should provide context value to children", () => {
      const TestComponent = () => {
        const { isOpen, open, close } = useRawDataModal();
        return (
          <div>
            <span data-testid="is-open">{isOpen ? "open" : "closed"}</span>
            <button data-testid="open-btn" onClick={open}>
              Open
            </button>
            <button data-testid="close-btn" onClick={close}>
              Close
            </button>
          </div>
        );
      };

      render(
        <RawDataModalProvider>
          <TestComponent />
        </RawDataModalProvider>
      );

      expect(screen.getByTestId("is-open")).toHaveTextContent("closed");
      expect(screen.getByTestId("open-btn")).toBeInTheDocument();
      expect(screen.getByTestId("close-btn")).toBeInTheDocument();
    });
  });

  describe("useRawDataModal hook", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RawDataModalProvider>{children}</RawDataModalProvider>
    );

    it("should return context with initial values", () => {
      const { result } = renderHook(() => useRawDataModal(), { wrapper });

      expect(result.current.isOpen).toBe(false);
      expect(typeof result.current.open).toBe("function");
      expect(typeof result.current.close).toBe("function");
    });

    it("should update isOpen to true when open is called", () => {
      const { result } = renderHook(() => useRawDataModal(), { wrapper });

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it("should update isOpen to false when close is called", () => {
      const { result } = renderHook(() => useRawDataModal(), { wrapper });

      // First open the modal
      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it("should maintain correct state through multiple open/close cycles", () => {
      const { result } = renderHook(() => useRawDataModal(), { wrapper });

      // Initial state
      expect(result.current.isOpen).toBe(false);

      // Open -> Close -> Open
      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
    });

    it("should throw error when used outside of provider", () => {
      // Mock console.error to prevent error output in tests
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      try {
        renderHook(() => useRawDataModal());
      } catch (error) {
        expect(error).toEqual(
          new Error(
            "useRawDataModal must be used within a RawDataModalProvider"
          )
        );
      }

      consoleErrorSpy.mockRestore();
    });

    it("should maintain referential stability of functions", () => {
      const { result, rerender } = renderHook(() => useRawDataModal(), {
        wrapper,
      });

      const firstOpen = result.current.open;
      const firstClose = result.current.close;

      rerender();

      expect(result.current.open).toBe(firstOpen);
      expect(result.current.close).toBe(firstClose);
    });

    it("should log correct messages when opening and closing", () => {
      const { result } = renderHook(() => useRawDataModal(), { wrapper });

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });
    });
  });
});
