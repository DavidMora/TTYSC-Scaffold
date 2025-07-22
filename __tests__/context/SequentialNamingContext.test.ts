import React from "react";
import { renderHook, act } from "@testing-library/react";
import {
  useSequentialNaming,
  SequentialNamingProvider,
} from "@/contexts/SequentialNamingContext";

describe("useSequentialNaming", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(SequentialNamingProvider, null, children);
  };

  it("should handle numbers beyond 20", () => {
    const { result } = renderHook(() => useSequentialNaming(), { wrapper });

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
});
