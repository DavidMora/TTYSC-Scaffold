import { renderHook, act } from "@testing-library/react";
import { useSequentialNaming } from "@/hooks/useSequentialNaming";

describe("useSequentialNaming", () => {
  it("should handle numbers beyond 20", () => {
    const { result } = renderHook(() => useSequentialNaming());

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

  it("should reset counter correctly", () => {
    const { result } = renderHook(() => useSequentialNaming());

    for (let i = 1; i <= 4; i++) {
      act(() => {
        result.current.generateAnalysisName();
      });
    }

    expect(result.current.currentCounter).toBe(5);

    let generatedName: string;
    act(() => {
      generatedName = result.current.generateAnalysisName();
    });

    expect(generatedName!).toBe("Analysis Five");
    expect(result.current.currentCounter).toBe(6);
  });

  it("should generate sequential names", () => {
    const { result } = renderHook(() => useSequentialNaming());

    expect(result.current.currentCounter).toBe(1);

    let firstAnalysisName: string;
    act(() => {
      firstAnalysisName = result.current.generateAnalysisName();
    });

    expect(firstAnalysisName!).toBe("Analysis One");
    expect(result.current.currentCounter).toBe(2);

    let secondAnalysisName: string;
    act(() => {
      secondAnalysisName = result.current.generateAnalysisName();
    });

    expect(secondAnalysisName!).toBe("Analysis Two");
    expect(result.current.currentCounter).toBe(3);
  });
});
