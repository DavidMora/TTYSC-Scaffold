import { TanStackQueryAdapter } from "../../../../src/lib/api/data-fetcher-adapters/tanstack-query-adapter";
import { HttpClientResponse } from "../../../../src/lib/types/api/http-client";
import { useQuery } from "@tanstack/react-query";

// Mock @tanstack/react-query
jest.mock("@tanstack/react-query");

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

describe("TanStackQueryAdapter", () => {
  let adapter: TanStackQueryAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new TanStackQueryAdapter();
  });

  it("should create an instance successfully", () => {
    expect(adapter).toBeInstanceOf(TanStackQueryAdapter);
  });

  it("should be exportable for conditional usage", () => {
    expect(TanStackQueryAdapter).toBeDefined();
    expect(typeof TanStackQueryAdapter).toBe("function");
  });

  it("should test the adapter with mocked TanStack Query", () => {
    const mockResponse: HttpClientResponse<unknown> = {
      data: { test: "data" },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: { test: "data" },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const result = adapter.fetchData("test-key", mockFetcher, {
      enabled: true,
      retry: 3,
      refreshInterval: 1000,
      retryDelay: 500,
    });

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ["test-key"],
      queryFn: expect.any(Function),
      enabled: true,
      refetchInterval: 1000,
      retry: 3,
      retryDelay: 500,
    });

    expect(result).toEqual({
      data: { test: "data" },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: expect.any(Function),
    });
  });

  it("should handle different retry configurations", () => {
    const mockFetcher = jest.fn();

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    // Test with retry as boolean
    adapter.fetchData("test-key", mockFetcher, { retry: true });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: 3,
      })
    );

    // Test with retry as number
    adapter.fetchData("test-key", mockFetcher, { retry: 5 });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: 5,
      })
    );

    // Test with retry as false
    adapter.fetchData("test-key", mockFetcher, { retry: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: false,
      })
    );
  });

  it("should handle enabled option", () => {
    const mockFetcher = jest.fn();

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    adapter.fetchData("test-key", mockFetcher, { enabled: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );

    adapter.fetchData("test-key", mockFetcher, { enabled: true });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );

    // Test default enabled
    adapter.fetchData("test-key", mockFetcher);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it("should transform fetcher correctly", async () => {
    const mockResponse: HttpClientResponse<{ id: number }> = {
      data: { id: 123 },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: { id: 123 },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    adapter.fetchData("test-key", mockFetcher);

    // Get the transformed fetcher function
    const call = (mockUseQuery as jest.Mock).mock.calls[0];
    const queryFn = call[0].queryFn;
    const result = await queryFn();

    expect(mockFetcher).toHaveBeenCalled();
    expect(result).toEqual({ id: 123 });
  });

  it("should handle error conversion", () => {
    const mockError = new Error("Test error");
    const mockFetcher = jest.fn();

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const result = adapter.fetchData("test-key", mockFetcher);

    expect(result.error).toBe(mockError);

    // Test null error conversion
    (mockUseQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const result2 = adapter.fetchData("test-key", mockFetcher);
    expect(result2.error).toBeUndefined();
  });

  it("should handle mutate function", () => {
    const mockRefetch = jest.fn();
    const mockFetcher = jest.fn();

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    const result = adapter.fetchData("test-key", mockFetcher);

    result.mutate?.();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("should handle array keys correctly", () => {
    const mockFetcher = jest.fn();

    (mockUseQuery as jest.Mock).mockReturnValue({
      data: { test: "data" },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    // Test with array key
    const arrayKey = ["users", 123, { active: true }];
    adapter.fetchData(arrayKey, mockFetcher);

    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: arrayKey,
      queryFn: expect.any(Function),
      enabled: true,
      refetchInterval: undefined,
      retry: false,
      retryDelay: undefined,
    });
  });

  describe("export", () => {
    it("should export TanStackQueryAdapter as default", async () => {
      const tanstackAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/tanstack-query-adapter"
      );
      expect(tanstackAdapterModule.default).toBe(TanStackQueryAdapter);
    });
  });
});
