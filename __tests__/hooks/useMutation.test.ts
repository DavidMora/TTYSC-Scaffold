import { renderHook, act } from "@testing-library/react";
import { useMutation } from "@/hooks/useMutation";
import { mutate } from "swr";

jest.mock("swr", () => ({ mutate: jest.fn() }));

const mockMutate = mutate as jest.MockedFunction<typeof mutate>;

describe("useMutation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useMutation(jest.fn()));

    expect(result.current).toEqual({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: expect.any(Function),
      reset: expect.any(Function),
    });
  });

  it("should handle successful mutation", async () => {
    const mockMutationFn = jest.fn().mockResolvedValue("success");
    const mockOnSuccess = jest.fn();
    const { result } = renderHook(() => useMutation(mockMutationFn, { onSuccess: mockOnSuccess }));

    await act(() => result.current.mutate("test-variables"));

    expect(mockMutationFn).toHaveBeenCalledWith("test-variables");
    expect(result.current.data).toBe("success");
    expect(result.current.error).toBeNull();
    expect(mockOnSuccess).toHaveBeenCalledWith("success");
  });

  it("should handle mutation error", async () => {
    const mockError = new Error("Mutation failed");
    const mockOnError = jest.fn();
    const { result } = renderHook(() => 
      useMutation(jest.fn().mockRejectedValue(mockError), { onError: mockOnError })
    );

    await act(async () => {
      try {
        await result.current.mutate("test-variables");
      } catch {}
    });

    expect(result.current.error).toBe(mockError);
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it("should handle non-Error objects as errors", async () => {
    const mockOnError = jest.fn();
    const { result } = renderHook(() => 
      useMutation(jest.fn().mockRejectedValue("string error"), { onError: mockOnError })
    );

    await act(async () => {
      try {
        await result.current.mutate("test-variables");
      } catch {}
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Mutation failed");
    expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should invalidate queries on success", async () => {
    const { result } = renderHook(() => 
      useMutation(jest.fn().mockResolvedValue("success"), {
        invalidateQueries: ["query1", "query2"],
      })
    );

    await act(() => result.current.mutate("test-variables"));

    expect(mockMutate).toHaveBeenCalledTimes(2);
    expect(mockMutate).toHaveBeenCalledWith("query1");
    expect(mockMutate).toHaveBeenCalledWith("query2");
  });

  it("should reset state correctly", async () => {
    const { result } = renderHook(() => useMutation(jest.fn().mockResolvedValue("success")));

    await act(() => result.current.mutate("test-variables"));
    expect(result.current.data).toBe("success");

    act(() => result.current.reset());

    expect(result.current).toEqual({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: expect.any(Function),
      reset: expect.any(Function),
    });
  });
});
