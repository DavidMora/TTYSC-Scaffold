import { DataFetcher } from "../../../src/lib/api";
import {
  DataFetcherAdapter,
  DataFetcherKey,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../../../src/lib/types/api/data-fetcher";
import { HttpClientResponse } from "../../../src/lib/types/api/http-client";

// Enhanced test adapter that captures the key for verification
class TestArrayDataFetcherAdapter implements DataFetcherAdapter {
  private capturedKey: DataFetcherKey | null = null;
  private mockResponse: DataFetcherResponse<unknown> = {
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: jest.fn(),
  };

  setMockResponse<T>(response: DataFetcherResponse<T>) {
    this.mockResponse = response as DataFetcherResponse<unknown>;
  }

  getCapturedKey(): DataFetcherKey | null {
    return this.capturedKey;
  }

  fetchData<T = unknown>(
    key: DataFetcherKey,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fetcher: () => Promise<HttpClientResponse<T>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: DataFetcherOptions
  ): DataFetcherResponse<T> {
    this.capturedKey = key;
    return this.mockResponse as DataFetcherResponse<T>;
  }
}

describe("DataFetcher with Array Keys", () => {
  let dataFetcher: DataFetcher;
  let mockAdapter: TestArrayDataFetcherAdapter;
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    mockAdapter = new TestArrayDataFetcherAdapter();
    dataFetcher = new DataFetcher(mockAdapter);
    mockFetcher = jest.fn();
  });

  describe("array key support", () => {
    it("should accept string keys (backward compatibility)", () => {
      const key = "simple-string-key";

      dataFetcher.fetchData(key, mockFetcher);

      expect(mockAdapter.getCapturedKey()).toBe(key);
    });

    it("should accept array keys with mixed types", () => {
      const key = ["users", 123, { active: true }];

      dataFetcher.fetchData(key, mockFetcher);

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });

    it("should accept array keys with primitive values", () => {
      const key = ["products", "category", "electronics", 1, true];

      dataFetcher.fetchData(key, mockFetcher);

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });

    it("should accept array keys with nested objects", () => {
      const filters = {
        category: "electronics",
        priceRange: [0, 1000],
        inStock: true,
      };
      const key = ["products", "filtered", filters];

      dataFetcher.fetchData(key, mockFetcher);

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });

    it("should accept empty array as key", () => {
      const key: readonly unknown[] = [];

      dataFetcher.fetchData(key, mockFetcher);

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });

    it("should preserve key immutability", () => {
      const originalKey = ["users", 123] as const;

      dataFetcher.fetchData(originalKey, mockFetcher);

      const capturedKey = mockAdapter.getCapturedKey();
      expect(capturedKey).toEqual(originalKey);
      // Ensure the key reference is maintained
      expect(capturedKey).toBe(originalKey);
    });
  });

  describe("reactive parameter simulation", () => {
    it("should handle changing user ID scenario", () => {
      // Simulate useState-like behavior
      let userId = 1;

      // First call
      dataFetcher.fetchData(["user", userId], mockFetcher);
      expect(mockAdapter.getCapturedKey()).toEqual(["user", 1]);

      // Simulate state change
      userId = 2;
      dataFetcher.fetchData(["user", userId], mockFetcher);
      expect(mockAdapter.getCapturedKey()).toEqual(["user", 2]);
    });

    it("should handle complex filter objects", () => {
      const baseFilters = { category: "electronics" };

      // First call with basic filters
      dataFetcher.fetchData(["products", baseFilters], mockFetcher);
      expect(mockAdapter.getCapturedKey()).toEqual(["products", baseFilters]);

      // Simulate filter update
      const updatedFilters = { ...baseFilters, inStock: true };
      dataFetcher.fetchData(["products", updatedFilters], mockFetcher);
      expect(mockAdapter.getCapturedKey()).toEqual([
        "products",
        updatedFilters,
      ]);
    });

    it("should handle pagination parameters", () => {
      let page = 1;
      const pageSize = 10;

      // First page
      dataFetcher.fetchData(
        ["products", "paginated", page, pageSize],
        mockFetcher
      );
      expect(mockAdapter.getCapturedKey()).toEqual([
        "products",
        "paginated",
        1,
        10,
      ]);

      // Next page
      page = 2;
      dataFetcher.fetchData(
        ["products", "paginated", page, pageSize],
        mockFetcher
      );
      expect(mockAdapter.getCapturedKey()).toEqual([
        "products",
        "paginated",
        2,
        10,
      ]);
    });
  });

  describe("type safety", () => {
    it("should accept readonly arrays", () => {
      const key = ["readonly", "key"] as const;

      expect(() => {
        dataFetcher.fetchData(key, mockFetcher);
      }).not.toThrow();

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });

    it("should accept mutable arrays", () => {
      const key = ["mutable", "key"];

      expect(() => {
        dataFetcher.fetchData(key, mockFetcher);
      }).not.toThrow();

      expect(mockAdapter.getCapturedKey()).toEqual(key);
    });
  });
});
