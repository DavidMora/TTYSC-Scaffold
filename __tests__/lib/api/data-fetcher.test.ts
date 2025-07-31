import { DataFetcher } from "../../../src/lib/api";
import {
  DataFetcherAdapter,
  DataFetcherOptions,
  DataFetcherResponse,
  MutationAdapter,
  MutationOptions,
  MutationResponse,
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

// Mock mutation adapter for testing
class TestMutationAdapter implements MutationAdapter {
  private mockResponse: MutationResponse<unknown, unknown> = {
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    data: undefined,
    error: undefined,
    isLoading: false,
    isSuccess: false,
    isError: false,
    isIdle: true,
    reset: jest.fn(),
  };

  setMockResponse<TData, TVariables>(
    response: MutationResponse<TData, TVariables>
  ) {
    this.mockResponse = response as MutationResponse<unknown, unknown>;
  }

  mutateData<TData = unknown, TVariables = unknown>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mutationKey: unknown[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _mutationFn: (variables: TVariables) => Promise<HttpClientResponse<TData>>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: MutationOptions<TData, TVariables>
  ): MutationResponse<TData, TVariables> {
    return this.mockResponse as MutationResponse<TData, TVariables>;
  }
}

describe("DataFetcher", () => {
  let dataFetcher: DataFetcher;
  let mockAdapter: TestDataFetcherAdapter;
  let mockMutationAdapter: TestMutationAdapter;
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    mockAdapter = new TestDataFetcherAdapter();
    mockMutationAdapter = new TestMutationAdapter();
    dataFetcher = new DataFetcher(mockAdapter, mockMutationAdapter);
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

    it("should use provided mutation adapter", () => {
      const customDataFetcher = new DataFetcher(
        mockAdapter,
        mockMutationAdapter
      );
      expect(customDataFetcher).toBeInstanceOf(DataFetcher);
    });

    it("should use default adapters when none provided", () => {
      const defaultDataFetcher = new DataFetcher();
      expect(defaultDataFetcher).toBeInstanceOf(DataFetcher);
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

  describe("mutateData", () => {
    let mockMutationFn: jest.Mock;

    beforeEach(() => {
      mockMutationFn = jest.fn();
    });

    it("should call mutation adapter mutateData method with correct parameters", () => {
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");
      const options = {
        onSuccess: jest.fn(),
        onError: jest.fn(),
      };
      const mutationKey = ["test-key"];

      dataFetcher.mutateData(mutationKey, mockMutationFn, options);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, options);
    });

    it("should call mutation adapter mutateData method without options", () => {
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");
      const mutationKey = ["test-key"];

      dataFetcher.mutateData(mutationKey, mockMutationFn);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, undefined);
    });

    it("should return response from mutation adapter", () => {
      const expectedResponse: MutationResponse<string, { id: number }> = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: "success",
        error: undefined,
        isLoading: false,
        isSuccess: true,
        isError: false,
        isIdle: false,
        reset: jest.fn(),
      };

      mockMutationAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");

      const mutationKey = ["test-key"];
      const result = dataFetcher.mutateData(mutationKey, mockMutationFn);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, undefined);
      expect(result.data).toBe("success");
      expect(result.isSuccess).toBe(true);
    });

    it("should handle error from mutation adapter", () => {
      const expectedResponse: MutationResponse<unknown, unknown> = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: undefined,
        error: new Error("Mutation failed"),
        isLoading: false,
        isSuccess: false,
        isError: true,
        isIdle: false,
        reset: jest.fn(),
      };

      mockMutationAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");

      const mutationKey = ["test-key"];
      const result = dataFetcher.mutateData(mutationKey, mockMutationFn);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, undefined);
      expect(result.error).toEqual(new Error("Mutation failed"));
      expect(result.isError).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it("should pass generic types correctly for mutation", () => {
      interface CreateUserData {
        id: number;
        name: string;
        email: string;
      }

      interface CreateUserVariables {
        name: string;
        email: string;
      }

      const expectedResponse: MutationResponse<
        CreateUserData,
        CreateUserVariables
      > = {
        mutate: jest.fn(),
        mutateAsync: jest.fn(),
        data: { id: 1, name: "John Doe", email: "john@example.com" },
        error: undefined,
        isLoading: false,
        isSuccess: true,
        isError: false,
        isIdle: false,
        reset: jest.fn(),
      };

      mockMutationAdapter.setMockResponse(expectedResponse);
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");

      const mutationKey = ["test-key"];
      const result = dataFetcher.mutateData<
        CreateUserData,
        CreateUserVariables
      >(mutationKey, mockMutationFn);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, undefined);
      expect(result.data).toEqual({
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      });
    });

    it("should handle mutation with invalidateQueries option", () => {
      const spy = jest.spyOn(mockMutationAdapter, "mutateData");
      const options = {
        invalidateQueries: ["users", ["user", 123]],
      };
      const mutationKey = ["test-key"];

      dataFetcher.mutateData(mutationKey, mockMutationFn, options);

      expect(spy).toHaveBeenCalledWith(mutationKey, mockMutationFn, options);
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
