import { TanStackQueryAdapter } from "../../../../src/lib/api/data-fetcher-adapters/tanstack-query-adapter";
import { HttpClientResponse } from "../../../../src/lib/types/api/http-client";

describe("TanStackQueryAdapter", () => {
  it("should throw error when @tanstack/react-query is not installed", () => {
    expect(() => {
      const adapter = new TanStackQueryAdapter();
      return adapter;
    }).toThrow(
      "TanStackQueryAdapter requires @tanstack/react-query to be installed. Run: yarn add @tanstack/react-query"
    );
  });

  it("should be exportable for conditional usage", () => {
    expect(TanStackQueryAdapter).toBeDefined();
    expect(typeof TanStackQueryAdapter).toBe("function");
  });

  it("should test the adapter with mocked TanStack Query", () => {
    // Mock the adapter methods directly
    const mockUseQuery = jest.fn();
    const mockResponse: HttpClientResponse<unknown> = {
      data: { test: "data" },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

    mockUseQuery.mockReturnValue({
      data: { test: "data" },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    // Create a mock adapter that bypasses the constructor
    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    const result = tanstackAdapter.fetchData("test-key", mockFetcher, {
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
    const mockUseQuery = jest.fn();
    const mockFetcher = jest.fn();

    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: true,
      isFetching: false,
      refetch: jest.fn(),
    });

    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    // Test with retry as boolean
    tanstackAdapter.fetchData("test-key", mockFetcher, { retry: true });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: 3,
      })
    );

    // Test with retry as number
    tanstackAdapter.fetchData("test-key", mockFetcher, { retry: 5 });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: 5,
      })
    );

    // Test with retry as false
    tanstackAdapter.fetchData("test-key", mockFetcher, { retry: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        retry: false,
      })
    );
  });

  it("should handle enabled option", () => {
    const mockUseQuery = jest.fn();
    const mockFetcher = jest.fn();

    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    tanstackAdapter.fetchData("test-key", mockFetcher, { enabled: false });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );

    tanstackAdapter.fetchData("test-key", mockFetcher, { enabled: true });
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );

    // Test default enabled
    tanstackAdapter.fetchData("test-key", mockFetcher);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
  });

  it("should transform fetcher correctly", async () => {
    const mockUseQuery = jest.fn();
    const mockResponse: HttpClientResponse<{ id: number }> = {
      data: { id: 123 },
      status: 200,
      statusText: "OK",
      headers: {},
    };

    const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

    mockUseQuery.mockReturnValue({
      data: { id: 123 },
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    tanstackAdapter.fetchData("test-key", mockFetcher);

    // Get the transformed fetcher function
    const queryFn = mockUseQuery.mock.calls[0][0].queryFn;
    const result = await queryFn();

    expect(mockFetcher).toHaveBeenCalled();
    expect(result).toEqual({ id: 123 });
  });

  it("should handle error conversion", () => {
    const mockUseQuery = jest.fn();
    const mockError = new Error("Test error");
    const mockFetcher = jest.fn();

    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    mockUseQuery.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const result = tanstackAdapter.fetchData("test-key", mockFetcher);

    expect(result.error).toBe(mockError);

    // Test null error conversion
    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const result2 = tanstackAdapter.fetchData("test-key", mockFetcher);
    expect(result2.error).toBeUndefined();
  });

  it("should handle mutate function", () => {
    const mockUseQuery = jest.fn();
    const mockRefetch = jest.fn();
    const mockFetcher = jest.fn();

    const tanstackAdapter = Object.create(TanStackQueryAdapter.prototype);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tanstackAdapter as any).useQuery = mockUseQuery;

    mockUseQuery.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    const result = tanstackAdapter.fetchData("test-key", mockFetcher);

    result.mutate?.();
    expect(mockRefetch).toHaveBeenCalled();
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
