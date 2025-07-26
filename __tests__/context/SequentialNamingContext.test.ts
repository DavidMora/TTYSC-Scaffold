import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from "@/contexts/SequentialNamingContext";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useSequentialNaming", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.clear.mockClear();
    // Reset localStorage to simulate fresh state
    localStorageMock.getItem.mockReturnValue(null);
  });

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => {
      return React.createElement(SequentialNamingProvider, null, children);
    };
    Wrapper.displayName = "TestWrapper";
    return Wrapper;
  };

  it("should handle numbers beyond 20", () => {
    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    for (let i = 1; i <= 20; i++) {
      act(() => {
        result.current.generateAnalysisName();
      });
    }

    expect(result.current.currentCounter).toBe(21);

    act(() => {
      result.current.generateAnalysisName();
    });

    expect(result.current.currentCounter).toBe(22);
  });

  it("should throw error when used outside of provider", () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useSequentialNaming());
    }).toThrow(
      "useSequentialNaming must be used within a SequentialNamingProvider"
    );

    consoleSpy.mockRestore();
  });

  it("should start with counter 1 when localStorage is empty", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it("should start with counter 1 when localStorage returns invalid number", () => {
    localStorageMock.getItem.mockReturnValue("invalid");

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);
  });

  it("should start with counter from localStorage when valid", () => {
    localStorageMock.getItem.mockReturnValue("5");

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(5);
  });

  it("should generate correct ordinal names for numbers 1-20", () => {
    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    const expectedNames = [
      "Analysis One",
      "Analysis Two",
      "Analysis Three",
      "Analysis Four",
      "Analysis Five",
      "Analysis Six",
      "Analysis Seven",
      "Analysis Eight",
      "Analysis Nine",
      "Analysis Ten",
      "Analysis Eleven",
      "Analysis Twelve",
      "Analysis Thirteen",
      "Analysis Fourteen",
      "Analysis Fifteen",
      "Analysis Sixteen",
      "Analysis Seventeen",
      "Analysis Eighteen",
      "Analysis Nineteen",
      "Analysis Twenty",
    ];

    for (let i = 0; i < 20; i++) {
      act(() => {
        const name = result.current.generateAnalysisName();
        expect(name).toBe(expectedNames[i]);
      });
    }
  });

  it("should generate numeric names for numbers beyond 20", () => {
    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    // Generate 20 names first to get to counter 21
    for (let i = 0; i < 20; i++) {
      act(() => {
        result.current.generateAnalysisName();
      });
    }

    // Now test numbers beyond 20
    act(() => {
      const name = result.current.generateAnalysisName();
      expect(name).toBe("Analysis 21");
    });

    act(() => {
      const name = result.current.generateAnalysisName();
      expect(name).toBe("Analysis 22");
    });
  });

  it("should save counter to localStorage when generating names", () => {
    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.generateAnalysisName();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "sequentialNamingCounter",
      "2"
    );

    act(() => {
      result.current.generateAnalysisName();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "sequentialNamingCounter",
      "3"
    );
  });

  it("should handle server-side rendering (no window object)", () => {
    // Mock window as undefined to simulate SSR
    const originalWindow = global.window;
    // @ts-expect-error - Intentionally deleting window for SSR test
    delete global.window;

    const { result } = renderHook(() => useSequentialNaming(), {
      wrapper: createWrapper(),
    });

    expect(result.current.currentCounter).toBe(1);

    // Test that generateAnalysisName works without localStorage in SSR
    act(() => {
      const name = result.current.generateAnalysisName();
      expect(name).toBe("Analysis One");
    });

    // Restore window
    global.window = originalWindow;
  });
});
