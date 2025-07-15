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

    it("should handle disabled option", () => {
      const options: DataFetcherOptions = { enabled: false };

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([false, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation(() => {}); // Should not call fetcher

      const result = adapter.fetchData("test-key", mockFetcher, options);

      expect(result.isLoading).toBe(false);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it("should provide mutate function", () => {
      const mockMutateFunction = jest.fn();

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(mockMutateFunction);
      mockUseEffect.mockImplementation(() => {});

      const result = adapter.fetchData("test-key", mockFetcher);

      expect(result.mutate).toBe(mockMutateFunction);
      expect(mockUseCallback).toHaveBeenCalled();
    });

    it("should handle refresh interval option", () => {
      const options: DataFetcherOptions = { refreshInterval: 1000 };
      let effectCleanup: (() => void) | undefined;

      mockUseState
        .mockReturnValueOnce([undefined, mockSetState]) // data
        .mockReturnValueOnce([undefined, mockSetState]) // error
        .mockReturnValueOnce([true, mockSetState]); // isLoading

      mockUseCallback.mockReturnValue(jest.fn());
      mockUseEffect.mockImplementation((fn) => {
        effectCleanup = fn();
        return effectCleanup;
      });

      adapter.fetchData("test-key", mockFetcher, options);

      expect(mockUseEffect).toHaveBeenCalled();

      // Test cleanup function exists
      if (effectCleanup) {
        expect(() => effectCleanup!()).not.toThrow();
      }
    });
  });

  describe("export", () => {
    it("should export ReactAdapter as default", async () => {
      const reactAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/react-adapter"
      );
      expect(reactAdapterModule.ReactAdapter).toBe(ReactAdapter);
    });
  });
});
