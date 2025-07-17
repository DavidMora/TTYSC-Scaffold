import { DataFetcher } from "../../../src/lib/api";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
} from "../../../src/lib/types/api/data-fetcher";
import { HttpClientResponse } from "../../../src/lib/types/api/http-client";

// Mock adapter for testing
class TestDataFetcherAdapter implements DataFetcherAdapter {
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

  fetchData<T = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _key: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _fetcher: () => Promise<HttpClientResponse<T>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: DataFetcherOptions
  ): DataFetcherResponse<T> {
    return this.mockResponse as DataFetcherResponse<T>;
  }
}

describe("DataFetcher", () => {
  let dataFetcher: DataFetcher;
  let mockAdapter: TestDataFetcherAdapter;
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    mockAdapter = new TestDataFetcherAdapter();
    dataFetcher = new DataFetcher(mockAdapter);
    mockFetcher = jest.fn();
  });

  describe("constructor", () => {
    it("should use MockAdapter by default when no adapter is provided", () => {
      const defaultDataFetcher = new DataFetcher();
      expect(defaultDataFetcher).toBeInstanceOf(DataFetcher);
    });

    it("should use provided adapter", () => {
      const customDataFetcher = new DataFetcher(mockAdapter);
      expect(customDataFetcher).toBeInstanceOf(DataFetcher);
    });
  });

  describe("fetchData", () => {
    it("should call adapter fetchData method with correct parameters", () => {
      const spy = jest.spyOn(mockAdapter, "fetchData");
      const key = "test-key";
      const options = { enabled: true, retry: 3 };

      dataFetcher.fetchData(key, mockFetcher, options);

      expect(spy).toHaveBeenCalledWith(key, mockFetcher, options);
    });

    it("should call adapter fetchData method without options", () => {
      const spy = jest.spyOn(mockAdapter, "fetchData");
      const key = "test-key";

      dataFetcher.fetchData(key, mockFetcher);

      expect(spy).toHaveBeenCalledWith(key, mockFetcher, undefined);
    });

    it("should return response from adapter", () => {
      const expectedResponse: DataFetcherResponse<unknown> = {
        data: "test-data",
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockAdapter, "fetchData");

      const result = dataFetcher.fetchData("test-key", mockFetcher);

      expect(spy).toHaveBeenCalledWith("test-key", mockFetcher, undefined);
      expect(result.data).toBe("test-data");
    });

    it("should handle error from adapter", () => {
      const expectedResponse: DataFetcherResponse<unknown> = {
        data: undefined,
        error: new Error("Test error"),
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockAdapter, "fetchData");

      const result = dataFetcher.fetchData("test-key", mockFetcher);

      expect(spy).toHaveBeenCalledWith("test-key", mockFetcher, undefined);
      expect(result.error).toEqual(new Error("Test error"));
      expect(result.data).toBeUndefined();
    });

    it("should pass generic type correctly", () => {
      interface TestData {
        id: number;
        name: string;
      }

      const expectedResponse: DataFetcherResponse<TestData[]> = {
        data: [{ id: 1, name: "test" }],
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      };

      mockAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockAdapter, "fetchData");

      const result = dataFetcher.fetchData<TestData[]>("test-key", mockFetcher);

      expect(spy).toHaveBeenCalledWith("test-key", mockFetcher, undefined);
      expect(result.data).toEqual([{ id: 1, name: "test" }]);
    });
  });
});

describe("Default dataFetcher instance", () => {
  it("should be an instance of DataFetcher", async () => {
    const { default: defaultDataFetcher } = await import(
      "../../../src/lib/api/data-fetcher"
    );
    expect(defaultDataFetcher).toBeInstanceOf(DataFetcher);
  });
});
