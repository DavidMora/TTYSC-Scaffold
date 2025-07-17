import { MockAdapter } from "../../../../src/lib/api/data-fetcher-adapters/mock-adapter";
import { HttpClientResponse } from "../../../../src/lib/types/api/http-client";
import { DataFetcherOptions } from "../../../../src/lib/types/api/data-fetcher";

describe("MockAdapter", () => {
  let adapter: MockAdapter;
  let mockFetcher: jest.Mock<Promise<HttpClientResponse<unknown>>>;

  beforeEach(() => {
    adapter = new MockAdapter();
    mockFetcher = jest.fn();
  });

  describe("fetchData", () => {
    it("should return mock response with loading state", () => {
      const result = adapter.fetchData("test-key", mockFetcher);

      expect(result).toEqual({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: expect.any(Function),
      });
    });

    it("should not call the fetcher function", () => {
      adapter.fetchData("test-key", mockFetcher);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it("should ignore options parameter", () => {
      const options: DataFetcherOptions = {
        enabled: false,
        retry: 3,
        refreshInterval: 1000,
      };

      const result = adapter.fetchData("test-key", mockFetcher, options);

      expect(result.isLoading).toBe(true);
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it("should provide a mutate function", () => {
      const result = adapter.fetchData("test-key", mockFetcher);

      expect(result.mutate).toBeDefined();
      expect(typeof result.mutate).toBe("function");

      // Should not throw when called
      if (result.mutate) {
        expect(() => result.mutate!()).not.toThrow();
      }
    });

    it("should work with generic types", () => {
      interface TestData {
        id: number;
        name: string;
      }

      const typedFetcher: jest.Mock<Promise<HttpClientResponse<TestData[]>>> =
        jest.fn();
      const result = adapter.fetchData<TestData[]>("test-key", typedFetcher);

      expect(result).toEqual({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: expect.any(Function),
      });
    });

    it("should handle different key values", () => {
      const result1 = adapter.fetchData("key1", mockFetcher);
      const result2 = adapter.fetchData("key2", mockFetcher);

      // Should have same structure but different function instances
      expect(result1.data).toEqual(result2.data);
      expect(result1.error).toEqual(result2.error);
      expect(result1.isLoading).toEqual(result2.isLoading);
      expect(result1.isValidating).toEqual(result2.isValidating);
      expect(typeof result1.mutate).toBe("function");
      expect(typeof result2.mutate).toBe("function");
      expect(mockFetcher).not.toHaveBeenCalled();
    });
  });

  describe("export", () => {
    it("should export MockAdapter as default", async () => {
      const mockAdapterModule = await import(
        "../../../../src/lib/api/data-fetcher-adapters/mock-adapter"
      );
      expect(mockAdapterModule.default).toBe(MockAdapter);
    });
  });
});
