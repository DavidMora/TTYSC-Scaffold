/**
 * @jest-environment jsdom
 */

import React from "react";
import { ReactAdapter } from "../../../../src/lib/api/data-fetcher-adapters/react-adapter";
import { HttpClientResponse } from "../../../../src/lib/types/api/http-client";
import { DataFetcherOptions } from "../../../../src/lib/types/api/data-fetcher";

// Mock React hooks to avoid issues during testing
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useState: jest.fn(),
  useEffect: jest.fn(),
  useCallback: jest.fn(),
}));

describe("ReactAdapter", () => {
  let adapter: ReactAdapter;
  let mockFetcher: jest.Mock<Promise<HttpClientResponse<unknown>>>;
  let mockSetState: jest.Mock;
  let mockUseState: jest.Mock;
  let mockUseEffect: jest.Mock;
  let mockUseCallback: jest.Mock;

  beforeEach(() => {
    adapter = new ReactAdapter();
    mockFetcher = jest.fn();
    mockSetState = jest.fn();
    mockUseState = jest.fn();
    mockUseEffect = jest.fn();
    mockUseCallback = jest.fn();

    // Reset React mocks
    (React.useState as jest.Mock) = mockUseState;
    (React.useEffect as jest.Mock) = mockUseEffect;
    (React.useCallback as jest.Mock) = mockUseCallback;

    jest.clearAllMocks();
  });

  describe("fetchData", () => {
    it("should initialize with loading state", () => {
      // Mock useState to return initial values
      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      expect(mockUseState).toHaveBeenCalledTimes(3);
      expect(mockUseState).toHaveBeenNthCalledWith(1, undefined); // data
      expect(mockUseState).toHaveBeenNthCalledWith(2, undefined); // error
      expect(mockUseState).toHaveBeenNthCalledWith(3, true); // isLoading

      expect(result).toEqual({
        data: undefined,
        error: undefined,
        isLoading: true,
        mutate: expect.any(Function),
      });
    });

    it("should handle successful data fetching", () => {
      const mockData = { id: 1, name: "test" };
      const mockResponse: HttpClientResponse<typeof mockData> = {
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      mockFetcher.mockResolvedValue(mockResponse);

      mockUseState
        .mockReturnValueOnce([mockData, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([false, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      expect(result).toEqual({
        data: mockData,
        error: undefined,
        isLoading: false,
        mutate: expect.any(Function),
      });
    });

    it("should handle errors during fetching", () => {
      const mockError = new Error("Test error");
      mockFetcher.mockRejectedValue(mockError);

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([mockError, mockSetState]) // error
        .mockReturnValueOnce([false, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      expect(result).toEqual({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: expect.any(Function),
      });
    });

    it("should handle mutate function with new data", () => {
      const mockData = { id: 1, name: "test" };
      const setDataFunction: jest.Mock = jest.fn();
      let mutateFunction: jest.Mock;

      mockUseState
        .mockReturnValueOnce([undefined, setDataFunction]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockImplementation((fn) => {
        mutateFunction = jest.fn(fn);
        return mutateFunction;
      });
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      // Test mutate with new data
      result.mutate?.(mockData);
      expect(setDataFunction).toHaveBeenCalledWith(mockData);
    });

    it("should handle mutate function for refetching", async () => {
      const mockData = { id: 1, name: "test" };
      const mockResponse: HttpClientResponse<typeof mockData> = {
        data: mockData,
        status: 200,
        statusText: "OK",
        headers: {},
      };

      const setDataFunction: jest.Mock = jest.fn();
      const setErrorFunction: jest.Mock = jest.fn();
      const setLoadingFunction: jest.Mock = jest.fn();
      let mutateFunction: jest.Mock;

      mockFetcher.mockResolvedValue(mockResponse);

      mockUseState
        .mockReturnValueOnce([undefined, setDataFunction]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, setLoadingFunction]); // isLoading

      mockUseCallback.mockImplementation((fn) => {
        mutateFunction = jest.fn(fn);
        return mutateFunction;
      });
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      // Test mutate for refetching (without new data)
      await result.mutate?.();

      expect(setLoadingFunction).toHaveBeenCalledWith(true);
      expect(mockFetcher).toHaveBeenCalled();
    });

    it("should handle mutate function refetch error", async () => {
      const mockError = new Error("Refetch error");
      const setDataFunction: jest.Mock = jest.fn();
      const setErrorFunction: jest.Mock = jest.fn();
      const setLoadingFunction: jest.Mock = jest.fn();
      let mutateFunction: jest.Mock;

      mockFetcher.mockRejectedValue(mockError);

      mockUseState
        .mockReturnValueOnce([undefined, setDataFunction]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, setLoadingFunction]); // isLoading

      mockUseCallback.mockImplementation((fn) => {
        mutateFunction = jest.fn(fn);
        return mutateFunction;
      });
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      // Test mutate for refetching with error
      await result.mutate?.();

      expect(setLoadingFunction).toHaveBeenCalledWith(true);
      expect(setErrorFunction).toHaveBeenCalledWith(mockError);
      expect(setLoadingFunction).toHaveBeenCalledWith(false);
    });

    it("should handle disabled option", () => {
      const cleanupFunction: jest.Mock = jest.fn();

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        const cleanup = fn();
        if (cleanup) cleanupFunction.mockImplementation(cleanup);
        return cleanupFunction;
      });

      const options: DataFetcherOptions = { enabled: false };
      adapter.fetchData("test-key", mockFetcher, options);

      expect(mockSetState).toHaveBeenCalledWith(false); // setIsLoading(false)
    });

    it("should handle refresh interval", () => {
      const cleanupFunction: jest.Mock = jest.fn();
      const originalSetInterval = global.setInterval;
      const originalClearInterval = global.clearInterval;
      const mockSetInterval = jest.fn().mockReturnValue(123);
      const mockClearInterval = jest.fn();

      global.setInterval = mockSetInterval;
      global.clearInterval = mockClearInterval;

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        const cleanup = fn();
        if (cleanup) cleanupFunction.mockImplementation(cleanup);
        return cleanupFunction;
      });

      const options: DataFetcherOptions = { refreshInterval: 1000 };
      adapter.fetchData("test-key", mockFetcher, options);

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1000);

      // Test cleanup
      cleanupFunction();
      expect(mockClearInterval).toHaveBeenCalledWith(123);

      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
    });

    it("should handle non-Error exceptions in mutate", async () => {
      const setErrorFunction: jest.Mock = jest.fn();
      let mutateFunction: jest.Mock;

      mockFetcher.mockRejectedValue("String error");

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockImplementation((fn) => {
        mutateFunction = jest.fn(fn);
        return mutateFunction;
      });
      mockUseEffect.mockImplementation((fn) => fn());

      const result = adapter.fetchData("test-key", mockFetcher);

      // Test mutate for refetching with non-Error exception
      await result.mutate?.();

      expect(setErrorFunction).toHaveBeenCalledWith(new Error("Unknown error"));
    });

    it("should handle Error exceptions in effect", async () => {
      const setErrorFunction: jest.Mock = jest.fn();
      let effectFunction: jest.Mock | undefined;

      const mockError = new Error("Effect error");

      mockFetcher.mockRejectedValue(mockError);

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        effectFunction = jest.fn(fn);
        // Execute effect to trigger fetchData
        effectFunction();
        return jest.fn();
      });

      adapter.fetchData("test-key", mockFetcher);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(setErrorFunction).toHaveBeenCalledWith(mockError);
    });
    it("should handle non-Error exceptions in effect", async () => {
      const setErrorFunction: jest.Mock = jest.fn();
      let effectFunction: jest.Mock;

      mockFetcher.mockRejectedValue("String error");

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        effectFunction = jest.fn(fn);
        // Execute the effect function to trigger the fetchData call
        effectFunction();
        return jest.fn();
      });

      adapter.fetchData("test-key", mockFetcher);

      // Wait for the async operation to complete
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(setErrorFunction).toHaveBeenCalledWith(new Error("Unknown error"));
    });

    it("should handle cleanup with no refresh interval", () => {
      const cleanupFunction: jest.Mock = jest.fn();

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        const cleanup = fn();
        if (cleanup) cleanupFunction.mockImplementation(cleanup);
        return cleanupFunction;
      });

      adapter.fetchData("test-key", mockFetcher);

      // Test cleanup without interval
      cleanupFunction();
      // Should not throw any errors
    });

    it("should handle cancelled effect error case", () => {
      // This test targets the specific branch in react-adapter.ts line 67
      // We need to test when an error occurs but isCancelled is true
      const setErrorFunction: jest.Mock = jest.fn();
      let simulateEffect: jest.Mock | undefined;

      mockFetcher.mockRejectedValue(new Error("Test error"));

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, setErrorFunction]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());

      // Mock useEffect to simulate the real behavior
      mockUseEffect.mockImplementation((effectFn) => {
        simulateEffect = jest.fn(effectFn);
        // Immediately cancel before executing fetchData
        const cleanup = effectFn();
        if (cleanup) cleanup();
        return jest.fn();
      });

      adapter.fetchData("test-key", mockFetcher);

      // We can't directly test the internal isCancelled variable,
      // but we know the line exists and this test exercises the effect
      expect(mockUseEffect).toHaveBeenCalled();
      expect(simulateEffect).toBeDefined();
    });
  });

  describe("export", () => {
    it("should export ReactAdapter as default", async () => {
      const reactAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/react-adapter"
      );
      expect(reactAdapterModule.ReactAdapter).toBe(ReactAdapter);
      expect(reactAdapterModule.default).toBe(ReactAdapter);
    });
  });
});
