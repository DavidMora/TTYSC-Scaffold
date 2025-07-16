import { renderHook, act } from "@testing-library/react";
import { useSequentialNaming } from "@/hooks/useSequentialNaming";

describe("useSequentialNaming", () => {
  it("should handle numbers beyond 20", () => {
    const { result } = renderHook(() =>
      useSequentialNaming({ initialCounter: 21 })
    );

    expect(result.current.currentName).toBe("Analysis 21");

    act(() => {
      result.current.generateNextName();
    });

    expect(result.current.currentName).toBe("Analysis 22");
  });

  it("should reset counter correctly", () => {
    const { result } = renderHook(() =>
      useSequentialNaming({ initialCounter: 5 })
    );

    expect(result.current.counter).toBe(5);
    expect(result.current.currentName).toBe("Analysis Five");

    act(() => {
      result.current.resetCounter();
    });

    expect(result.current.counter).toBe(1);
    expect(result.current.currentName).toBe("Analysis One");
  });

  it("should set custom name", () => {
    const { result } = renderHook(() => useSequentialNaming());

    act(() => {
      result.current.setCustomName("My Custom Analysis");
    });

    expect(result.current.currentName).toBe("My Custom Analysis");
    expect(result.current.counter).toBe(1);
  });
});
