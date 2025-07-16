import { SWRAdapter } from "../../../../src/lib/api/data-fetcher-adapters/swr-adapter";
import { HttpClientResponse } from "../../../../src/lib/types/api/http-client";

describe("SWRAdapter", () => {
  let adapter: SWRAdapter;

  beforeEach(() => {
    adapter = new SWRAdapter();
  });

  describe("constructor", () => {
    it("should create adapter instance", () => {
      expect(adapter).toBeInstanceOf(SWRAdapter);
    });
  });

  describe("fetchData", () => {
    it("should throw error when SWR is not installed", () => {
      const mockFetcher = jest.fn();

      expect(() => {
        adapter.fetchData("test-key", mockFetcher);
      }).toThrow("SWRAdapter requires SWR to be installed. Run: yarn add swr");
    });

    it("should accept all required parameters", () => {
      const mockFetcher = jest.fn();
      const options = {
        enabled: true,
        retry: 3,
        refreshInterval: 1000,
      };

      expect(() => {
        adapter.fetchData("test-key", mockFetcher, options);
      }).toThrow(); // Should throw the SWR not installed error
    });

    it("should test the adapter with mocked SWR", () => {
      // Create a mock SWR adapter that doesn't throw
      const mockUseSWR = jest.fn();
      const swrAdapter = new (class extends SWRAdapter {
        constructor() {
          super();
          // Override the useSWR property for testing
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).useSWR = mockUseSWR;
        }
      })();

      const mockResponse: HttpClientResponse<unknown> = {
        data: { test: "data" },
        status: 200,
        statusText: "OK",
        headers: {},
      };

      const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

      mockUseSWR.mockReturnValue({
        data: { test: "data" },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      const result = swrAdapter.fetchData("test-key", mockFetcher, {
        enabled: true,
        retry: 3,
        refreshInterval: 1000,
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        retryDelay: 500,
      });

      expect(mockUseSWR).toHaveBeenCalledWith(
        "test-key",
        expect.any(Function),
        expect.objectContaining({
          revalidateOnFocus: true,
          revalidateOnReconnect: true,
          refreshInterval: 1000,
          dedupingInterval: 2000,
          errorRetryCount: 3,
          errorRetryInterval: 500,
          isPaused: expect.any(Function),
        })
      );

      expect(result).toEqual({
        data: { test: "data" },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: expect.any(Function),
      });
    });

    it("should handle different retry configurations", () => {
      const mockUseSWR = jest.fn();
      const swrAdapter = new (class extends SWRAdapter {
        constructor() {
          super();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).useSWR = mockUseSWR;
        }
      })();

      const mockFetcher = jest.fn();

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      });

      // Test with retry as boolean
      swrAdapter.fetchData("test-key", mockFetcher, { retry: true });
      expect(mockUseSWR).toHaveBeenCalledWith(
        "test-key",
        expect.any(Function),
        expect.objectContaining({
          errorRetryCount: 3,
        })
      );

      // Test with retry as number
      swrAdapter.fetchData("test-key", mockFetcher, { retry: 5 });
      expect(mockUseSWR).toHaveBeenCalledWith(
        "test-key",
        expect.any(Function),
        expect.objectContaining({
          errorRetryCount: 5,
        })
      );

      // Test with retry as false
      swrAdapter.fetchData("test-key", mockFetcher, { retry: false });
      expect(mockUseSWR).toHaveBeenCalledWith(
        "test-key",
        expect.any(Function),
        expect.objectContaining({
          errorRetryCount: 0,
        })
      );
    });

    it("should handle isPaused function", () => {
      const mockUseSWR = jest.fn();
      const swrAdapter = new (class extends SWRAdapter {
        constructor() {
          super();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).useSWR = mockUseSWR;
        }
      })();

      const mockFetcher = jest.fn();

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      swrAdapter.fetchData("test-key", mockFetcher, { enabled: false });

      const callArgs = mockUseSWR.mock.calls[0][2];
      expect(callArgs.isPaused()).toBe(true);

      swrAdapter.fetchData("test-key", mockFetcher, { enabled: true });
      const callArgs2 = mockUseSWR.mock.calls[1][2];
      expect(callArgs2.isPaused()).toBe(false);
    });

    it("should transform fetcher correctly", async () => {
      const mockUseSWR = jest.fn();
      const swrAdapter = new (class extends SWRAdapter {
        constructor() {
          super();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (this as any).useSWR = mockUseSWR;
        }
      })();

      const mockResponse: HttpClientResponse<{ id: number }> = {
        data: { id: 123 },
        status: 200,
        statusText: "OK",
        headers: {},
      };

      const mockFetcher = jest.fn().mockResolvedValue(mockResponse);

      mockUseSWR.mockReturnValue({
        data: { id: 123 },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      });

      swrAdapter.fetchData("test-key", mockFetcher);

      // Get the transformed fetcher function
      const transformedFetcher = mockUseSWR.mock.calls[0][1];
      const result = await transformedFetcher();

      expect(mockFetcher).toHaveBeenCalled();
      expect(result).toEqual({ id: 123 });
    });
  });

  describe("export", () => {
    it("should export SWRAdapter as default", async () => {
      const swrAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/swr-adapter"
      );
      expect(swrAdapterModule.default).toBe(SWRAdapter);
    });

    it("should be exportable for conditional usage", () => {
      expect(SWRAdapter).toBeDefined();
      expect(typeof SWRAdapter).toBe("function");
    });
  });
});
