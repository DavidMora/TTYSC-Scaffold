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
});
